import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Send,
  X,
  Trash2,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  Clock,
  User,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'What is a blood pressure reading?',
  'How can I maintain a healthy lifestyle?',
  'What does a CBC test measure?',
  'How should I organize my medical records?',
];

export const FloatingChatWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('meditrack_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved chat:', e);
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: `Hello! I am your **MediTrack AI Assistant**. Ask me about blood pressure readings, CBC test results, healthy lifestyle habits, or clinic navigation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: false,
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('meditrack_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to storage:', e);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, loading]);

  if (location.pathname === '/chat') {
    return null;
  }

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive response from AI Assistant.');
      }

      const botMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        text: data.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: Boolean(data.data.isEmergency),
        disclaimer: data.data.disclaimer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || 'Unable to connect to AI server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const defaultWelcome = [
      {
        id: 'welcome',
        role: 'assistant',
        text: `Chat cleared. Ask me any healthcare education question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: false,
      },
    ];
    setMessages(defaultWelcome);
    localStorage.removeItem('meditrack_chat_history');
  };

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      const boldFormatted = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <span key={i} className="block min-h-[1.15rem]">
          {boldFormatted}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[390px] h-[540px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-3 animate-fadeIn">
          <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-3.5 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">MediTrack AI Assistant</h3>
                <p className="text-[10px] text-teal-100 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Health Education AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:bg-white/20 rounded-lg text-teal-100 hover:text-white transition"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg text-teal-100 hover:text-white transition"
                title="Close Chat"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-[10px] text-amber-900 flex items-center justify-between gap-1 shrink-0">
            <span className="flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              Emergency? Dial 112 / 102 immediately.
            </span>
            <span className="text-[9px] text-amber-700 bg-amber-100 px-1 rounded">24/7</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isAlert = msg.isEmergency;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] ${
                      isUser
                        ? 'bg-slate-900 text-white'
                        : isAlert
                        ? 'bg-rose-600 text-white animate-bounce'
                        : 'bg-teal-600 text-white'
                    }`}
                  >
                    {isUser ? (
                      <User className="w-3.5 h-3.5" />
                    ) : isAlert ? (
                      <PhoneCall className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : isAlert
                        ? 'bg-rose-50 border border-rose-300 text-rose-950 rounded-tl-none'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1 text-[9px] opacity-70">
                      <span className="font-bold">
                        {isUser ? 'You' : isAlert ? 'Emergency Alert' : 'MediTrack AI'}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {msg.timestamp}
                      </span>
                    </div>

                    <div className="space-y-1">{formatText(msg.text)}</div>

                    {!isUser && msg.disclaimer && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9px] text-slate-500 flex items-start gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>General education only. Not diagnostic advice.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Answering</span>
                  <span className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-teal-600 animate-bounce" />
                    <span className="w-1 h-1 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 text-rose-800 text-[10px] flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold underline">
                ✕
              </button>
            </div>
          )}

          <div className="border-t border-slate-200 bg-slate-50 p-2.5 space-y-2 shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              <span className="font-bold text-slate-400 flex items-center gap-0.5 shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                Ask:
              </span>
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="shrink-0 px-2 py-0.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-medium border border-slate-200 rounded-full transition text-[10px] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about vitals, tests, health..."
                disabled={loading}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl transition shadow-sm shrink-0"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <p className="text-[9px] text-center text-slate-400">
              MediTrack AI provides health education only • Not medical advice
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Health Assistant Chat"
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-tr from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white rounded-full shadow-lg shadow-teal-700/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <div className="relative">
          <Bot className="w-5 h-5 stroke-[2.2]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-teal-700 animate-pulse" />
        </div>
        <span className="font-bold text-xs tracking-wide hidden sm:inline-block">
          {isOpen ? 'Close AI Chat' : 'AI Health Chat'}
        </span>
      </button>
    </div>
  );
};
