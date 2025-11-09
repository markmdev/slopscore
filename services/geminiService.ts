import { GoogleGenAI, Type } from "@google/genai";
import { FeatureClaim, Verdict } from "../types";

// Fetches the README content from a public GitHub URL.
export const fetchReadmeContent = async (repoUrl: string): Promise<string> => {
    console.log(`Fetching README for: ${repoUrl}`);

    const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlParts || urlParts.length < 3) {
        throw new Error("Invalid GitHub repository URL format.");
    }
    const owner = urlParts[1];
    const repo = urlParts[2].replace(/\/$/, ''); // remove trailing slash

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`README file not found in repository '${owner}/${repo}'. Please check the URL and ensure the repository has a README.`);
            }
            throw new Error(`Failed to fetch README. GitHub API responded with status ${response.status}.`);
        }

        const data = await response.json();

        if (data.content) {
            return atob(data.content);
        } else {
            throw new Error("No content found in README API response.");
        }
    } catch (error) {
        console.error("Error fetching README:", error);
        if (error instanceof Error) {
            throw new Error(`Could not fetch README from GitHub. ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching the README.");
    }
};


interface GeminiResponse {
    features: FeatureClaim[];
    overallAssessment: string;
}

const featureSchema = {
    type: Type.OBJECT,
    properties: {
        claim: {
            type: Type.STRING,
            description: 'The original feature claim verbatim from the README.',
        },
        requirement: {
            type: Type.STRING,
            description: 'A testable functional requirement derived from the claim.',
        },
        verificationGuidance: {
            type: Type.STRING,
            description: 'Guidance on how this feature could be programmatically verified.',
        },
    },
    required: ['claim', 'requirement', 'verificationGuidance'],
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        features: {
            type: Type.ARRAY,
            description: 'An array of 5 to 10 extracted, high-level, verifiable features from the README.',
            items: featureSchema,
        },
        overallAssessment: {
            type: Type.STRING,
            description: 'A brief, one-sentence summary of the project\'s primary purpose based on the README.'
        }
    },
    required: ['features', 'overallAssessment'],
};


export const extractFeatures = async (readmeContent: string): Promise<GeminiResponse> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
Analyze the following README file and perform a feature extraction. Your goal is to act as a senior software engineer evaluating the project's claims.

**Instructions:**
1.  Read the README content carefully.
2.  Identify 5-7 core, high-level, and verifiable feature claims.
3.  Focus on differentiating features, not table-stakes items like "responsive design" or "logging".
4.  Ignore subjective marketing language like "blazingly fast" or "enterprise-grade".
5.  For each claim, generate the original claim text, a testable functional requirement, and verification guidance.
6.  Provide a single-sentence overall assessment of the project's stated purpose.
7.  Return the result in the specified JSON format.

**README Content:**
---
${readmeContent}
---
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as GeminiResponse;
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", jsonText);
        throw new Error("Could not parse features from README analysis.");
    }
};


export const fetchRepoFileTree = async (repoUrl: string): Promise<string[]> => {
    const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlParts) throw new Error("Invalid GitHub URL");

    const [_, owner, repo] = urlParts;

    // Get the default branch
    const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoInfoResponse = await fetch(repoInfoUrl);
    if (!repoInfoResponse.ok) throw new Error("Could not fetch repo info");
    const repoInfo = await repoInfoResponse.json();
    const defaultBranch = repoInfo.default_branch;

    // Get the tree recursively
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeResponse = await fetch(treeUrl);
    if (!treeResponse.ok) throw new Error("Could not fetch repo file tree");
    const treeData = await treeResponse.json();

    if (treeData.truncated) {
        console.warn("File tree is truncated. Analysis may be incomplete.");
    }

    return treeData.tree.map((file: { path: string, type: string }) => file.path).filter((path: string) => !path.endsWith('/'));
}

interface VerificationResult {
    verdict: Verdict;
    analysis: string;
    notes: string | null;
}

const verificationSchema = {
    type: Type.OBJECT,
    properties: {
        verdict: {
            type: Type.STRING,
            enum: [Verdict.PASS, Verdict.PARTIAL, Verdict.FAIL, Verdict.CANNOT_VERIFY]
        },
        analysis: {
            type: Type.STRING,
            description: "A summary of the static analysis findings, referencing specific files or code patterns. This is the evidence."
        },
        notes: {
            type: Type.STRING,
            description: "If the verdict is PARTIAL or CANNOT_VERIFY, provide a brief explanation here. Otherwise, null."
        }
    },
    required: ['verdict', 'analysis', 'notes']
};


export const verifyFeature = async (feature: FeatureClaim, fileTree: string[]): Promise<VerificationResult> => {
     if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
You are an automated verification agent performing static code analysis. Your task is to determine if a claimed feature is implemented in a given codebase by examining its file structure.

**Instructions:**
1.  Review the "Testable Requirement".
2.  Examine the "File Tree" provided.
3.  Search for files, directories, or patterns that suggest the feature is implemented.
4.  Formulate a verdict:
    *   **PASS:** Strong evidence of implementation exists.
    *   **PARTIAL:** Some evidence exists, but it seems incomplete or only covers part of the claim.
    *   **FAIL:** No evidence of implementation can be found in the file tree.
    *   **CANNOT_VERIFY:** The feature is impossible to verify via file structure alone (e.g., requires external service access, runtime behavior).
5.  Write a brief "analysis" explaining your reasoning and citing relevant file paths as evidence.
6.  If the verdict is PARTIAL or CANNOT_VERIFY, provide a short note.
7.  Return the result in the specified JSON format.

**Testable Requirement:**
"${feature.requirement}"

**File Tree (first 100 files):**
---
${fileTree.slice(0, 100).join('\n')}
---
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: verificationSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as VerificationResult;
    } catch (e) {
        console.error("Failed to parse verification JSON response:", jsonText);
        throw new Error("Could not parse verification result from AI analysis.");
    }
};
