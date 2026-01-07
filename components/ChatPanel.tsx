import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';

interface ChatPanelProps {
  character: string;
  avatar: string;
  instantGreeting: string;
  initialHook: string;
  episodeId: number;
  onClose: (goal?: string, steps?: string[]) => void;
  onProgressUpdate?: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  character, avatar, instantGreeting, initialHook, episodeId, onClose, onProgressUpdate 
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; time: string }[]>([
    { role: 'assistant', content: instantGreeting, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [lastGoal, setLastGoal] = useState<string>('');
  const [lastSteps, setLastSteps] = useState<string[]>([]);
  const [sessionProgress, setSessionProgress] = useState(15);
  const scrollRef = useRef<HTMLDivElement>(null);
  const systemPrompt = useRef<string>('');

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const commonInstructions = " Keep it short (max 45 words). If the user agrees to a set of milestones/steps, you MUST trigger the lock. Format: GOAL_LOCKED: [Summary] | STEPS: [Step 1, Step 2, Step 3].";
    
    if (character === 'Anish') {
      const prompts = [
        `You are Anish. Ep 1: Readiness. Propose 3 high-agency MVP steps. Use Hinglish. Ask for agreement.`,
        `You are Anish. Ep 2: Roles. Propose a clear ownership split (Tech vs Sales). Get their 'OK'.`,
        `You are Anish. Ep 3: Moat. Propose 3 specific defensibility milestones. Get their agreement.`,
        `You are Anish. Ep 4: Sprint. Propose a specific 7-day tactical roadmap. Get their 'OK'.`,
        `You are Anish. Ep 5: Scale. Propose 3 major scaling milestones. Get their agreement.`
      ];
      systemPrompt.current = (prompts[episodeId - 1] || prompts[0]) + " Hinglish energy is a must." + commonInstructions;
    } else {
      const prompts = [
        `You are Debu. Ep 1: Vision. Propose 3 elements of their Cinematic Soul. Ask for agreement.`,
        `You are Debu. Ep 2: Pacing. Propose 3-4 key visual beats for their storyboard. Get their 'OK'.`,
        `You are Debu. Ep 3: Mood. Propose a specific Lighting Mood Palette. Get their agreement.`,
        `You are Debu. Ep 4: Edit. Propose 3 core narrative rules for the final cut. Get their 'OK'.`,
        `You are Debu. Ep 5: Market. Propose 3 distribution phase milestones. Get their agreement.`
      ];
      systemPrompt.current = (prompts[episodeId - 1] || prompts[0]) + " Professional and artistic." + commonInstructions;
    }
  }, [character, episodeId]);

  const handleSkip = () => {
    onProgressUpdate?.();
    onClose();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping || isComplete) return;
    const userText = inputValue.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userText, time: now }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const history = messages.map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      })).concat([{ role: 'user', parts: [{ text: userText }] }]);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: { systemInstruction: systemPrompt.current, temperature: 0.8 },
      });
      
      const aiText = response.text || "...";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setSessionProgress(prev => Math.min(prev + 20, 95));

      // DETECT GOAL & STEPS LOCKING
      // Expected Format: GOAL_LOCKED: [Goal] | STEPS: [Step 1, Step 2, Step 3]
      if (aiText.toUpperCase().includes("GOAL_LOCKED:")) {
        const goalPart = aiText.match(/GOAL_LOCKED:\s*(.*?)(?:\s*\||$)/i);
        const stepsPart = aiText.match(/STEPS:\s*(.*)/i);
        
        const goalStr = goalPart ? goalPart[1].trim() : "Mastery Milestone Sync";
        const stepsArr = stepsPart 
          ? stepsPart[1].split(/,|;|\./).map(s => s.trim()).filter(s => s.length > 2)
          : ["Executing Chapter Mastery"];

        setLastGoal(goalStr);
        setLastSteps(stepsArr);
        setSessionProgress(100);
        
        setTimeout(() => {
          setIsComplete(true);
          onProgressUpdate?.();
        }, 1500);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Server error. Say again?", time: "Now" }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex flex-col bg-[#efeae2] h-full font-sans">
      {/* Header */}
      <div className="relative z-10 bg-[#f0f2f5] border-b border-gray-300 shadow-sm overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 h-[4px] bg-blue-500 transition-all duration-1000 z-20 shadow-[0_0_10px_#3b82f6]" style={{ width: `${sessionProgress}%` }} />
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={() => onClose()} className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors text-[#54656f]">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
          </button>
          <img src={avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" />
          <div className="flex-1 min-w-0">
            <h4 className="text-[17px] font-black text-[#111b21] uppercase italic tracking-tighter leading-tight">{character}</h4>
            <p className="text-[11px] text-[#00a884] font-black uppercase tracking-[0.2em] truncate">{initialHook}</p>
          </div>
          {!isComplete && (
            <button 
              onClick={handleSkip}
              className="px-4 py-2 rounded-full bg-white/50 border border-gray-300 text-[9px] font-black uppercase tracking-widest text-[#54656f] active:scale-90 transition-all"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-8 space-y-5 flex flex-col bg-transparent hide-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-[15px] max-w-[85%] ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <span className="text-[#111b21] font-semibold leading-relaxed whitespace-pre-wrap">{m.content}</span>
              <p className="text-[8px] text-[#667781] text-right mt-2 italic uppercase font-black">{m.time}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="self-start bg-white px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75" />
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150" />
          </div>
        )}
      </div>

      {/* Completion Overlay */}
      {isComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-3xl animate-fade-in">
           <div className="w-full max-w-sm bg-white rounded-[4rem] p-12 text-center shadow-4xl transform animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-blue-500 mx-auto flex items-center justify-center text-white text-4xl mb-6 shadow-[0_0_30px_#3b82f6] animate-pulse">✓</div>
              <h3 className="text-2xl font-black italic uppercase text-black mb-1 tracking-tighter">Roadmap Sync'd</h3>
              <p className="text-[10px] text-gray-400 mb-6 font-black uppercase tracking-[0.2em]">Goal Locked into Tracker</p>
              
              <div className="bg-gray-50 p-6 rounded-[2rem] mb-8 text-left border border-gray-100">
                <p className="text-xs font-black uppercase text-blue-500 mb-2">Primary Goal:</p>
                <p className="text-sm font-bold italic text-black/80 mb-4">"{lastGoal}"</p>
                <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Agreed Steps:</p>
                <div className="space-y-1.5">
                  {lastSteps.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-1 h-1 rounded-full bg-blue-400" />
                      <p className="text-[10px] font-bold text-gray-500 truncate">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => onClose(lastGoal, lastSteps)} 
                className="w-full py-6 rounded-[2.5rem] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
              >
                Proceed to Mastery
              </button>
           </div>
        </div>
      )}

      {/* Input Area */}
      {!isComplete && (
        <div className="bg-[#f0f2f5] px-4 py-5 flex items-center gap-4 shrink-0 pb-safe">
          <div className="flex-1 bg-white rounded-full flex items-center px-7 py-4 shadow-inner border border-gray-200">
            <input 
              type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Agree to steps..." className="flex-1 text-[16px] outline-none text-[#111b21] bg-transparent font-semibold" 
            />
          </div>
          <button onClick={handleSend} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${inputValue.trim() ? 'bg-[#00a884] text-white scale-105 shadow-[#00a884]/40' : 'bg-gray-300 text-gray-500'}`}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
