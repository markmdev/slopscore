import React from 'react';
import { Feature } from '../types';
import StatusBadge from './StatusBadge';
import CodeBlock from './CodeBlock';

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-lg font-semibold text-slate-800 flex-1">
            {feature.claim}
          </p>
          <div className="flex-shrink-0">
             <StatusBadge verdict={feature.verdict} />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 text-sm text-slate-600 space-y-4">
        <div>
          <h4 className="font-semibold text-slate-700 mb-1">Testable Requirement</h4>
          <p>{feature.requirement}</p>
        </div>
        
        {feature.evidence.analysis && (
            <div>
                <h4 className="font-semibold text-slate-700 mb-1">AI Code Analysis</h4>
                <CodeBlock content={feature.evidence.analysis} language="log" />
            </div>
        )}

         {feature.verificationNotes && (
             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="font-semibold text-yellow-800">Verification Notes</p>
                <p className="text-yellow-700">{feature.verificationNotes}</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default FeatureCard;
