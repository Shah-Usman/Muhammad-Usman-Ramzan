
import React, { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  const [tipsIndex, setTipsIndex] = useState(0);
  const tips = [
    "Painting your imagination pixel by pixel...",
    "Harmonizing frames for cinematic smoothness...",
    "Applying high-definition neural textures...",
    "Calculating lighting and physics...",
    "Dreaming up your vision...",
    "Almost there! Quality video takes a moment."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipsIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712]/90 backdrop-blur-xl transition-all duration-500">
      <div className="relative w-32 h-32 mb-12">
        {/* Animated Rings */}
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-4 border-purple-500/20 rounded-full"></div>
        <div className="absolute inset-4 border-4 border-b-purple-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-wand-magic-sparkles text-3xl text-indigo-400 animate-pulse"></i>
        </div>
      </div>
      
      <div className="text-center space-y-4 max-w-sm px-6">
        <h2 className="text-2xl font-bold gradient-text">{message}</h2>
        <p className="text-gray-400 animate-fade-in transition-opacity duration-1000">
          {tips[tipsIndex]}
        </p>
      </div>

      <div className="mt-12 flex items-center gap-2">
        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0s]"></div>
        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
