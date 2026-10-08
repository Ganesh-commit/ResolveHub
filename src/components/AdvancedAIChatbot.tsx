import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  FileText, 
  PhoneCall
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
}

interface EmergencyAlertData {
  isEmergency: boolean;
  alertTitle: string;
  alertMessage: string;
  emergencyContacts: EmergencyContact[];
}

interface TicketDraft {
  title: string;
  category: string;
  department: string;
  location: string;
  urgency: string;
  description: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  emergency?: EmergencyAlertData | null;
  draftTicket?: TicketDraft | null;
  ticketDetail?: any | null;
  rated?: 'up' | 'down' | null;
  requiresAuth?: boolean;
}

export const AdvancedAIChatbot: React.FC = () => {
  const { authUser, currentUserRegNo, fetchComplaints } = useResolveHub();
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'bot',
      text: `Hello ${authUser?.name || 'there'}! I am ResolveHub AI Assistant. I can track your complaints, file new tickets, calculate SLA timelines, or connect you with anti-ragging helpline officers.`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputVal).trim();
    if (!messageText || loading) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setLoading(true);

    try {
      const userToken = authUser?.token || (currentUserRegNo ? `auth-token-${currentUserRegNo}` : '');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }
      if (currentUserRegNo) {
        headers['x-user-regno'] = currentUserRegNo;
        headers['x-user-name'] = authUser?.name || 'Student';
      }

      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-6).map(m => ({ role: m.sender, content: m.text }))
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Request processed.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          emergency: data.emergency,
          draftTicket: data.draftTicket,
          ticketDetail: data.ticketDetail,
          requiresAuth: data.requiresAuth
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ ${data.error || 'Sorry, I encountered a connection issue. Please try again.'}`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        }]);
      }
    } catch (err) {
      setLoading(false);
      
      const lower = messageText.toLowerCase();
      // Check emergency keywords fallback
      const isEmergency = ['ragging', 'harass', 'threat', 'abuse', 'suicide', 'unsafe'].some(w => lower.includes(w));
      let emergencyObj = null;
      if (isEmergency) {
        emergencyObj = {
          isEmergency: true,
          alertTitle: '⚠️ Immediate Anti-Ragging & Emergency Assistance',
          alertMessage: 'Emergency keywords detected. Student Safety Cell & Dean DSW have been notified.',
          emergencyContacts: [
            { name: 'Anti-Ragging Committee Helpline', phone: '+91-863-2344700', email: 'anti-ragging@vignan.ac.in' },
            { name: 'Dean Student Welfare (DSW)', phone: '+91-863-2344710', email: 'dsw@vignan.ac.in' },
            { name: 'Campus Security Control Room', phone: '+91-863-2344799', email: 'security@vignan.ac.in' }
          ]
        };
      }

      // Check Local FAQ Fallback
      const faqMatch = [
        {
          keywords: ['sla', 'time', 'how long', 'days', 'resolution', 'deadline'],
          reply: 'Standard grievances have a 3-day SLA. If unresolved after 3 days, it auto-escalates to the Head of Department (HOD). After 6 days, it escalates to the Dean.'
        },
        {
          keywords: ['anonymous', 'secret', 'identity', 'ragging', 'welfare'],
          reply: 'You can toggle "Anonymous Mode" when submitting anti-ragging or welfare complaints. Your registration number & name are completely shielded from department staff.'
        },
        {
          keywords: ['wifi', 'internet', 'network', 'router', 'portal'],
          reply: 'For Wi-Fi & Network issues, select category "IT & Network". Tech specialists are dispatched to your specified hostel room/block within 4 hours.'
        },
        {
          keywords: ['scholarship', 'fee', 'dues', 'finance', 'receipt'],
          reply: 'Finance grievances are handled by the Student Finance Bureau in the Admin Block. Please attach your payment receipt or transaction ID for faster verification.'
        },
        {
          keywords: ['hostel', 'water', 'leak', 'fan', 'ac', 'room', 'bed', 'clean'],
          reply: 'Hostel & Facilities issues are handled by Estate & Maintenance. Please specify your exact Hostel Block (Block A, B, C, Girls Hostel, NTR Mens).'
        },
        {
          keywords: ['sheet', 'compaint sheet', 'complaint form', 'submit', 'file', 'form'],
          reply: 'To submit a complaint, navigate to the "Submit Grievance" tab in the left sidebar, or type your complaint description directly here in the chat!'
        }
      ].find(item => item.keywords.some(kw => lower.includes(kw)));

      const fallbackReply = faqMatch
        ? faqMatch.reply
        : `Thank you for reaching out! You can submit a direct grievance ticket from the "Submit Complaint" section in the left sidebar menu, and our department specialists will inspect your request within 3 business days.`;

      setMessages(prev => [...prev, {
        id: `bot-fallback-${Date.now()}`,
        sender: 'bot',
        text: fallbackReply,
        emergency: emergencyObj,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      }]);
    }
  };

  const handleConfirmSubmit = async (draft: TicketDraft) => {
    setLoading(true);
    try {
      const userToken = authUser?.token || (currentUserRegNo ? `auth-token-${currentUserRegNo}` : '');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (userToken) headers['Authorization'] = `Bearer ${userToken}`;
      if (currentUserRegNo) headers['x-user-regno'] = currentUserRegNo;

      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: draft.title,
          category: draft.category,
          department: draft.department,
          location: draft.location,
          urgency: draft.urgency,
          description: draft.description,
          studentRegNo: currentUserRegNo || authUser?.username,
          studentName: authUser?.name
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        if (fetchComplaints) fetchComplaints();
        setMessages(prev => [
          ...prev,
          {
            id: `bot-confirm-${Date.now()}`,
            sender: 'bot',
            text: `🎉 **Success! Your grievance has been submitted.**\n\n• **Ticket ID**: ${data.data?.id || '#RH-SUCCESS'}\n• **Status**: Submitted\n• **Estimated SLA**: ${draft.urgency === 'Urgent' ? '24 Hours Express' : '3 Business Days'}\n\nYou can track updates anytime in your **My Complaints** tab or ask me!`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: 'bot',
            text: `⚠️ Could not create ticket: ${data.error || 'Server error'}`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          }
        ]);
      }
    } catch (err) {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: '⚠️ Failed to connect to server for ticket submission.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      ]);
    }
  };

  const handleRateMessage = async (msgId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, rated: rating } : m));
    try {
      await fetch(`${API_BASE}/ai/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: msgId, rating })
      });
    } catch (err) {
      // Silent error for rating
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-[#8B2414] hover:bg-[#721c0e] text-white rounded-full shadow-2xl flex items-center justify-center gap-2.5 group cursor-pointer transition-all duration-300 hover:scale-105 ring-4 ring-rose-100"
        aria-label="Open ResolveHub AI Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#8B2414]"></span>
        </div>
        <span className="hidden sm:inline text-xs font-extrabold pr-1 tracking-wide">ASK AI ASSISTANT</span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[560px] animate-slide-up transition-all">
          {/* Header */}
          <div className="bg-[#8B2414] text-white p-4 flex items-center justify-between border-b border-rose-900/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-700/90 flex items-center justify-center ring-2 ring-rose-300/40 shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide font-heading uppercase flex items-center gap-1.5">
                  ResolveHub AI Assistant
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">ONLINE</span>
                </h4>
                <p className="text-[10px] text-rose-200/90 flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow" /> Security & Tool Calling Enabled
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-rose-200 hover:text-white hover:bg-rose-800/80 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl shadow-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#8B2414] text-white rounded-br-xs'
                      : 'bg-white border border-stone-200/90 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line font-sans leading-relaxed">{m.text}</p>

                  {/* Emergency Alert Banner */}
                  {m.emergency?.isEmergency && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                      <div className="flex items-center gap-2 font-bold text-[11px] text-rose-700">
                        <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce" />
                        {m.emergency.alertTitle}
                      </div>
                      <p className="text-[10px] mt-1 text-rose-800">{m.emergency.alertMessage}</p>
                      <div className="mt-2 space-y-1">
                        {m.emergency.emergencyContacts.map((c, i) => (
                          <a
                            key={i}
                            href={`tel:${c.phone}`}
                            className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-rose-200 text-[10px] font-semibold text-rose-900 hover:bg-rose-100/50"
                          >
                            <span>{c.name}: {c.phone}</span>
                            <PhoneCall className="w-3 h-3 text-rose-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Draft Ticket Confirmation Box */}
                  {m.draftTicket && (
                    <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span className="flex items-center gap-1.5 text-amber-900">
                          <FileText className="w-4 h-4 text-amber-600" /> Ready to Submit Grievance?
                        </span>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[9px] uppercase font-black">
                          {m.draftTicket.urgency}
                        </span>
                      </div>
                      <div className="text-[10px] space-y-1 bg-white p-2.5 rounded-lg border border-amber-200/60">
                        <p><strong className="text-slate-700">Category:</strong> {m.draftTicket.category}</p>
                        <p><strong className="text-slate-700">Department:</strong> {m.draftTicket.department}</p>
                        <p><strong className="text-slate-700">Location:</strong> {m.draftTicket.location}</p>
                        <p><strong className="text-slate-700">Summary:</strong> {m.draftTicket.title}</p>
                      </div>
                      <button
                        onClick={() => handleConfirmSubmit(m.draftTicket!)}
                        disabled={loading}
                        className="w-full py-2 bg-[#8B2414] hover:bg-[#721c0e] text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Confirm & Submit Ticket
                      </button>
                    </div>
                  )}

                  {/* Timestamp & Feedback bar for Bot */}
                  <div className={`flex items-center justify-between mt-2 pt-1 border-t ${m.sender === 'user' ? 'border-rose-700 text-rose-200 text-[9px]' : 'border-stone-100 text-slate-400 text-[9px]'}`}>
                    <span>{m.timestamp}</span>
                    {m.sender === 'bot' && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          onClick={() => handleRateMessage(m.id, 'up')}
                          className={`p-1 hover:text-emerald-600 cursor-pointer transition-colors ${m.rated === 'up' ? 'text-emerald-600' : ''}`}
                          title="Helpful response"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRateMessage(m.id, 'down')}
                          className={`p-1 hover:text-rose-600 cursor-pointer transition-colors ${m.rated === 'down' ? 'text-rose-600' : ''}`}
                          title="Unhelpful response"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-bl-xs flex items-center gap-2 text-slate-500 text-xs shadow-xs">
                  <Bot className="w-4 h-4 text-[#8B2414] animate-bounce" />
                  <span className="font-medium animate-pulse">Thinking & executing tools...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            <button
              onClick={() => handleSendMessage('Check status of my submitted complaints')}
              className="px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-[#8B2414] text-slate-700 font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors border border-stone-200/80"
            >
              <Clock className="w-3 h-3 text-[#8B2414]" /> Track My Complaints
            </button>
            <button
              onClick={() => handleSendMessage('What is the SLA timeframe for resolution?')}
              className="px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-[#8B2414] text-slate-700 font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors border border-stone-200/80"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> SLA Timeframe
            </button>
            <button
              onClick={() => handleSendMessage('How do I report anonymously?')}
              className="px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-rose-50 hover:text-[#8B2414] text-slate-700 font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors border border-stone-200/80"
            >
              <ShieldAlert className="w-3 h-3 text-emerald-600" /> Anonymous Reporting
            </button>
            <button
              onClick={() => handleSendMessage('Give me anti-ragging emergency contacts')}
              className="px-2.5 py-1.5 rounded-full bg-rose-50 text-rose-800 font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors border border-rose-200"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" /> Anti-Ragging Help
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type your message or grievance..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#8B2414] outline-none transition-all placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="p-2.5 bg-[#8B2414] hover:bg-[#721c0e] disabled:opacity-50 text-white rounded-xl cursor-pointer transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
