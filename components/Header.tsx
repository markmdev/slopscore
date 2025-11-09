
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            SlopScore
          </h1>
          <p className="text-sm text-slate-500">
            README Reality Check
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
