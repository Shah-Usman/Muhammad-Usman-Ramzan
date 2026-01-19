
import React from 'react';

interface ApiKeyScreenProps {
  onKeySelected: () => void;
}

const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onKeySelected }) => {
  const handleOpenSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      onKeySelected();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#030712]">
      <div className="max-w-md w-full glass p-10 rounded-3xl shadow-2xl text-center space-y-8">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
          <i className="fa-solid fa-key text-3xl text-white"></i>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Access Pro Video Studio</h1>
          <p className="text-gray-400">
            Veo video generation requires a paid API key from a Google Cloud Project.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleOpenSelectKey}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-xl font-semibold text-lg flex items-center justify-center gap-2 group"
          >
            Select API Key
            <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </button>
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Learn about API billing & setup
          </a>
        </div>
        <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><i className="fa-solid fa-shield-halved"></i> Secure Selection</span>
          <span className="flex items-center gap-1"><i className="fa-solid fa-bolt"></i> Real-time Gen</span>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyScreen;
