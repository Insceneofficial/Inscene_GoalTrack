
import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';

interface ChatPanelProps {
  character: string;
  avatar: string;
  instantGreeting: string;
  initialHook: string;
  episodeId: number;
  onClose: () => void;
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
  const [sessionProgress, setSessionProgress] = useState(15);
  const scrollRef = useRef<HTMLDivElement>(null);
  const systemPrompt = useRef<string>('');

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (character === 'Anish') {
      const prompts = [
        `You are Anish. Ep 1: Fundraising/Grants. TASK: User needs a 30-day MVP goal. Be high-agency. When happy, say "GOAL LOCKED".`,
        `You are Anish. Ep 2: Roles & Co-founders. TASK: Break the goal into 5 weekly steps. Adjust for roles. When agreed, say "STEPS LOCKED".`,
        `You are Anish. Ep 3: Moats vs AI Giants. TASK: Define defensibility. Why will user survive? When agreed, say "MOAT DEFINED".`,
        `You are Anish. Ep 4: Idea Stress Test. TASK: Ask 3 brutal questions about execution. When they pass, say "IDEA REFINED".`,
        `You are Anish. Ep 5: Team & Pivot Logic. TASK: Finalize scale plan and first hire. When done, say "READY TO SCALE".`
      ];
      systemPrompt.current = (prompts[episodeId - 1] || prompts[0]) + " MAX 30 words. Hinglish is great. Stay in character.";
    } else {
      systemPrompt.current = `You are Debu. Guide user through Episode ${episodeId} vision. When happy, say "CHAPTER SYNCED". MAX 30 words.`;
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
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })).concat([{ role: 'user', parts: [{ text: userText }] }]),
        config: { systemInstruction: systemPrompt.current, temperature: 0.8 },
      });
      
      const aiText = response.text || "...";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setSessionProgress(prev => Math.min(prev + 20, 95));

      const triggers = ["GOAL LOCKED", "STEPS LOCKED", "MOAT DEFINED", "IDEA REFINED", "READY TO SCALE", "CHAPTER SYNCED"];
      if (triggers.some(t => aiText.toUpperCase().includes(t))) {
        setSessionProgress(100);
        setTimeout(() => {
          setIsComplete(true);
          onProgressUpdate?.();
        }, 1200);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Lag. Say again?", time: "Now" }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex flex-col bg-[#efeae2] animate-fade-in font-sans h-full">
      <div className="relative z-10 bg-[#f0f2f5] border-b border-gray-300 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 h-[3px] bg-blue-500 transition-all duration-1000 z-20" style={{ width: `${sessionProgress}%` }} />
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-[#54656f]"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
          </button>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
            <img src={avatar} alt={character} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[17px] font-black text-[#111b21] uppercase italic tracking-tighter leading-tight">{character}</h4>
            <p className="text-[11px] text-[#00a884] font-black uppercase tracking-[0.2em] truncate">{initialHook}</p>
          </div>
          {/* Skip Option in Chat Window */}
          {!isComplete && (
            <button 
              onClick={handleSkip}
              className="px-4 py-2 rounded-full bg-white/50 border border-gray-300 text-[10px] font-black uppercase tracking-widest text-[#54656f] hover:bg-white active:scale-90 transition-all"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-5 py-8 space-y-5 flex flex-col bg-transparent">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative px-5 py-3 rounded-2xl shadow-sm text-[15px] max-w-[85%] ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <span className="text-[#111b21] font-semibold leading-relaxed">{m.content}</span>
              <p className="text-[9px] text-[#667781] text-right mt-2 italic uppercase font-black">{m.time}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="self-start bg-white px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
          </div>
        )}
      </div>

      {isComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl">
           <div className="w-full max-w-sm bg-white rounded-[4rem] p-12 text-center shadow-4xl animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-blue-500 mx-auto flex items-center justify-center text-white text-4xl mb-6 shadow-xl animate-pulse">✓</div>
              <h3 className="text-2xl font-black italic uppercase text-black mb-2 leading-tight">Mastery Synced</h3>
              <p className="text-sm text-gray-500 mb-8 font-bold italic">Episode {episodeId} Complete</p>
              <button onClick={onClose} className="w-full py-5 rounded-[2.5rem] bg-black text-white text-[11px] font-black uppercase tracking-[0.5em] shadow-2xl active:scale-95 transition-all">Next Episode Unlocked</button>
           </div>
        </div>
      )}

      {!isComplete && (
        <div className="relative z-10 bg-[#f0f2f5] px-4 py-5 flex items-center gap-4 pb-safe">
          <div className="flex-1 bg-white rounded-full flex items-center px-7 py-3.5 shadow-inner border border-gray-200">
            <input 
              type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Lock strategy..." className="flex-1 text-[16px] outline-none text-[#111b21] bg-transparent font-bold" 
            />
          </div>
          <button onClick={handleSend} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${inputValue.trim() ? 'bg-[#00a884] text-white' : 'bg-gray-300 text-gray-500'}`}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
