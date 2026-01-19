
import React from 'react';
import { GeneratedVideo, Resolution } from '../types';

interface VideoCardProps {
  video: GeneratedVideo;
  onExtend: (video: GeneratedVideo) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onExtend }) => {
  const is1080p = video.config.resolution === Resolution.R1080P;

  return (
    <div className="group relative glass rounded-2xl overflow-hidden border-white/5 hover:border-indigo-500/30 transition-all duration-300">
      <div className="relative">
        <video 
          src={video.localUrl} 
          className="w-full aspect-video object-cover" 
          controls 
          loop 
          muted
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg ${
            is1080p ? 'bg-amber-500 text-amber-950' : 'bg-indigo-500/50 text-indigo-100'
          }`}>
            {video.config.resolution}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/40 text-white backdrop-blur-md">
            {video.config.aspectRatio}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-300 line-clamp-2 italic font-light leading-relaxed">
          "{video.prompt}"
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => onExtend(video)}
              className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-medium transition-all group/btn"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-indigo-400 group-hover/btn:scale-110 transition-transform"></i>
              Extend Clip
            </button>
            
            <a 
              href={video.localUrl} 
              download={`visionary-${video.config.resolution}-${video.id}.mp4`}
              className={`flex-[1.5] py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                is1080p 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <i className="fa-solid fa-download"></i>
              Download {is1080p ? '1080p' : '720p'}
            </a>
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-white/5">
            <span>ID: {video.id}</span>
            <span>{new Date(video.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
