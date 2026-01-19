
import React, { useState } from 'react';

interface ExtensionModalProps {
  videoUrl: string;
  onClose: () => void;
  onConfirm: (prompt: string) => void;
}

const ExtensionModal: React.FC<ExtensionModalProps> = ({ videoUrl, onClose, onConfirm }) => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="relative aspect-video bg-black">
          <video src={videoUrl} className="w-full h-full object-cover opacity-60" muted autoPlay loop />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-plus text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-white">Extend Narrative</h3>
            <p className="text-sm text-gray-300">Describe what happens in the next 7 seconds.</p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
            <i className="fa-solid fa-xmark text-white"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <textarea
            autoFocus
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., The camera zooms out to reveal a massive city skyline..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!prompt.trim()}
              onClick={() => onConfirm(prompt)}
              className="flex-[2] py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              Start Extension
            </button>
          </div>
          <p className="text-[10px] text-gray-500 text-center">Extensions are generated at 720p as per industry standards.</p>
        </div>
      </div>
    </div>
  );
};

export default ExtensionModal;
