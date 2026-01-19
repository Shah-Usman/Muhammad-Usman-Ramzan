
import React, { useState, useEffect } from 'react';
import { AspectRatio, Resolution, GeneratedVideo, GenerationStatus } from './types';
import { geminiService } from './services/geminiService';
import ApiKeyScreen from './components/ApiKeyScreen';
import LoadingOverlay from './components/LoadingOverlay';
import VideoCard from './components/VideoCard';
import ExtensionModal from './components/ExtensionModal';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  
  // Generation State
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<Resolution>(Resolution.R720P);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);
  const [assets, setAssets] = useState<string[]>([]);
  
  // UI State
  const [status, setStatus] = useState<GenerationStatus>({ isGenerating: false, message: '' });
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [extendingVideo, setExtendingVideo] = useState<GeneratedVideo | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // @ts-ignore
    if (window.aistudio?.hasSelectedApiKey) {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    }
    setCheckingKey(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end' | 'asset') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'start') setStartImage(base64);
      else if (type === 'end') setEndImage(base64);
      else if (type === 'asset' && assets.length < 3) setAssets([...assets, base64]);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    
    setStatus({ isGenerating: true, message: 'Initiating Visual Sequence...' });
    
    try {
      const result = await geminiService.generateVideo({
        prompt,
        resolution,
        aspectRatio,
        startImage: startImage || undefined,
        endImage: endImage || undefined,
        assets: assets.length > 0 ? assets : undefined
      });

      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        uri: result.uri,
        localUrl: result.localUrl,
        prompt,
        timestamp: Date.now(),
        config: { resolution, aspectRatio },
        // @ts-ignore
        rawResponse: result.rawResponse
      };

      setHistory([newVideo, ...history]);
      setShowHistory(true);
      resetForm();
    } catch (error: any) {
      console.error(error);
      if (error.message === "API_KEY_EXPIRED") {
        setHasApiKey(false);
      }
      alert("An error occurred during generation. Please try again.");
    } finally {
      setStatus({ isGenerating: false, message: '' });
    }
  };

  const handleExtendConfirm = async (extensionPrompt: string) => {
    if (!extendingVideo) return;
    const originalVideo = extendingVideo;
    setExtendingVideo(null);

    setStatus({ isGenerating: true, message: 'Extending Narrative Arc...' });
    try {
      const result = await geminiService.extendVideo(
        // @ts-ignore
        originalVideo.rawResponse, 
        extensionPrompt, 
        originalVideo.config.aspectRatio as AspectRatio || AspectRatio.LANDSCAPE
      );

      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        uri: result.uri,
        localUrl: result.localUrl,
        prompt: extensionPrompt,
        timestamp: Date.now(),
        config: { ...originalVideo.config, resolution: Resolution.R720P },
        // @ts-ignore
        rawResponse: result.rawResponse
      };

      setHistory([newVideo, ...history]);
      setShowHistory(true);
    } catch (error) {
      console.error(error);
      alert("Failed to extend video. Please ensure the original video is compatible (720p resolution is required for extension).");
    } finally {
      setStatus({ isGenerating: false, message: '' });
    }
  };

  const resetForm = () => {
    setPrompt('');
    setStartImage(null);
    setEndImage(null);
    setAssets([]);
  };

  if (checkingKey) return null;
  if (!hasApiKey) return <ApiKeyScreen onKeySelected={() => setHasApiKey(true)} />;

  return (
    <div className="min-h-screen bg-[#030712] selection:bg-indigo-500/30">
      {status.isGenerating && <LoadingOverlay message={status.message} />}
      
      {extendingVideo && (
        <ExtensionModal 
          videoUrl={extendingVideo.localUrl} 
          onClose={() => setExtendingVideo(null)} 
          onConfirm={handleExtendConfirm} 
        />
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setShowHistory(false)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-play text-white text-xs"></i>
            </div>
            <span className="text-xl font-bold tracking-tight">Visionary <span className="gradient-text">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              {history.length} Clips
            </button>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
              Studio Mode
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Input Controls */}
          <div className="lg:col-span-7 space-y-8">
            <header className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Cinematic <br /><span className="gradient-text">Text-to-Video.</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Experience high-end video generation. Now featuring 1080p output and narrative extensions.
              </p>
            </header>

            <div className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <i className="fa-solid fa-align-left"></i> Narrative Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your scene in detail... e.g., 'A majestic eagle soaring over a snow-capped mountain range at sunset, slow motion, 8k quality...'"
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-gray-600 shadow-inner"
                />
              </div>

              {/* Advanced Config */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Aspect Ratio</label>
                  <div className="flex gap-2">
                    {[AspectRatio.LANDSCAPE, AspectRatio.PORTRAIT].map((ar) => (
                      <button
                        key={ar}
                        onClick={() => setAspectRatio(ar)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                          aspectRatio === ar ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {ar === AspectRatio.LANDSCAPE ? <i className="fa-solid fa-desktop mr-2"></i> : <i className="fa-solid fa-mobile-screen-button mr-2"></i>}
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Output Quality</label>
                  <div className="flex gap-2">
                    {[Resolution.R720P, Resolution.R1080P].map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                          resolution === res ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {res === Resolution.R1080P && <i className="fa-solid fa-crown mr-1.5 text-[10px]"></i>}
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reference Frames */}
              <div className="space-y-4">
                 <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <i className="fa-solid fa-images"></i> Visual Direction (Optional)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="aspect-square glass rounded-xl overflow-hidden relative group border-dashed border-white/10 hover:border-indigo-500/50 transition-all">
                      {startImage ? (
                        <img src={startImage} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-1">
                          <i className="fa-solid fa-film text-xl"></i>
                          <span className="text-[10px] uppercase font-bold tracking-wider">Start Frame</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'start')} 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {startImage && (
                        <button onClick={() => setStartImage(null)} className="absolute top-2 right-2 bg-black/70 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fa-solid fa-xmark text-white text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="aspect-square glass rounded-xl overflow-hidden relative group border-dashed border-white/10 hover:border-indigo-500/50 transition-all">
                      {endImage ? (
                        <img src={endImage} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-1">
                          <i className="fa-solid fa-clapperboard text-xl"></i>
                          <span className="text-[10px] uppercase font-bold tracking-wider">End Frame</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'end')} 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {endImage && (
                        <button onClick={() => setEndImage(null)} className="absolute top-2 right-2 bg-black/70 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fa-solid fa-xmark text-white text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="aspect-square glass rounded-xl overflow-hidden relative group border-dashed border-white/10 hover:border-indigo-500/50 transition-all">
                      {assets.length > 0 ? (
                        <div className="grid grid-cols-2 gap-0.5 h-full">
                          {assets.map((a, i) => (
                            <img key={i} src={a} className="w-full h-full object-cover" />
                          ))}
                          {assets.length < 4 && <div className="bg-white/5 flex items-center justify-center"><i className="fa-solid fa-plus text-xs"></i></div>}
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-1">
                          <i className="fa-solid fa-layer-group text-xl"></i>
                          <span className="text-[10px] uppercase font-bold tracking-wider">Style Refs</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'asset')} 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={assets.length >= 3}
                      />
                      {assets.length > 0 && (
                        <button onClick={() => setAssets([])} className="absolute top-2 right-2 bg-black/70 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fa-solid fa-xmark text-white text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generate}
                disabled={!prompt.trim() || status.isGenerating}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] group"
              >
                <i className="fa-solid fa-wand-magic-sparkles group-hover:rotate-12 transition-transform"></i>
                Generate Scene
              </button>
            </div>
          </div>

          {/* Sidebar / Gallery Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass rounded-3xl p-8 sticky top-32 border-indigo-500/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <i className="fa-solid fa-film text-indigo-400"></i>
                  Recent Works
                </h3>
                {history.length > 0 && (
                   <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-300 font-bold">{history.length} Clips</span>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                    <i className="fa-solid fa-inbox text-2xl text-gray-700"></i>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 font-medium">Studio empty</p>
                    <p className="text-xs text-gray-600">Start by typing a prompt to the left.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((video) => (
                    <VideoCard 
                      key={video.id} 
                      video={video} 
                      onExtend={() => setExtendingVideo(video)} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <span>&copy; 2025 Visionary AI Studio</span>
            <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
            <span className="flex items-center gap-2"><i className="fa-solid fa-bolt text-amber-500"></i> High Resolution Enabled</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-lg"><i className="fa-brands fa-twitter"></i></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-lg"><i className="fa-brands fa-discord"></i></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-lg"><i className="fa-brands fa-github"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
