import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Database
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const { business } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Namaste! I am VyaparAI, your dedicated intelligent business consultant. I am connected directly to your store's live database for "${business?.name || 'Your Store'}". 

Ask me anything about today's sales, low-stock items, profit margins, or recommendations in English or Hindi!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDataDrawer, setShowDataDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'What were my total sales today?',
    'Which products are running out of stock?',
    'What is my gross and net profit?',
    'Give me 3 suggestions to increase shop revenue',
    'आज की कुल बिक्री और पेंडिंग उधार बताएं (Hindi)',
    'Which products are my highest volume sellers?'
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for context
      const history = messages.slice(-6).map(m => ({
        role: (m.sender === 'assistant' ? 'model' : 'user') as 'model' | 'user',
        parts: m.text
      }));

      const res = await api.askAI(textToSend, history);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: `Apologies, I encountered an issue accessing the AI service. Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 md:p-5 shadow-lg flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-purple-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black flex items-center gap-2">
              VyaparAI Copilot
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Powered by Gemini 3.8 Flash
              </span>
            </h1>
            <p className="text-xs text-indigo-200">
              Grounded exclusively in <span className="text-white font-semibold">{business?.name}</span>'s live inventory, sales & Khata
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
          Suggested:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs whitespace-nowrap hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isAI = m.sender === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isAI
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {isAI ? <Sparkles className="w-4 h-4 text-yellow-200" /> : <UserIcon className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                    isAI
                      ? 'bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-sm'
                      : 'bg-indigo-600 text-white shadow-md rounded-tr-none'
                  }`}
                >
                  {m.text}
                </div>

                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isAI ? 'justify-start' : 'justify-end'}`}>
                  <span>{m.timestamp}</span>
                  {isAI && (
                    <button
                      onClick={() => copyToClipboard(m.text, m.id)}
                      className="hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 text-yellow-200" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>VyaparAI is querying your live database & formulating advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about sales, low stock, profits, reordering in Hindi or English..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-transparent text-xs md:text-sm text-slate-800 dark:text-white outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`px-4 py-3 rounded-xl font-bold text-xs text-white transition-all flex items-center gap-1.5 ${
              !input.trim() || loading
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md'
            }`}
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
