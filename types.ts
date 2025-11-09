export enum Verdict {
  PASS = 'PASS',
  PARTIAL = 'PARTIAL',
  FAIL = 'FAIL',
  CANNOT_VERIFY = 'CANNOT_VERIFY',
  PENDING = 'PENDING',
  VERIFYING = 'VERIFYING',
}

export interface FeatureClaim {
  claim: string;
  requirement: string;
  verificationGuidance: string;
}

export interface Feature extends FeatureClaim {
  id: number;
  verdict: Verdict;
  evidence: {
    analysis: string | null;
  };
  verificationNotes: string | null;
}

export interface Report {
  repoUrl: string;
  overallAssessment: string;
  features: Feature[];
}

export enum AnalysisStage {
  IDLE,
  EXTRACTING_FEATURES,
  VERIFYING,
  COMPLETE,
  ERROR,
}
