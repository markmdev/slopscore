import React from 'react';
import { Verdict } from '../types';

interface StatusBadgeProps {
  verdict: Verdict;
}

const verdictStyles: { [key in Verdict]: string } = {
  [Verdict.PASS]: 'bg-green-100 text-green-800',
  [Verdict.PARTIAL]: 'bg-yellow-100 text-yellow-800',
  [Verdict.FAIL]: 'bg-red-100 text-red-800',
  [Verdict.CANNOT_VERIFY]: 'bg-slate-200 text-slate-800',
  [Verdict.PENDING]: 'bg-slate-100 text-slate-600',
  [Verdict.VERIFYING]: 'bg-blue-100 text-blue-800 animate-pulse',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ verdict }) => {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${verdictStyles[verdict]}`}
    >
      {verdict.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
