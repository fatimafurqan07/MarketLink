import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  RotateCcw,
  ShieldCheck,
  Languages,
  Store,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { User } from '../types.ts';

interface AgroCopilotViewProps {
  currentUser?: User | null;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: 'Roman Urdu: Tamatar ka rate?', text: 'Bhai tamatar ka kya rate hai?' },
  { label: 'Roman Urdu: Aaj taaza kya hai?', text: 'Aaj taaza kya hai aur kis stall par milega?' },
  { label: "English: Today's fresh harvest", text: 'What fresh harvest batches are available today?' },
  { label: 'Stall pickup & cash rules', text: 'How does pickup work and can I pay cash at the stall?' },
];

export const AgroCopilotView: React.FC<AgroCopilotViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello ${currentUser?.name || 'Visitor'}! I am your MarketLink AI Assistant powered by Google Gemini Pro.\n\nAap mujhse English, Urdu ya Roman Urdu mein baat kar sakte hain (e.g., "bhai tamatar ka kya rate hai?"). I have live knowledge of current produce, prices, and stall locations!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.askConcierge(text.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an issue connecting to the harvest knowledge base. Please check back shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: "Chat history cleared. How may I assist you with today's fresh harvest or market stall information?",
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8e5] shadow-xs flex flex-col h-[calc(100vh-140px)] min-h-[500px] overflow-hidden">
      {/* Top Copilot Header */}
      <div className="p-4 px-6 bg-[#064e3b] border-b border-[#064e3b]/20 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-emerald-200 flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-normal text-base text-white">MarketLink Agro-Copilot</h3>
              <span className="bg-white/10 text-emerald-200 text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-white/20">
                Gemini Pro Grounded
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 font-normal">
              English, Urdu & Roman Urdu • Real-Time Produce & Market Schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-all cursor-pointer text-xs flex items-center gap-1.5 border border-white/10"
            title="Reset Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Suggestion Chips Banner */}
      <div className="p-3 bg-[#f8f7f2] border-b border-[#e2e8e5] flex items-center gap-2 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider shrink-0 pl-2">
          <Languages className="w-3.5 h-3.5 text-[#064e3b]" />
          <span>Ask in:</span>
        </div>
        <div className="flex items-center gap-2">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={`quick-prompt-${prompt.label}-${i}`}
              onClick={() => handleSendMessage(prompt.text)}
              disabled={isLoading}
              className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white hover:bg-[#ecfdf5] text-[#10231d] hover:text-[#064e3b] border border-[#e2e8e5] hover:border-emerald-300 text-xs font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f7f2]">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${
                isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  isAi
                    ? 'bg-white border-[#e2e8e5] text-[#064e3b] shadow-xs'
                    : 'bg-[#064e3b] border-[#064e3b] text-white shadow-xs'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isAi
                    ? 'bg-white border border-[#e2e8e5] text-[#10231d] rounded-tl-xs'
                    : 'bg-[#064e3b] text-white border border-[#064e3b] rounded-tr-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`mt-1.5 text-[10px] text-right font-medium ${
                    isAi ? 'text-[#64748b]' : 'text-emerald-200/80'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 mr-auto max-w-md">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#e2e8e5] text-[#064e3b] flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e2e8e5] text-[#64748b] rounded-tl-xs text-xs flex items-center gap-2 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#064e3b] animate-spin" />
              <span>Analyzing live harvest inventory & stall schedules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-[#e2e8e5] bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about crops, prices, stall hours in English or Roman Urdu (e.g. tamatar ka rate kya hai?)..."
            className="flex-1 px-4 py-3 border border-[#e2e8e5] rounded-xl bg-[#f8f7f2] text-xs sm:text-sm text-[#10231d] font-normal focus:outline-hidden focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#064e3b] focus:bg-white transition-all placeholder:text-[#64748b]/70"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-3 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-xl font-medium text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#64748b] px-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#064e3b]" />
            Strictly $0 charged online • Inspect produce at stall • Cash / Tap on pickup
          </span>
          <span className="hidden sm:inline font-medium">Multilingual NLP</span>
        </div>
      </div>
    </div>
  );
};
