import React, { useState } from 'react';

interface RepoInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const RepoInput: React.FC<RepoInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('https://github.com/facebook/react');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/)?$/;
    if (githubUrlPattern.test(url)) {
      setError('');
      onAnalyze(url);
    } else {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <form onSubmit={handleSubmit}>
        <label htmlFor="repo-url" className="block text-sm font-medium text-slate-700 mb-2">
          Public GitHub Repository URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="repo-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            placeholder="https://github.com/user/repo"
            className="flex-grow block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center items-center rounded-md border border-transparent bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <p className="text-xs text-slate-500 mt-3">
            Note: Performs a real-time analysis of the README and a static analysis of the codebase using AI. The code is <strong>not</strong> executed.
        </p>
      </form>
    </div>
  );
};

export default RepoInput;
