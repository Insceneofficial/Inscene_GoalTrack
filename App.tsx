import React, { useState, useEffect, useRef } from 'react';
import Logo from './components/Logo.tsx';
import ChatPanel from './components/ChatPanel.tsx';
import { Analytics } from "@vercel/analytics/react";

/**
 * Optimized Image Proxy Utility
 */
const getSmartImageUrl = (url: string, v: string = '1', w: number = 400, h: number = 400) => {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) return url; 
  const cacheBuster = `v${v}_${new Date().getDate()}_${new Date().getHours()}`;
  const encodedUrl = encodeURIComponent(url);
  return `https://wsrv.nl/?url=${encodedUrl}&w=${w}&h=${h}&fit=cover&a=top&output=jpg&q=85&il&maxage=7d&t=${cacheBuster}`;
};

/**
 * CHARACTER AVATARS
 */
const ANISH_AVATAR = "https://lh3.googleusercontent.com/d/1m_I0IqOX8WtxfMJP1dL2qAxVfpKnAROE";
const DEBU_AVATAR = "https://lh3.googleusercontent.com/d/14o-9uKeKJVy9aa0DPMCFA43vP0vJPGM3";

const SERIES_CATALOG = [
  {
    id: 'startup-boy-anish',
    title: 'Founder Mode',
    tagline: 'Anish x Insayy',
    influencer: 'Anish',
    avatars: { Anish: ANISH_AVATAR },
    thumbnail: getSmartImageUrl("https://lh3.googleusercontent.com/d/1FKR6HevmeSv1baTCUtfi5CWQo8FO0QAf", "anish_v2", 800, 800),
    episodes: [
      { id: 1, title: "The First Step", subtitle: "Fundraising & Grants", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4", chatGoal: "Set 30-Day Goal" },
      { id: 2, title: "Founder Dynamics", subtitle: "CEO/CTO Roles & Partners", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep2.mp4", chatGoal: "Break into Steps" },
      { id: 3, title: "The AI Moat", subtitle: "Beating Gemini & OpenAI", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep3.mp4", chatGoal: "Define Defensibility" },
      { id: 4, title: "Idea Stress Test", subtitle: "The Real Talk", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep4.mp4", chatGoal: "Refine Concept" },
      { id: 5, title: "Scale or Pivot", subtitle: "Team Building Logic", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep5.mp4", chatGoal: "Final Scalability Plan" }
    ]
  },
  {
    id: 'deb-filmmaker',
    title: 'The Director',
    tagline: 'Debu x Inscene',
    influencer: 'Debu',
    avatars: { Debu: DEBU_AVATAR },
    thumbnail: getSmartImageUrl("https://lh3.googleusercontent.com/d/1BGjtlHgMy4BToZJQ-eOhr-UpH82LOMVh", "deb_v2", 800, 800),
    episodes: [
      { id: 1, title: "The Visionary Eye", subtitle: "Finding the Lens", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4", chatGoal: "Set Vision" },
      { id: 2, title: "The Storyboard", subtitle: "Visual Pacing", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode2_Debu.mp4", chatGoal: "Break Scenes" },
      { id: 3, title: "Shadow & Light", subtitle: "Emotional Lighting", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode3_Debu.mp4", chatGoal: "Design Lighting Mood" },
      { id: 4, title: "The Edit", subtitle: "Final Cut Logic", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode4_Debu.mp4", chatGoal: "Review Sequence" },
      { id: 5, title: "Premiere Day", subtitle: "Distribution Strategy", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode5_Debu.mp4", chatGoal: "Final Release Plan" }
    ]
  }
];

const ReelItem: React.FC<{
  episode: any;
  series: any;
  isActive: boolean;
  onFinished: () => void;
  onSkipToChat: () => void;
  onBackToHome: () => void;
}> = ({ episode, series, isActive, onFinished, onSkipToChat, onBackToHome }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.load(); 
      videoRef.current.play().catch(() => {});
    }
  }, [isActive, episode.url]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <video 
        ref={videoRef} 
        src={episode.url} 
        className="h-full w-full object-cover" 
        onEnded={onFinished} 
        onTimeUpdate={handleTimeUpdate}
        playsInline 
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />
      
      <div className="absolute top-12 left-0 right-0 px-6 z-50 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={onBackToHome}
            className="group flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full active:scale-95 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4 text-white"><path d="M15 19l-7-7 7-7" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Home</span>
          </button>
          <div className="flex flex-col items-end">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Chapter {episode.id}</p>
             <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Watching Now</p>
          </div>
        </div>
        
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
           <div 
             className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-300" 
             style={{ width: `${progress}%` }} 
           />
        </div>
      </div>

      <div className="absolute bottom-12 left-6 right-6 flex flex-col gap-6 animate-slide-up">
        <div className="flex items-center gap-5">
          <div className="relative">
             <div className="absolute -inset-1 bg-blue-500 rounded-full blur opacity-30 animate-pulse" />
             <img src={series.avatars[series.influencer]} className="relative w-16 h-16 rounded-full border-2 border-white shadow-xl object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-1">Mastery Path</p>
            <h4 className="text-2xl font-black italic uppercase text-white leading-tight tracking-tighter">{episode.title}</h4>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">{episode.subtitle}</p>
          </div>
        </div>
        <button 
          onClick={onSkipToChat} 
          className="group relative w-full py-5 rounded-[2.5rem] bg-white overflow-hidden text-black text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
        >
          <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative group-hover:text-white transition-colors duration-300">
            Skip to {episode.chatGoal}
          </span>
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isSplash, setIsSplash] = useState(true);
  const [view, setView] = useState<'discover' | 'profile'>('discover');
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [chatData, setChatData] = useState<any>(null);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({
    'startup-boy-anish': 1,
    'deb-filmmaker': 1
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getProg = (id: string) => userProgress[id] || 1;

  const handleSeriesSelect = (series: any) => {
    setSelectedSeries(series);
    setView('profile');
  };

  const openChat = (ep: any) => {
    setChatData({
      char: selectedSeries.influencer,
      intro: `Masterclass Chapter complete. Now, let's execute. Ready for "${ep.chatGoal}"?`,
      hook: ep.chatGoal,
      episodeId: ep.id
    });
  };

  const currentProgPercent = selectedSeries ? (getProg(selectedSeries.id) / selectedSeries.episodes.length) * 100 : 0;

  if (isSplash) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <Logo size={120} isPulsing={true} className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden font-sans selection:bg-blue-500/30">
      {view === 'profile' && selectedSeries && (
        <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-[100]">
          <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] transition-all duration-1000" style={{ width: `${currentProgPercent}%` }} />
        </div>
      )}

      {view === 'discover' && (
        <main className="flex-1 overflow-y-auto px-6 pt-24 pb-32 z-10 animate-fade-in hide-scrollbar">
           <div className="max-w-md mx-auto space-y-12">
             <header className="flex justify-between items-center">
                <Logo size={46} isPulsing={false} />
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Vault</p>
                  <p className="text-sm font-black italic text-blue-500">PREMIUM ACCESS</p>
                </div>
             </header>
             <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Choose Your<br /><span className="text-blue-500">Mastery</span></h1>
             <div className="grid gap-10">
                {SERIES_CATALOG.map(s => (
                  <div key={s.id} onClick={() => handleSeriesSelect(s)} className="relative h-80 rounded-[3.5rem] overflow-hidden group cursor-pointer border border-white/5 shadow-3xl active:scale-[0.98] transition-all">
                    <img src={s.thumbnail} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-2">{s.tagline}</p>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{s.title}</h3>
                      <div className="mt-4 h-1 bg-white/10 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" style={{ width: `${(getProg(s.id) / s.episodes.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </main>
      )}

      {view === 'profile' && selectedSeries && (
        <main className="flex-1 overflow-y-auto px-6 pt-16 pb-32 z-10 animate-slide-up hide-scrollbar">
           <div className="max-w-md mx-auto space-y-12">
             <div className="flex justify-between items-center">
               <button onClick={() => setView('discover')} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl hover:bg-white/10 transition-colors active:scale-90">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5"><path d="M15 19l-7-7 7-7" /></svg>
               </button>
               <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400">Chapter {getProg(selectedSeries.id)} / {selectedSeries.episodes.length}</p>
               </div>
             </div>

             <div className="bg-gradient-to-br from-white/10 to-transparent p-12 rounded-[4.5rem] border border-white/10 shadow-3xl text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] -mr-24 -mt-24 pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
                <img src={selectedSeries.avatars[selectedSeries.influencer]} className="w-36 h-36 rounded-full mx-auto border-4 border-white mb-8 shadow-4xl object-cover hover:scale-105 transition-transform duration-500" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{selectedSeries.influencer}</h2>
                <p className="text-sm text-white/40 mb-10 font-medium italic">Active Goal: {selectedSeries.episodes.find((e: any) => e.id === getProg(selectedSeries.id))?.title}</p>
                <button 
                  onClick={() => setActiveEpisode(selectedSeries.episodes.find((e: any) => e.id === getProg(selectedSeries.id)))}
                  className="w-full py-7 rounded-[3rem] bg-white text-black text-[13px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4 group"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform"><path d="M8 5v14l11-7z" /></svg>
                  Play Chapter
                </button>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between px-2 mb-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Learning Map</p>
                   <div className="h-[1px] flex-1 bg-white/5 mx-6" />
                </div>
                {selectedSeries.episodes.map((ep: any) => {
                  const isCompleted = ep.id < getProg(selectedSeries.id);
                  const isCurrent = ep.id === getProg(selectedSeries.id);
                  const isLocked = ep.id > getProg(selectedSeries.id);

                  return (
                    <div 
                      key={ep.id} 
                      onClick={() => !isLocked && setActiveEpisode(ep)}
                      className={`group flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${isCurrent ? 'bg-white/10 border-blue-500/50 scale-[1.02] shadow-2xl' : 'bg-transparent border-white/5'} ${isLocked ? 'opacity-20 grayscale cursor-not-allowed' : 'opacity-100 hover:bg-white/10 cursor-pointer active:scale-[0.98]'}`}
                    >
                      {/* Play Hover Overlay */}
                      {!isLocked && (
                        <div className="absolute right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-500"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      )}

                      <div className={`w-14 h-14 rounded-[1.8rem] flex items-center justify-center font-black italic text-2xl border-2 transition-all duration-500 ${isCompleted ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_#3b82f6]' : isCurrent ? 'border-blue-500 text-blue-400 animate-pulse' : 'border-white/10 text-white/20'}`}>
                        {isCompleted ? '✓' : isLocked ? '🔒' : ep.id}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCurrent ? 'text-blue-400' : 'text-white/30'}`}>{ep.subtitle}</h4>
                        <p className="text-lg font-bold italic tracking-tight leading-tight">{ep.title}</p>
                      </div>
                    </div>
                  );
                })}
             </div>
           </div>
        </main>
      )}

      {activeEpisode && (
        <div className="fixed inset-0 z-[5000] bg-black animate-fade-in">
          <ReelItem 
            episode={activeEpisode} 
            series={selectedSeries} isActive={true}
            onFinished={() => { 
              const ep = activeEpisode;
              setActiveEpisode(null); 
              openChat(ep); 
            }}
            onSkipToChat={() => { 
              const ep = activeEpisode;
              setActiveEpisode(null); 
              openChat(ep); 
            }}
            onBackToHome={() => setActiveEpisode(null)}
          />
        </div>
      )}

      {chatData && (
        <ChatPanel 
          character={chatData.char} 
          avatar={selectedSeries?.avatars[chatData.char]} 
          instantGreeting={chatData.intro} 
          initialHook={chatData.hook}
          episodeId={chatData.episodeId}
          onClose={() => {
            const finishedId = chatData.episodeId;
            setChatData(null);
            
            // AUTOMATICALLY MOVE TO NEXT EPISODE
            const nextEp = selectedSeries.episodes.find((e: any) => e.id === finishedId + 1);
            if (nextEp) {
              setActiveEpisode(nextEp);
            }
          }}
          onProgressUpdate={() => {
            // Only progress the global counter if we just finished the CURRENT chapter
            const currentProg = getProg(selectedSeries.id);
            if (chatData.episodeId === currentProg) {
              setUserProgress(prev => ({ 
                ...prev, 
                [selectedSeries.id]: Math.min(currentProg + 1, selectedSeries.episodes.length) 
              }));
            }
          }}
        />
      )}

      <Analytics />
    </div>
  );
};

export default App;