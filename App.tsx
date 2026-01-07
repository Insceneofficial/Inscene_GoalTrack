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
const DEBU_AVATAR = "https://lh3.googleusercontent.com/d/14o-9uKeKJVy9aa0DPMCFA43vP0vJPGM3";
const ANISH_AVATAR = "https://lh3.googleusercontent.com/d/1m_I0IqOX8WtxfMJP1dL2qAxVfpKnAROE";

/**
 * REEL ITEM COMPONENT
 */
const ReelItem: React.FC<{
  episode: { url: string; title: string; subtitle: string };
  series: any;
  isActive: boolean;
  onFinished: () => void;
  onSkip: () => void;
}> = ({ episode, series, isActive, onFinished, onSkip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        src={episode.url}
        className="h-full w-full object-cover"
        onEnded={onFinished}
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none opacity-80" />
      
      {/* Top Progress Bar */}
      <div className="absolute top-12 left-0 right-0 px-6 flex items-center gap-1 z-50">
        <div className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden">
           <div className="h-full bg-blue-500 animate-[progress_30s_linear_infinite]" style={{ width: '0%' }} />
        </div>
      </div>

      <div className="absolute bottom-16 left-8 right-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <img src={series.avatars[series.influencer]} className="w-16 h-16 rounded-full border-2 border-white shadow-2xl object-cover" />
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">{episode.subtitle}</p>
            <h4 className="text-2xl font-black italic uppercase text-white leading-tight">{episode.title}</h4>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onSkip}
            className="flex-1 py-5 rounded-[2.5rem] bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
          >
            Continue to Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

const SERIES_CATALOG = [
  {
    id: 'startup-boy-anish',
    title: 'Founder Mode',
    tagline: 'Anish x Insayy',
    influencer: 'Anish',
    theme: 'startup',
    thumbnail: getSmartImageUrl("https://lh3.googleusercontent.com/d/1FKR6HevmeSv1baTCUtfi5CWQo8FO0QAf", "anish_v2", 800, 800),
    accentColor: '#00f2fe',
    avatars: { Anish: ANISH_AVATAR },
    episodes: {
      s1: { title: "The Mission Brief", subtitle: "Session 1: Goal Locking", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4" },
      s2: { title: "Architecting Speed", subtitle: "Session 2: Steps Breaking", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4" },
      step1: { title: "Step 1: The Core MVP", subtitle: "Daily Execution", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4" },
      step2: { title: "Step 2: User Traction", subtitle: "Daily Execution", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4" },
      generic: { title: "The Next Level", subtitle: "Execution Mode", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4" }
    }
  },
  {
    id: 'deb-filmmaker',
    title: 'The Director',
    tagline: 'Debu x Inscene',
    influencer: 'Debu',
    theme: 'filmmaking',
    thumbnail: getSmartImageUrl("https://lh3.googleusercontent.com/d/1BGjtlHgMy4BToZJQ-eOhr-UpH82LOMVh", "deb_v2", 800, 800),
    accentColor: '#a855f7',
    avatars: { Debu: DEBU_AVATAR },
    episodes: {
      s1: { title: "The Visionary Eye", subtitle: "Session 1: Goal Locking", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4" },
      s2: { title: "Storyboard Mastery", subtitle: "Session 2: Steps Breaking", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4" },
      step1: { title: "Frame 1: Lighting", subtitle: "Daily Execution", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4" },
      step2: { title: "Frame 2: Motion", subtitle: "Daily Execution", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4" },
      generic: { title: "Director's Cut", subtitle: "Execution Mode", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4" }
    }
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'discover' | 'profile'>('discover');
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [chatData, setChatData] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);

  const [progress, setProgress] = useState<Record<string, any>>({
    'startup-boy-anish': { session: 1, mission: null, blueprint: [], currentStep: 1, streak: 12, xp: 450 },
    'deb-filmmaker': { session: 1, mission: null, blueprint: [], currentStep: 1, streak: 0, xp: 10 }
  });

  const getProg = () => progress[selectedSeries?.id] || {};

  const getCurrentEpisode = () => {
    if (!selectedSeries) return null;
    const prog = getProg();
    if (prog.session === 1) return selectedSeries.episodes.s1;
    if (prog.session === 2) return selectedSeries.episodes.s2;
    if (prog.session === 3) {
      const stepKey = `step${prog.currentStep}`;
      return selectedSeries.episodes[stepKey] || selectedSeries.episodes.generic;
    }
    return selectedSeries.episodes.generic;
  };

  const handleSeriesSelect = (series: any) => {
    setSelectedSeries(series);
    setView('profile');
  };

  const startNarrativeBeat = () => setShowVideo(true);

  const openChat = () => {
    const prog = getProg();
    const episode = getCurrentEpisode();
    
    setChatData({ 
      char: selectedSeries.influencer, 
      intro: prog.session === 1 
        ? `Episode: "${episode.title}" complete. Now, talk to me. What's our 30-day play?` 
        : prog.session === 2 
          ? `Vision "${prog.mission}" is locked. I've broken it into these 5 steps. Review.` 
          : `Reviewing Step ${prog.currentStep}: "${prog.blueprint[prog.currentStep-1]?.goal}". Show me your results.`,
      hook: `${prog.session === 1 ? 'Goal Locking' : prog.session === 2 ? 'Steps Breaking' : 'Daily Checkpoint'}`
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden font-sans">
      
      {/* Background Ambience */}
      {view === 'profile' && selectedSeries && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <img src={selectedSeries.thumbnail} className="w-full h-full object-cover opacity-10 blur-[120px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
      )}

      {/* Discover Hub */}
      {view === 'discover' && (
        <main className="flex-1 overflow-y-auto px-6 pt-24 pb-32 z-10 animate-fade-in hide-scrollbar">
           <div className="max-w-md mx-auto space-y-12">
             <header className="flex justify-between items-center">
                <Logo size={50} isPulsing={false} />
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Vault</p>
                  <p className="text-sm font-black italic text-blue-500">PREMIUM ACCESS</p>
                </div>
             </header>
             <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.8] mb-4">Master<br /><span className="text-blue-500">Series</span></h1>
             <div className="grid gap-12">
                {SERIES_CATALOG.map(s => (
                  <div key={s.id} onClick={() => handleSeriesSelect(s)} className="relative h-96 rounded-[4rem] overflow-hidden group cursor-pointer border border-white/5 shadow-4xl active:scale-95 transition-all">
                    <img src={s.thumbnail} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                    <div className="absolute bottom-12 left-10 right-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 mb-3">{s.tagline}</p>
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter">{s.title}</h3>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </main>
      )}

      {/* Story Progression Hub */}
      {view === 'profile' && selectedSeries && (
        <main className="flex-1 overflow-y-auto px-6 pt-12 pb-32 z-10 animate-slide-up hide-scrollbar">
           <div className="max-w-md mx-auto space-y-12">
             <div className="flex justify-between items-center">
               <button onClick={() => setView('discover')} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl active:scale-90 transition-all">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5"><path d="M15 19l-7-7 7-7" /></svg>
               </button>
               <div className="px-6 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                  <span className="text-xl">🎬</span>
                  <span className="text-sm font-black italic text-blue-400 uppercase tracking-widest">{getProg().streak} Ep. Streak</span>
               </div>
             </div>

             <div className="flex flex-col items-center">
                <div className="relative mb-8 group">
                  <div className="absolute inset-0 rounded-full blur-[60px] opacity-20 bg-blue-600 animate-pulse group-hover:opacity-40 transition-all" />
                  <img src={selectedSeries.avatars[selectedSeries.influencer]} className="w-36 h-36 rounded-full border-[5px] border-white relative z-10 object-cover shadow-4xl" />
                </div>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">{selectedSeries.influencer}</h2>
                <div className="w-full bg-white/5 h-2.5 rounded-full mt-12 overflow-hidden border border-white/10 max-w-[260px]">
                   <div className="bg-blue-500 h-full shadow-[0_0_25px_#3b82f6] transition-all duration-1000" style={{ width: `${getProg().xp % 100}%` }} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mt-5">Season 1 Progress</p>
             </div>

             {/* Next Episode Card */}
             <div className="bg-gradient-to-br from-white/10 to-transparent p-12 rounded-[5rem] border border-white/10 shadow-4xl relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="px-3 py-1 rounded-full bg-blue-500 text-black text-[9px] font-black uppercase tracking-widest">NEXT EPISODE</div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Ready to Stream</p>
                   </div>
                   <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-8 leading-[0.8]">
                      {getCurrentEpisode()?.title}
                   </h3>
                   <p className="text-base text-white/40 mb-12 leading-relaxed italic font-medium">
                      {getProg().session === 1 ? "The intro cut. We need to define your mission before the next frame." : 
                       getProg().session === 2 ? "The strategy episode. Let's build the 30-day blueprint." : 
                       `Step ${getProg().currentStep} execution. Verify your progress to unlock the next chapter.`}
                   </p>
                   <button 
                     onClick={startNarrativeBeat}
                     className="w-full py-8 rounded-[3.5rem] bg-white text-black text-[14px] font-black uppercase tracking-[0.4em] shadow-4xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4"
                   >
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 5v14l11-7z" /></svg>
                     Play Episode
                   </button>
                </div>
                {/* Background Video Preview Blur */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
             </div>

             {/* Production Timeline (Roadmap) */}
             <div className="space-y-10 pt-10 pb-20">
                <div className="flex justify-between items-end mb-8">
                   <p className="text-[11px] font-black uppercase tracking-[0.8em] text-white/20">Production Script</p>
                   <div className="h-[1px] flex-1 bg-white/5 mx-6 mb-2" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">{getProg().session > 2 ? 'PRODUCING' : 'SCRIPTING'}</p>
                </div>
                {Array.from({ length: 5 }).map((_, i) => {
                  const stepNum = i + 1;
                  const isActive = stepNum === getProg().currentStep && getProg().session === 3;
                  const isCompleted = stepNum < getProg().currentStep;
                  const isFog = stepNum > getProg().currentStep || getProg().session < 3;

                  return (
                    <div key={i} className={`flex items-start gap-12 transition-all duration-1000 ${isFog ? 'opacity-10 blur-[8px]' : 'opacity-100'}`}>
                      <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center border-2 font-black italic text-3xl transition-all ${isCompleted ? 'bg-blue-500 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.6)]' : isActive ? 'border-blue-500 animate-pulse text-blue-500' : 'border-white/5 text-white/10'}`}>
                        {isCompleted ? '✓' : stepNum}
                      </div>
                      <div className="flex-1 pt-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3">Chapter {stepNum}</h4>
                        <p className="text-xl font-bold italic leading-tight text-white/90">{isFog ? "Locked Sequence" : getProg().blueprint[i]?.goal || "Defining..."}</p>
                      </div>
                    </div>
                  );
                })}
             </div>
           </div>
        </main>
      )}

      {/* Cinematic Story Episode Overlay */}
      {showVideo && selectedSeries && (
        <div className="fixed inset-0 z-[5000] bg-black animate-fade-in">
          <ReelItem 
            episode={getCurrentEpisode()} 
            series={selectedSeries} 
            isActive={true}
            onFinished={() => { setShowVideo(false); openChat(); }}
            onSkip={() => { setShowVideo(false); openChat(); }}
          />
        </div>
      )}

      {/* Narrative Guide Chat */}
      {chatData && (
        <ChatPanel 
          character={chatData.char} 
          avatar={selectedSeries?.avatars[chatData.char]} 
          instantGreeting={chatData.intro} 
          initialHook={chatData.hook}
          onClose={() => setChatData(null)}
          onProgressUpdate={(type, data) => {
            setProgress(prev => {
              const curr = prev[selectedSeries.id];
              if (type === 'mission') return { ...prev, [selectedSeries.id]: { ...curr, mission: data, session: 2, xp: curr.xp + 50 } };
              if (type === 'blueprint') return { ...prev, [selectedSeries.id]: { ...curr, blueprint: data, session: 3, xp: curr.xp + 100 } };
              if (type === 'step') return { ...prev, [selectedSeries.id]: { ...curr, currentStep: curr.currentStep + 1, streak: curr.streak + 1, xp: curr.xp + 150 } };
              return prev;
            });
          }}
        />
      )}

      <Analytics />
    </div>
  );
};

export default App;