import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';

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

interface ChatPanelProps {
  character: string;
  avatar: string;
  instantGreeting: string;
  initialHook: string;
  episodeId: number;
  existingGoal?: ProjectGoal | null;
  onClose: (goal?: string, steps?: string[], completedIds?: string[]) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  character, avatar, instantGreeting, initialHook, episodeId, existingGoal, onClose 
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; time: string }[]>([
    { role: 'assistant', content: instantGreeting, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(15);
  const [confirmedData, setConfirmedData] = useState<{ goal?: string; steps?: string[]; completedIds?: string[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const getSystemInstruction = () => {
    const isAnish = character === 'Anish';
    const persona = isAnish 
      ? "You are Anish, a direct Hinglish startup coach. High agency, tactical."
      : "You are Debu, a pro cinematic director. Visionary and professional.";
    
    const goalState = existingGoal 
      ? `CURRENT PROJECT: "${existingGoal.title}". 
         MILESTONES: ${existingGoal.milestones.map(m => `[${m.id}] ${m.text} (${m.completed ? 'Done' : 'Pending'})`).join(', ')}.`
      : `NO PROJECT SET. MISSION: Help them define a project goal.`;

    return `${persona}
    ${goalState}
    
    COACHING FLOW:
    1. If no project: Ask user for their goal.
    2. Once they say a goal: Propose 5-6 clear milestones (e.g. Market Research, Beta, Launch).
    3. WAIT for user to say 'yes', 'agreed', 'sounds good', or similar.
    4. ONLY after agreement, output: GOAL_LOCKED: Goal Title | MILESTONES: Milestone 1, Milestone 2, ...
    5. If progress update: If user mentions completing a milestone, and they agree to sync it, output: PROGRESS_SYNC: m-0, m-1, ...
    
    IMPORTANT: Do not put brackets around the Goal Title or Milestones in your final output string. Keep responses under 45 words.`;
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
        config: { systemInstruction: getSystemInstruction(), temperature: 0.8 },
      });
      
      const aiText = response.text || "...";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setSessionProgress(prev => Math.min(prev + 20, 95));

      // NEW GOAL LOCK - Strict parsing to avoid brackets
      if (aiText.toUpperCase().includes("GOAL_LOCKED:")) {
        const gMatch = aiText.match(/GOAL_LOCKED:\s*(.*?)(?:\s*\||$)/i);
        const mMatch = aiText.match(/MILESTONES:\s*(.*)/i);
        if (gMatch && mMatch) {
          // Strip leading/trailing brackets if AI accidentally added them
          const title = gMatch[1].trim().replace(/^\[|\]$/g, '');
          const steps = mMatch[1].split(/,|;/).map(s => s.trim().replace(/^\[|\]$/g, '')).filter(s => s.length > 1);
          setConfirmedData({ goal: title, steps });
          setSessionProgress(100);
          setTimeout(() => setIsComplete(true), 1500);
        }
      }
      
      // PROGRESS UPDATE LOCK
      if (aiText.toUpperCase().includes("PROGRESS_SYNC:")) {
        const sMatch = aiText.match(/PROGRESS_SYNC:\s*(.*)$/i);
        if (sMatch) {
          const ids = sMatch[1].split(/,|;/).map(id => id.trim().replace(/[\[\]]/g, ''));
          setConfirmedData({ completedIds: ids });
          setSessionProgress(100);
          setTimeout(() => setIsComplete(true), 1500);
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Server lag. Try again?", time: "Now" }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex flex-col bg-[#efeae2] h-full font-sans animate-fade-in">
      {/* Header */}
      <div className="relative z-10 bg-[#f0f2f5] border-b border-gray-300">
        <div className="absolute top-0 left-0 h-[4px] bg-blue-500 transition-all duration-1000 z-20" style={{ width: `${sessionProgress}%` }} />
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={() => onClose()} className="p-2 -ml-2 text-[#54656f]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg></button>
          <img src={avatar} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
          <div className="flex-1 min-w-0">
            <h4 className="text-[17px] font-black text-[#111b21] uppercase italic leading-tight">{character}</h4>
            <p className="text-[11px] text-[#00a884] font-black uppercase tracking-widest truncate">Roadmap Session</p>
          </div>
          <button onClick={() => onClose()} className="px-4 py-2 rounded-full bg-white/50 text-[9px] font-black uppercase tracking-widest text-gray-500">Close</button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-8 space-y-5 flex flex-col hide-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-[15px] max-w-[85%] ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <span className="text-[#111b21] font-semibold leading-relaxed">{m.content}</span>
              <p className="text-[8px] text-gray-400 text-right mt-2 font-black uppercase italic">{m.time}</p>
            </div>
          </div>
        ))}
        {isTyping && <div className="self-start bg-white px-5 py-3 rounded-2xl animate-pulse text-xs font-black text-gray-400 uppercase italic">Coach is thinking...</div>}
      </div>

      {/* Success View */}
      {isComplete && confirmedData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl animate-fade-in">
           <div className="w-full max-w-sm bg-white rounded-[4rem] p-12 text-center shadow-4xl transform animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-emerald-500 mx-auto flex items-center justify-center text-white text-4xl mb-6 shadow-[0_0_30px_#10b981] animate-pulse">✓</div>
              <h3 className="text-2xl font-black italic uppercase text-black mb-1 tracking-tighter">Roadmap Sync'd</h3>
              <p className="text-[10px] text-gray-400 mb-8 font-black uppercase tracking-widest">Goal Added to Tracker</p>
              
              <button 
                onClick={() => onClose(confirmedData.goal, confirmedData.steps, confirmedData.completedIds)} 
                className="w-full py-6 rounded-[2.5rem] bg-black text-white text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
              >
                Go to Tracker
              </button>
           </div>
        </div>
      )}

      {/* Input */}
      {!isComplete && (
        <div className="bg-[#f0f2f5] px-4 py-5 flex items-center gap-4 shrink-0 pb-safe">
          <div className="flex-1 bg-white rounded-full flex items-center px-7 py-4 border border-gray-200">
            <input 
              type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Refine roadmap..." className="flex-1 text-[16px] outline-none bg-transparent font-semibold text-[#111b21]" 
            />
          </div>
          <button onClick={handleSend} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${inputValue.trim() ? 'bg-[#00a884] text-white shadow-lg' : 'bg-gray-300 text-gray-500'}`}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
