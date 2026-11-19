import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Trash2,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  Info,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'What is a blood pressure reading?',
  'How can I maintain a healthy lifestyle?',
  'What does a CBC test measure?',
  'How should I organize my medical records?',
];

export const ChatbotPage = () => {
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
        text: `Hello! I am the **MediTrack AI Health Assistant**.

I can help explain common vital signs, lab tests like CBC, healthy lifestyle habits, and how to organize your medical documents.

*How may I help you today? You can select any question below or type your own.*`,
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
        text: `Chat history cleared. I am ready to answer your healthcare education questions!`,
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
        <span key={i} className="block min-h-[1.25rem]">
          {boldFormatted}
        </span>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                MediTrack AI Health Assistant
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Interactive clinical health education, vitals understanding, and wellness support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-xs text-amber-900 flex items-start gap-2.5 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Medical Emergency Notice</p>
          <p className="mt-0.5 text-amber-800">
            If you are experiencing acute chest pain, severe breathlessness, sudden numbness, or signs of stroke, dial{' '}
            <strong className="font-extrabold text-amber-950">112</strong> or{' '}
            <strong className="font-extrabold text-amber-950">102</strong> immediately. This AI assistant provides educational guidance and is not a substitute for urgent clinical care.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isAlert = msg.isEmergency;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : isAlert
                      ? 'bg-rose-600 text-white animate-bounce'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : isAlert ? (
                    <PhoneCall className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : isAlert
                      ? 'bg-rose-50 border-2 border-rose-400 text-rose-950 rounded-tl-none shadow-md shadow-rose-500/10'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] opacity-75">
                    <span className="font-bold">
                      {isUser ? 'You' : isAlert ? 'Emergency Triage Alert' : 'MediTrack AI'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="space-y-1">{formatText(msg.text)}</div>

                  {!isUser && msg.disclaimer && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[10px] text-slate-500 flex items-start gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">MediTrack AI is typing</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold text-rose-600 underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50/70 p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Suggested:
            </span>
            {SUGGESTED_QUERIES.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(query)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-medium border border-slate-200 hover:border-teal-300 rounded-full transition text-[11px] shadow-sm disabled:opacity-50"
              >
                {query}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a health question (e.g. What is blood pressure reading?)..."
              disabled={loading}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition shadow-sm disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-md shadow-teal-600/20 disabled:shadow-none shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] sm:text-[11px] text-center text-slate-400">
            MediTrack AI Assistant is designed for general health literacy and clinic navigation only. Never disregard professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};
