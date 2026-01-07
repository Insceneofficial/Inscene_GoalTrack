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
      { id: 1, title: "The First Step", subtitle: "Fundraising & Grants Experience", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4", chatGoal: "Set 30-Day Goal" },
      { id: 2, title: "Founder Dynamics", subtitle: "CEO/CTO Roles & Co-founders", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4", chatGoal: "Break into Steps" },
      { id: 3, title: "The AI Moat", subtitle: "Distinguishing from OpenAI & Gemini", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4", chatGoal: "Define Defensibility" },
      { id: 4, title: "Idea Stress Test", subtitle: "Discussing Your Idea & Next Steps", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4", chatGoal: "Refine Concept" },
      { id: 5, title: "Pivot or Persevere", subtitle: "Team Building & Pivot Logic", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4", chatGoal: "Final Scalability Plan" }
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
      { id: 1, title: "The Visionary Eye", subtitle: "Defining Your Lens", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4", chatGoal: "Set Vision" },
      { id: 2, title: "The Storyboard", subtitle: "Framing the Journey", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4", chatGoal: "Break into Scenes" }
    ]
  }
];

const ReelItem: React.FC<{
  episode: any;
  series: any;
  isActive: boolean;
  onFinished: () => void;
  onSkip: () => void;
}> = ({ episode, series, isActive, onFinished, onSkip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.play().catch(() => {});
    }
  }, [isActive]);

  return (
    <div className="relative h-full w-full bg-black">
      <video ref={videoRef} src={episode.url} className="h-full w-full object-cover" onEnded={onFinished} playsInline />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-12 left-0 right-0 px-6 z-50">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
           <div className="h-full bg-blue-500 animate-[progress_30s_linear_infinite]" style={{ width: '0%' }} />
        </div>
      </div>
      <div className="absolute bottom-12 left-6 right-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <img src={series.avatars[series.influencer]} className="w-16 h-16 rounded-full border-2 border-white shadow-xl object-cover" />
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Ep {episode.id}: {episode.subtitle}</p>
            <h4 className="text-2xl font-black italic uppercase text-white leading-tight">{episode.title}</h4>
          </div>
        </div>
        <button onClick={onSkip} className="w-full py-5 rounded-[2.5rem] bg-white text-black text-[12px] font-black uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all">Continue to {episode.chatGoal}</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'discover' | 'profile'>('discover');
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [chatData, setChatData] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({
    'startup-boy-anish': 1,
    'deb-filmmaker': 1
  });

  const getProg = (id: string) => userProgress[id] || 1;

  const handleSeriesSelect = (series: any) => {
    setSelectedSeries(series);
    setView('profile');
  };

  const openChat = () => {
    const currentEpId = getProg(selectedSeries.id);
    const episode = selectedSeries.episodes.find((e: any) => e.id === currentEpId);
    setChatData({
      char: selectedSeries.influencer,
      intro: `Masterclass Chapter complete. Now, let's execute. Ready for "${episode.chatGoal}"?`,
      hook: episode.chatGoal,
      episodeId: currentEpId
    });
  };

  const currentProgPercent = selectedSeries ? (getProg(selectedSeries.id) / selectedSeries.episodes.length) * 100 : 0;

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden font-sans">
      {/* Global Series Progress Bar */}
      {view === 'profile' && selectedSeries && (
        <div className="fixed top-0 left-0 w-full h-1.5 bg-white/10 z-[100]">
          <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] transition-all duration-1000" style={{ width: `${currentProgPercent}%` }} />
        </div>
      )}

      {view === 'discover' && (
        <main className="flex-1 overflow-y-auto px-6 pt-24 pb-32 z-10 animate-fade-in hide-scrollbar">
           <div className="max-w-md mx-auto space-y-12">
             <header className="flex justify-between items-center">
                <Logo size={46} isPulsing={false} />
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Status</p>
                  <p className="text-sm font-black italic text-blue-500">READY TO CLIMB</p>
                </div>
             </header>
             <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Choose Your<br /><span className="text-blue-500">Mastery</span></h1>
             <div className="grid gap-10">
                {SERIES_CATALOG.map(s => (
                  <div key={s.id} onClick={() => handleSeriesSelect(s)} className="relative h-80 rounded-[3.5rem] overflow-hidden group cursor-pointer border border-white/5 shadow-3xl active:scale-95 transition-all">
                    <img src={s.thumbnail} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-2">{s.tagline}</p>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">{s.title}</h3>
                      <div className="mt-4 h-1 bg-white/10 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${(getProg(s.id) / s.episodes.length) * 100}%` }} />
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
               <button onClick={() => setView('discover')} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5"><path d="M15 19l-7-7 7-7" /></svg>
               </button>
               <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400">Chapter {getProg(selectedSeries.id)} / {selectedSeries.episodes.length}</p>
               </div>
             </div>

             <div className="bg-gradient-to-br from-white/10 to-transparent p-12 rounded-[4.5rem] border border-white/10 shadow-3xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                <img src={selectedSeries.avatars[selectedSeries.influencer]} className="w-36 h-36 rounded-full mx-auto border-4 border-white mb-8 shadow-4xl object-cover" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{selectedSeries.influencer}</h2>
                <p className="text-sm text-white/40 mb-10 font-medium italic">Current: {selectedSeries.episodes.find((e: any) => e.id === getProg(selectedSeries.id))?.title}</p>
                <button 
                  onClick={() => setShowVideo(true)}
                  className="w-full py-7 rounded-[3rem] bg-white text-black text-[13px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 5v14l11-7z" /></svg>
                  Play Chapter
                </button>
             </div>

             <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                   <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Course Syllabus</p>
                   <div className="h-[1px] flex-1 bg-white/5 mx-6" />
                </div>
                {selectedSeries.episodes.map((ep: any) => {
                  const isCompleted = ep.id < getProg(selectedSeries.id);
                  const isCurrent = ep.id === getProg(selectedSeries.id);
                  return (
                    <div key={ep.id} className={`flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${isCurrent ? 'bg-white/10 border-blue-500/50 scale-[1.02] shadow-2xl' : 'bg-transparent border-white/5 opacity-30'}`}>
                      <div className={`w-14 h-14 rounded-[1.8rem] flex items-center justify-center font-black italic text-2xl border-2 ${isCompleted ? 'bg-blue-500 border-blue-400 text-white' : isCurrent ? 'border-blue-500 text-blue-400 animate-pulse' : 'border-white/10 text-white/20'}`}>
                        {isCompleted ? '✓' : ep.id}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{ep.subtitle}</h4>
                        <p className="text-lg font-bold italic tracking-tight leading-tight">{ep.title}</p>
                      </div>
                    </div>
                  );
                })}
             </div>
           </div>
        </main>
      )}

      {showVideo && (
        <div className="fixed inset-0 z-[5000] bg-black animate-fade-in">
          <ReelItem 
            episode={selectedSeries.episodes.find((e: any) => e.id === getProg(selectedSeries.id))} 
            series={selectedSeries} 
            isActive={true} 
            onFinished={() => { setShowVideo(false); openChat(); }} 
            onSkip={() => { setShowVideo(false); openChat(); }} 
          />
        </div>
      )}

      {chatData && (
        <ChatPanel 
          character={chatData.char} 
          avatar={selectedSeries.avatars[chatData.char]} 
          instantGreeting={chatData.intro} 
          initialHook={chatData.hook} 
          episodeId={chatData.episodeId}
          onClose={() => setChatData(null)} 
          onProgressUpdate={() => {
            setUserProgress(prev => ({ ...prev, [selectedSeries.id]: Math.min(getProg(selectedSeries.id) + 1, selectedSeries.episodes.length) }));
          }}
        />
      )}

      <Analytics />
    </div>
  );
};

export default App;