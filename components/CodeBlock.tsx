
import React from 'react';

interface CodeBlockProps {
  content: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content, language }) => {
  return (
    <div className="bg-slate-800 rounded-md my-2">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-700">
        <span className="text-xs font-medium text-slate-400">{language}</span>
      </div>
      <pre className="p-4 text-sm text-slate-50 overflow-x-auto">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
