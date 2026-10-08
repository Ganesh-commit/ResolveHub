import React, { useState } from 'react';
import { X, Send, Bot, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const FAQ_KNOWLEDGE_BASE = [
  {
    keywords: ['sla', 'time', 'how long', 'days', 'resolution'],
    answer: 'Standard grievances have a 3-day SLA. If unresolved after 3 days, it auto-escalates to the Head of Department (HOD). After 6 days, it escalates to the Dean.'
  },
  {
    keywords: ['anonymous', 'ragging', 'harassment', 'secret', 'identity', 'welfare'],
    answer: 'Yes! Toggle "Anonymous Mode" when submitting anti-ragging or welfare complaints. Your registration number & name will be completely masked from department staff.'
  },
  {
    keywords: ['reopen', 'unsatisfied', 'not fixed', 'again'],
    answer: 'You can re-open any resolved complaint within your student dashboard under "My Complaints" if you are not satisfied with the technician field work.'
  },
  {
    keywords: ['wifi', 'internet', 'network', 'password'],
    answer: 'For Wi-Fi & Network issues, select category "IT & Network". Tech specialists are dispatched to your specified hostel room/block within 4 hours.'
  },
  {
    keywords: ['scholarship', 'fee', 'dues', 'finance', 'receipt'],
    answer: 'Finance grievances are handled by the Student Finance Bureau. Please attach your payment transaction ID or receipt proof for faster processing.'
  },
  {
    keywords: ['hostel', 'water', 'leak', 'fan', 'ac', 'room', 'bed'],
    answer: 'Hostel & Facilities issues are handled by the Facilities & HVAC team. Select your exact Hostel Block (Block A, B, C, Girls Hostel, NTR Hostel) during submission.'
  }
];

export const KnowledgeBaseChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello! I am ResolveHub Assistant. Ask me anything about complaint filing, SLA escalation, anonymous reporting, or hostel rules!',
      timestamp: 'Just now'
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputVal,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const query = inputVal.toLowerCase();
    setInputVal('');

    // Match query against Knowledge Base
    setTimeout(() => {
      const match = FAQ_KNOWLEDGE_BASE.find(item => 
        item.keywords.some(kw => query.includes(kw))
      );

      const botReply = match 
        ? match.answer 
        : 'Thank you for reaching out! You can submit a direct grievance ticket from the "Submit Complaint" section, and our department specialists will inspect your request within 3 business days.';

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 400);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-[#8B2414] hover:bg-[#721c0e] text-white rounded-full shadow-2xl flex items-center justify-center gap-2 group cursor-pointer transition-all hover:scale-105 ring-4 ring-rose-100"
        aria-label="Open ResolveHub AI Chatbot"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="hidden sm:inline text-xs font-extrabold pr-1">ASK AI HELPER</span>
      </button>

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[480px] animate-slide-up">
          {/* Header */}
          <div className="bg-[#8B2414] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-700/80 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold font-heading">ResolveHub AI Assistant</h4>
                <p className="text-[10px] text-rose-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Knowledge Base Ready
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-rose-200 hover:text-white hover:bg-rose-800/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50 text-xs">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    m.sender === 'user' 
                      ? 'bg-[#8B2414] text-white rounded-br-none shadow-xs' 
                      : 'bg-white border border-stone-200 text-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <span className={`block text-[9px] mt-1 ${m.sender === 'user' ? 'text-rose-200 text-right' : 'text-slate-400'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button 
              onClick={() => setInputVal('What is the SLA timeframe?')}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer"
            >
              SLA Timeframe?
            </button>
            <button 
              onClick={() => setInputVal('How to report anonymously?')}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 font-medium whitespace-nowrap cursor-pointer"
            >
              Anonymous Reporting?
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a question about ResolveHub..."
              className="flex-1 px-3.5 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#8B2414] outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-[#8B2414] hover:bg-[#721c0e] text-white rounded-xl cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
