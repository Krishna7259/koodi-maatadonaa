import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, User, Trash2 } from 'lucide-react';
import { AIMessage } from '../../types';
import { format } from 'date-fns';

const PROMPT_SUGGESTIONS = [
  '👋 Say hello and explain how Koodi Maatadona works',
  '💻 How does WebRTC peer-to-peer calling work with Firestore?',
  '📝 Help me write a polite professional message to a client',
  'Kannada translation: Translate "Let us meet tomorrow morning" to Kannada',
];

export const AIAssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    const saved = localStorage.getItem('koodi_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'welcome_ai',
        role: 'model',
        text: '👋 **Namaskara! Welcome to the Koodi Maatadona AI Assistant.**\n\nI am your intelligent assistant powered by Google Gemini. You can ask me anything—writing drafts, explaining concepts, translations, or coding help!\n\nWhat can I help you with today?',
        timestamp: new Date().toISOString(),
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('koodi_ai_chat_history', JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend || loading) return;

    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: promptToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const aiMsg: AIMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: data.text || 'I received your query.',
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('[AI chat error]', err);
      const errorMsg: AIMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: '⚠️ I encountered an error communicating with the server. Please check that the server is running on port 5000.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear AI Assistant conversation history?')) {
      const fresh: AIMessage[] = [{
        id: 'fresh_welcome',
        role: 'model',
        text: '👋 New conversation started. How can I help you?',
        timestamp: new Date().toISOString(),
      }];
      setMessages(fresh);
      localStorage.removeItem('koodi_ai_chat_history');
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#F7F8F6] dark:bg-[#111B21] select-none">
      
      {/* Top Header */}
      <div className="h-15 px-6 bg-white dark:bg-[#202C33] border-b border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Koodi AI Assistant
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-[#075E54] dark:text-emerald-300 py-0.5 px-2 rounded-full">
                Gemini 1.5
              </span>
            </h2>
            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Secure server-side integration • No exposed keys
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="Clear AI Conversation"
          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                isUser ? 'bg-[#128C7E] text-white' : 'bg-gradient-to-tr from-[#075E54] to-[#128C7E] text-white'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl shadow-xs text-sm leading-relaxed ${
                isUser
                  ? 'bg-[#D9FDD3] dark:bg-[#005C4B] text-gray-900 dark:text-white rounded-tr-none'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-tl-none'
                  : 'bg-white dark:bg-[#202C33] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap select-text">{msg.text}</div>
                <div className="mt-1.5 text-[10px] text-right text-gray-400">
                  {format(new Date(msg.timestamp), 'h:mm a')}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Loading Pulse */}
        {loading && (
          <div className="flex gap-3 max-w-md mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#075E54] to-[#128C7E] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-white dark:bg-[#202C33] rounded-2xl border border-gray-100 dark:border-gray-800 text-xs font-semibold text-[#128C7E] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Koodi AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 3 && !loading && (
        <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {PROMPT_SUGGESTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-xs bg-white dark:bg-[#202C33] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-200 dark:border-gray-700 rounded-full px-3.5 py-1.5 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap transition-colors shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-white dark:bg-[#202C33] border-t border-[#E9EDEF] dark:border-[#222E35] flex items-center gap-3">
        <input
          type="text"
          placeholder="Ask Koodi AI Assistant anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          className="flex-1 py-2.5 px-4 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#128C7E] text-gray-800 dark:text-gray-100"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-[#128C7E] hover:bg-[#075E54] active:scale-95 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-md transition-all"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>

    </div>
  );
};

