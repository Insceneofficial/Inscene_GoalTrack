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

interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

interface ProjectGoal {
  title: string;
  milestones: Milestone[];
  startDate: string;
  overallProgress: number;
}

const SERIES_CATALOG = [
  {
    id: 'startup-boy-anish',
    title: 'Founder Mode',
    tagline: 'Anish x Insayy',
    influencer: 'Anish',
    avatars: { Anish: ANISH_AVATAR },
    thumbnail: getSmartImageUrl("https://lh3.googleusercontent.com/d/1FKR6HevmeSv1baTCUtfi5CWQo8FO0QAf", "anish_v2", 800, 800),
    episodes: [
      { id: 1, title: "The First Step", subtitle: "Fundraising & Grants", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep1.mp4", chatGoal: "Define Project Goal" },
      { id: 2, title: "Founder Dynamics", subtitle: "CEO/CTO Roles & Partners", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep2.mp4", chatGoal: "Milestone Sync" },
      { id: 3, title: "The AI Moat", subtitle: "Beating Gemini & OpenAI", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep3.mp4", chatGoal: "Moat Execution" },
      { id: 4, title: "Execution Plan", subtitle: "Tactical Implementation", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep4.mp4", chatGoal: "Sprint Sync" },
      { id: 5, title: "Scale or Pivot", subtitle: "The Final Verdict", url: "https://github.com/Insceneofficial/ai-studio-demo-assets/releases/download/Video/Anish_Ep5.mp4", chatGoal: "Final Launch" }
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
      { id: 1, title: "The Visionary Eye", subtitle: "Finding the Lens", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode1_Debu.mp4", chatGoal: "Cinematic Vision" },
      { id: 2, title: "The Storyboard", subtitle: "Visual Pacing", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode2_Debu.mp4", chatGoal: "Storyboard Check" },
      { id: 3, title: "Shadow & Light", subtitle: "Emotional Lighting", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode3_Debu.mp4", chatGoal: "Lighting Sync" },
      { id: 4, title: "The Edit", subtitle: "Final Cut Logic", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode4_Debu.mp4", chatGoal: "Edit Update" },
      { id: 5, title: "Premiere Day", subtitle: "Distribution Strategy", url: "https://github.com/rajatboss1/DebuTv_videostorange/releases/download/video/Episode5_Debu.mp4", chatGoal: "Market Launch" }
    ]
  }
];

const App: React.FC = () => {
  const [isSplash, setIsSplash] = useState(true);
  const [view, setView] = useState<'discover' | 'profile'>('discover');
  const [profileTab, setProfileTab] = useState<'episodes' | 'goals' | 'leaderboard'>('episodes');
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [chatData, setChatData] = useState<any>(null);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);
  
  const [userProgress, setUserProgress] = useState<Record<string, number>>({
    'startup-boy-anish': 1,
    'deb-filmmaker': 1
  });
  const [projectGoals, setProjectGoals] = useState<Record<string, ProjectGoal>>({});
  const [streak, setStreak] = useState(3);
  const [rank, setRank] = useState(12);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSeriesSelect = (series: any) => {
    setSelectedSeries(series);
    setView('profile');
    setProfileTab('episodes');
  };

  const getProg = (id: string) => userProgress[id] || 1;
  const currentGoal = selectedSeries ? projectGoals[selectedSeries.id] : null;

  const handleChatClose = (goalStr?: string, stepsArr?: string[], completedIds?: string[]) => {
    const finishedId = chatData.episodeId;
    setChatData(null);
    
    if (goalStr && stepsArr) {
      setProjectGoals(prev => {
        const sId = selectedSeries.id;
        const milestones = stepsArr.map((s, idx) => ({ 
          id: `m-${idx}`, 
          text: s, 
          completed: completedIds?.includes(`m-${idx}`) || false 
        }));
        
        const doneCount = milestones.filter(m => m.completed).length;
        const progress = Math.round((doneCount / milestones.length) * 100);

        return {
          ...prev,
          [sId]: {
            title: goalStr,
            milestones,
            startDate: prev[sId]?.startDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            overallProgress: progress
          }
        };
      });
    } else if (completedIds && selectedSeries) {
      setProjectGoals(prev => {
        const sId = selectedSeries.id;
        const existing = prev[sId];
        if (!existing) return prev;
        
        const newMilestones = existing.milestones.map(m => ({
          ...m,
          completed: completedIds.includes(m.id) || m.completed
        }));
        
        const doneCount = newMilestones.filter(m => m.completed).length;
        const progress = Math.round((doneCount / newMilestones.length) * 100);
        
        return {
          ...prev,
          [sId]: { ...existing, milestones: newMilestones, overallProgress: progress }
        };
      });
    }

    const currentProg = getProg(selectedSeries.id);
    if (finishedId === currentProg) {
      setUserProgress(prev => ({ 
        ...prev, 
        [selectedSeries.id]: Math.min(currentProg + 1, selectedSeries.episodes.length) 
      }));
      setStreak(s => s + 1);
    }
  };

  if (isSplash) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <Logo size={120} isPulsing={true} className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden font-sans">
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
               <button onClick={() => setView('discover')} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5"><path d="M15 19l-7-7 7-7" /></svg>
               </button>
               <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400">Chapter {getProg(selectedSeries.id)} / {selectedSeries.episodes.length}</p>
               </div>
             </div>

             {/* STATS BAR */}
             <div className="flex gap-4 p-4 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
                <div onClick={() => setProfileTab('goals')} className="flex-1 flex flex-col items-center justify-center py-3 rounded-[1.8rem] bg-orange-500/10 border border-orange-500/20 cursor-pointer active:scale-95 transition-all">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-500 text-lg">🔥</span>
                      <span className="text-xl font-black italic">{streak}</span>
                   </div>
                   <p className="text-[8px] font-black uppercase tracking-widest text-orange-500/60">STREAK</p>
                </div>
                <div onClick={() => setProfileTab('leaderboard')} className="flex-1 flex flex-col items-center justify-center py-3 rounded-[1.8rem] bg-blue-500/10 border border-blue-500/20 cursor-pointer active:scale-95 transition-all">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 text-lg">🏆</span>
                      <span className="text-xl font-black italic">#{rank}</span>
                   </div>
                   <p className="text-[8px] font-black uppercase tracking-widest text-blue-400/60">GLOBAL</p>
                </div>
                <div onClick={() => setProfileTab('goals')} className="flex-1 flex flex-col items-center justify-center py-3 rounded-[1.8rem] bg-emerald-500/10 border border-emerald-500/20 cursor-pointer active:scale-95 transition-all">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-emerald-400 text-lg">🎯</span>
                      <span className="text-xl font-black italic">{currentGoal ? currentGoal.overallProgress : 0}%</span>
                   </div>
                   <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60">GOAL</p>
                </div>
             </div>

             {/* Influencer Profile */}
             <div className="bg-gradient-to-br from-white/10 to-transparent p-12 rounded-[4.5rem] border border-white/10 shadow-3xl text-center relative overflow-hidden">
                <img src={selectedSeries.avatars[selectedSeries.influencer]} className="w-32 h-32 rounded-full mx-auto border-4 border-white mb-6 shadow-4xl object-cover" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-1">{selectedSeries.influencer}</h2>
                <p className="text-[10px] text-white/40 mb-8 font-black uppercase tracking-widest">{selectedSeries.title}</p>
                <button 
                  onClick={() => setActiveEpisode(selectedSeries.episodes.find((e: any) => e.id === getProg(selectedSeries.id)))}
                  className="w-full py-6 rounded-[2.5rem] bg-white text-black text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                >
                  Watch Next Chapter
                </button>
             </div>

             {/* TABS */}
             <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10">
                {(['episodes', 'goals', 'leaderboard'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setProfileTab(tab)}
                    className={`flex-1 py-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${profileTab === tab ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}
                  >
                    {tab}
                  </button>
                ))}
             </div>

             {/* TAB CONTENT: Episodes */}
             {profileTab === 'episodes' && (
                <div className="space-y-6 animate-fade-in">
                  {selectedSeries.episodes.map((ep: any) => {
                    const isCompleted = ep.id < getProg(selectedSeries.id);
                    const isCurrent = ep.id === getProg(selectedSeries.id);
                    const isLocked = ep.id > getProg(selectedSeries.id);
                    return (
                      <div 
                        key={ep.id} 
                        onClick={() => !isLocked && setActiveEpisode(ep)}
                        className={`group flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all ${isCurrent ? 'bg-white/10 border-blue-500/50 scale-[1.02] shadow-2xl' : 'bg-transparent border-white/5'} ${isLocked ? 'opacity-20 grayscale cursor-not-allowed' : 'opacity-100 hover:bg-white/10 cursor-pointer'}`}
                      >
                        <div className={`w-14 h-14 rounded-[1.8rem] flex items-center justify-center font-black italic text-2xl border-2 transition-all ${isCompleted ? 'bg-blue-500 border-blue-400 text-white' : isCurrent ? 'border-blue-500 text-blue-400 animate-pulse' : 'border-white/10 text-white/20'}`}>
                          {isCompleted ? '✓' : ep.id}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCurrent ? 'text-blue-400' : 'text-white/30'}`}>{ep.subtitle}</h4>
                          <p className="text-lg font-bold italic tracking-tight leading-tight">{ep.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
             )}

             {/* TAB CONTENT: Goals */}
             {profileTab === 'goals' && (
                <div className="space-y-8 animate-fade-in pb-12">
                  <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-3xl shadow-3xl">
                    <header className="mb-10 text-center border-b border-white/5 pb-8">
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">
                         {currentGoal ? currentGoal.title : "Your Roadmap"}
                       </h3>
                       <div className="flex items-center justify-center gap-4">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Project Status</p>
                         <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${currentGoal ? currentGoal.overallProgress : 0}%` }} />
                         </div>
                       </div>
                    </header>
                    
                    {currentGoal ? (
                      <div className="relative pl-10 space-y-10 border-l-2 border-white/5">
                        {currentGoal.milestones.map((m) => (
                          <div key={m.id} className="relative group">
                             <div className={`absolute -left-[49px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-500 ${m.completed ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_#10b981]' : 'bg-black border-white/20'}`} />
                             
                             <div className={`flex items-center gap-4 p-6 rounded-[2rem] border transition-all ${m.completed ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg' : 'bg-white/5 border-white/5'}`}>
                                <p className={`flex-1 text-sm font-bold italic tracking-tight ${m.completed ? 'text-emerald-400' : 'text-white/60'}`}>
                                  {m.text}
                                </p>
                                {m.completed ? (
                                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/20 px-3 py-1 rounded-full">Done</span>
                                ) : (
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Pending</span>
                                )}
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-dashed border-white/20">
                          <span className="text-3xl text-white/20">🎯</span>
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white/20">No Project Goals Set Yet</p>
                        <p className="text-xs text-white/40 px-8 leading-relaxed">Finish your first chapter and talk to {selectedSeries.influencer} to lock in your project milestones.</p>
                      </div>
                    )}

                    {currentGoal && (
                       <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] text-center">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Roadmap Sync: Active</p>
                         <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">Progress updates handled via chat</p>
                       </div>
                    )}
                  </div>
                </div>
             )}

             {/* TAB CONTENT: Leaderboard */}
             {profileTab === 'leaderboard' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem]">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 text-center">Global Performance</h4>
                     <div className="space-y-4">
                        {[
                          { name: 'Rohan.eth', score: 2450, rank: 1, avatar: 'https://i.pravatar.cc/100?u=1', streak: 12 },
                          { name: 'Sarah_X', score: 2120, rank: 2, avatar: 'https://i.pravatar.cc/100?u=2', streak: 8 },
                          { name: 'DevKing', score: 1980, rank: 3, avatar: 'https://i.pravatar.cc/100?u=3', streak: 5 },
                          { name: 'You', score: 1240, rank: rank, avatar: selectedSeries.avatars[selectedSeries.influencer], isMe: true, streak: streak }
                        ].sort((a,b) => a.rank - b.rank).map((u, i) => (
                           <div key={i} className={`flex items-center gap-4 p-4 rounded-3xl ${u.isMe ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'}`}>
                              <span className="text-xs font-black text-white/30 w-6">{u.rank}</span>
                              <img src={u.avatar} className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                              <div className="flex-1">
                                <p className={`text-sm font-black italic tracking-tight ${u.isMe ? 'text-blue-400' : 'text-white'}`}>{u.name}</p>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{u.score} Mastery Pts</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-orange-500">🔥 {u.streak}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
             )}
           </div>
        </main>
      )}

      {activeEpisode && (
        <div className="fixed inset-0 z-[5000] bg-black">
          <div className="relative h-full w-full">
            <video src={activeEpisode.url} className="h-full w-full object-cover" onEnded={() => { setActiveEpisode(null); setChatData({ char: selectedSeries.influencer, episodeId: activeEpisode.id, hook: activeEpisode.chatGoal }); }} autoPlay playsInline />
            <div className="absolute top-12 left-6">
              <button onClick={() => setActiveEpisode(null)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5 text-white"><path d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
            <div className="absolute bottom-12 left-6 right-6">
               <button onClick={() => { setActiveEpisode(null); setChatData({ char: selectedSeries.influencer, episodeId: activeEpisode.id, hook: activeEpisode.chatGoal }); }} className="w-full py-6 rounded-[2.5rem] bg-white text-black text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl">Skip to Coaching Session</button>
            </div>
          </div>
        </div>
      )}

      {chatData && (
        <ChatPanel 
          character={chatData.char} 
          avatar={selectedSeries?.avatars[chatData.char]} 
          instantGreeting={
            currentGoal 
              ? `Roadmap check! How's the "${currentGoal.title}" project coming along? Did you complete anything new?`
              : `I'm ${chatData.char}. What's your project goal? Let's build a roadmap together.`
          } 
          initialHook={chatData.hook}
          episodeId={chatData.episodeId}
          existingGoal={currentGoal}
          onClose={handleChatClose}
        />
      )}

      <Analytics />
    </div>
  );
};

export default App;
