import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';

interface ChatPanelProps {
  character: string;
  avatar: string;
  instantGreeting: string;
  initialHook: string;
  onClose: () => void;
  onProgressUpdate?: (type: 'mission' | 'blueprint' | 'step', data: any) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  character, avatar, instantGreeting, initialHook, onClose, onProgressUpdate 
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; time: string }[]>([
    { role: 'assistant', content: instantGreeting, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [sessionResults, setSessionResults] = useState<{title: string, detail: string} | null>(null);
  const [sessionProgress, setSessionProgress] = useState(10); 
  const scrollRef = useRef<HTMLDivElement>(null);
  const systemPrompt = useRef<string>('');

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const isS1 = initialHook.includes("Goal Locking");
    const isS2 = initialHook.includes("Steps Breaking");
    const isS3 = initialHook.includes("Execution") || initialHook.includes("Grind");

    if (character === 'Debu') {
      systemPrompt.current = `You are Debu, filmmaker. 
        ${isS1 ? 'SESSION 1: GOAL LOCKING. Help user define ONE cinematic 30-day goal. Be collaborative. When agreed, say "MISSION LOCKED: [Goal]".' : ''}
        ${isS2 ? 'SESSION 2: STEPS BREAKING. Break the locked mission into 5 cinematic steps. Be flexible. When agreed, say "BLUEPRINT LOCKED: Step1|Step2|Step3|Step4|Step5".' : ''}
        ${isS3 ? 'Review proof. If verified, say "STEP VERIFIED".' : ''}
        MAX 30 words. Hinglish. No Devanagari.`;
    } else {
      systemPrompt.current = `You are Anish, startup founder. 
        ${isS1 ? 'SESSION 1: GOAL LOCKING. Demand a high-agency 30-day MVP goal. Pivot ideas into growth. When agreed, say "MISSION LOCKED: [Goal]".' : ''}
        ${isS2 ? 'SESSION 2: STEPS BREAKING. Break mission into 5 high-traction execution steps. When agreed, say "BLUEPRINT LOCKED: Step1|Step2|Step3|Step4|Step5".' : ''}
        ${isS3 ? 'Audit proof. If verified, say "STEP VERIFIED".' : ''}
        MAX 30 words. Hustler energy. Hinglish. No Devanagari.`;
    }
  }, [character, initialHook]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping || isSessionComplete) return;
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
      
      setSessionProgress(prev => Math.min(prev + 15, 95));

      if (onProgressUpdate) {
        if (aiText.toUpperCase().includes("MISSION LOCKED:")) {
          const goal = aiText.split("MISSION LOCKED:")[1].split(".")[0].trim();
          setSessionProgress(100);
          setTimeout(() => {
            setIsSessionComplete(true);
            setSessionResults({ title: "Narrative Locked", detail: goal });
            onProgressUpdate('mission', goal);
          }, 1500);
        } else if (aiText.toUpperCase().includes("BLUEPRINT LOCKED:")) {
          const stepsStr = aiText.split("BLUEPRINT LOCKED:")[1].split(".")[0].trim();
          const steps = stepsStr.split("|").map((s, i) => ({ step: i + 1, goal: s.trim() }));
          setSessionProgress(100);
          setTimeout(() => {
            setIsSessionComplete(true);
            setSessionResults({ title: "Timeline Secured", detail: "5 Steps Initialized" });
            onProgressUpdate('blueprint', steps);
          }, 1500);
        } else if (aiText.toUpperCase().includes("STEP VERIFIED")) {
          setSessionProgress(100);
          setTimeout(() => {
            setIsSessionComplete(true);
            setSessionResults({ title: "Milestone Cleared", detail: "Progress Synchronized" });
            onProgressUpdate('step', true);
          }, 1500);
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network jitter. One more time?", time: "Now" }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex flex-col bg-[#efeae2] animate-fade-in h-full w-full overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" style={{ backgroundSize: '400px' }} />
      
      {/* WhatsApp Header with Session Progress */}
      <div className="relative z-10 bg-[#f0f2f5] border-b border-gray-300 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 h-[3px] bg-blue-500 transition-all duration-1000 ease-out z-20 shadow-[0_0_10px_#3b82f6]" style={{ width: `${sessionProgress}%` }} />
        
        <div className="flex items-center gap-4 px-5 py-4">
          {!isSessionComplete && (
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-200 rounded-full">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-[#54656f]"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
            </button>
          )}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
            <img src={avatar} alt={character} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[17px] font-black text-[#111b21] truncate leading-tight uppercase italic tracking-tighter">{character}</h4>
              <span className="text-[9px] font-black text-[#667781] bg-gray-200 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {sessionProgress}% LOCK
              </span>
            </div>
            <p className="text-[11px] text-[#00a884] font-black uppercase tracking-[0.2em]">{initialHook}</p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-5 py-8 space-y-5 flex flex-col hide-scrollbar bg-transparent">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative px-5 py-3 rounded-2xl shadow-sm text-[15px] max-w-[85%] flex flex-col ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <span className="text-[#111b21] leading-relaxed font-semibold">{m.content}</span>
              <span className="text-[10px] text-[#667781] self-end mt-2 font-black italic tracking-tighter uppercase">{m.time}</span>
            </div>
          </div>
        ))}
        {isTyping && <div className="self-start bg-white px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#667781] rounded-full animate-bounce" /><div className="w-2.5 h-2.5 bg-[#667781] rounded-full animate-bounce delay-75" /></div>}
      </div>

      {/* Session Result Overlay */}
      {isSessionComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-2xl animate-fade-in">
           <div className="w-full max-w-sm bg-white rounded-[4rem] p-12 flex flex-col items-center text-center shadow-4xl animate-slide-up">
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl mb-8 shadow-2xl animate-pulse">✓</div>
              <h3 className="text-3xl font-black italic uppercase text-black mb-3 leading-[0.8] tracking-tighter">{sessionResults?.title}</h3>
              <p className="text-base text-gray-500 mb-10 font-bold leading-relaxed italic">"{sessionResults?.detail}"</p>
              <button onClick={onClose} className="w-full py-6 rounded-[2.5rem] bg-black text-white text-[12px] font-black uppercase tracking-[0.5em] active:scale-95 transition-all shadow-3xl">Return to Dashboard</button>
           </div>
        </div>
      )}

      {/* Input */}
      {!isSessionComplete && (
        <div className="relative z-10 bg-[#f0f2f5] px-4 py-5 flex items-center gap-4 pb-safe">
          <div className="flex-1 bg-white rounded-full flex items-center px-7 py-4 shadow-inner">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Lock mission details..." 
              className="flex-1 text-[17px] outline-none text-[#111b21] bg-transparent font-bold" 
            />
          </div>
          <button onClick={handleSend} disabled={isTyping} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${inputValue.trim() ? 'bg-[#00a884] text-white' : 'bg-gray-300 text-gray-500'}`}>
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      )}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default ChatPanel;