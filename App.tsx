import React, { useState, useCallback } from 'react';
import { AnalysisStage, Feature, Report, Verdict, FeatureClaim } from './types';
import { fetchReadmeContent, extractFeatures, fetchRepoFileTree, verifyFeature } from './services/geminiService';
import Header from './components/Header';
import RepoInput from './components/RepoInput';
import AnalysisDisplay from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.IDLE);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVerification = useCallback(async (feature: FeatureClaim, featureIndex: number, fileTree: string[]) => {
    // Set status to verifying
    setReport(prev => {
        if (!prev) return null;
        const features = [...prev.features];
        features[featureIndex].verdict = Verdict.VERIFYING;
        return {...prev, features};
    });

    const result = await verifyFeature(feature, fileTree);
    
    // Update with final verdict
    setReport(prev => {
        if (!prev) return null;
        const features = [...prev.features];
        features[featureIndex] = {
            ...features[featureIndex],
            verdict: result.verdict,
            evidence: { analysis: result.analysis },
            verificationNotes: result.notes,
        };
        return {...prev, features};
    });

  }, []);

  const handleAnalyze = useCallback(async (url: string) => {
    setStage(AnalysisStage.EXTRACTING_FEATURES);
    setReport(null);
    setError(null);

    try {
      // Step 1: Fetch README and extract features
      const readme = await fetchReadmeContent(url);
      const extracted = await extractFeatures(readme);

      const initialFeatures: Feature[] = extracted.features.map((f, i) => ({
        ...f,
        id: i,
        verdict: Verdict.PENDING,
        evidence: { analysis: null },
        verificationNotes: null,
      }));

      setReport({
        repoUrl: url,
        overallAssessment: extracted.overallAssessment,
        features: initialFeatures,
      });

      setStage(AnalysisStage.VERIFYING);

      // Step 2: Fetch file tree once for all features
      const fileTree = await fetchRepoFileTree(url);

      // Step 3: Run verification for each feature sequentially
      for (let i = 0; i < initialFeatures.length; i++) {
        await runVerification(initialFeatures[i], i, fileTree);
      }
      
      setStage(AnalysisStage.COMPLETE);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Failed to analyze repository. ${errorMessage}`);
      setStage(AnalysisStage.ERROR);
    }
  }, [runVerification]);

  const isLoading = stage === AnalysisStage.EXTRACTING_FEATURES || stage === AnalysisStage.VERIFYING;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        <AnalysisDisplay stage={stage} report={report} error={error} />
      </main>
    </div>
  );
};

export default App;
