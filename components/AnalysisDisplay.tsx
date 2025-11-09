
import React from 'react';
import { AnalysisStage, Report } from '../types';
import FeatureCard from './FeatureCard';

interface AnalysisDisplayProps {
  stage: AnalysisStage;
  report: Report | null;
  error: string | null;
}

const Loader: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-lg">
    <svg className="animate-spin h-8 w-8 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg font-medium text-slate-700">{message}</p>
  </div>
);

const IdleState: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
    <h3 className="text-xl font-semibold text-slate-800">Ready to Analyze</h3>
    <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
      Enter a public GitHub repository URL to begin. SlopScore will read its README, extract key feature claims, and then simulate a verification process to check if the code matches the documentation.
    </p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
        <div className="flex">
            <div className="flex-shrink-0">
                 <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                    <p>{message}</p>
                </div>
            </div>
        </div>
    </div>
);


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ stage, report, error }) => {
  const renderContent = () => {
    switch (stage) {
      case AnalysisStage.IDLE:
        return <IdleState />;
      case AnalysisStage.EXTRACTING_FEATURES:
        return <Loader message="Extracting features from README..." />;
      case AnalysisStage.VERIFYING:
      case AnalysisStage.COMPLETE:
        if (!report) return <IdleState />;
        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-slate-800">Analysis Report</h2>
                <p className="text-sm text-slate-500 break-all">
                    {report.repoUrl}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <h3 className="text-base font-semibold text-slate-700">Overall Assessment</h3>
                    <p className="mt-1 text-slate-600 italic">"{report.overallAssessment}"</p>
                </div>
            </div>
            <div className="space-y-4">
              {report.features.map(feature => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        );
      case AnalysisStage.ERROR:
        return <ErrorState message={error || 'An unknown error occurred.'} />;
      default:
        return null;
    }
  };

  return <div className="mt-6">{renderContent()}</div>;
};

export default AnalysisDisplay;
