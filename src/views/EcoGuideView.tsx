import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EcoChatMessage } from '../types';
import {
  Sparkles,
  Send,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  Leaf,
  Droplets,
  Zap,
  Trash2,
  CheckCircle2,
  Building,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  {
    category: 'Hostel Segregation',
    icon: Trash2,
    query: 'How should we segregate food scraps vs dry plastics in Sahyadri & Kaveri hostels?',
  },
  {
    category: 'Water Conservation',
    icon: Droplets,
    query: 'What are the top water-saving practices for lab wash basins and hostel bathrooms in Kolhapur?',
  },
  {
    category: 'E-Waste Drop-off',
    icon: Zap,
    query: 'Where can I safely recycle dead laptop batteries, swollen power banks, or old USB cables on campus?',
  },
  {
    category: 'Solar Energy (CREAM)',
    icon: Leaf,
    query: 'How does SGU’s CREAM Solar Lab contribute to campus renewable energy generation?',
  },
];

export const EcoGuideView: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<EcoChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste ${user ? user.name.split(' ')[0] : 'there'}! I am **EcoGuide**, your sustainability companion at **Sanjay Ghodawat University (SGU), Kolhapur**.\n\nWhether you need practical tips on waste sorting in your hostel, water-saving habits during the dry season, lab energy conservation, or details on SGU's green initiatives—ask me anything!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMessage: EcoChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Send conversation history to server-side Gemini endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userRole: user?.role || 'student',
          userDepartment: user?.department || 'Sanjay Ghodawat University',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: EcoChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to get answer from EcoGuide:', err);
      setErrorMessage(err?.message || 'Unable to contact EcoGuide assistant right now. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat cleared! How can I assist you with sustainability at Sanjay Ghodawat University today?`,
        timestamp: 'Just now',
      },
    ]);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-1">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-card-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-mint text-on-pastel-mint text-xs font-semibold mb-2 border border-emerald-200/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Gemini AI · SGU Campus Intelligence</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
            EcoGuide AI Assistant
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Get instant, practical guidance on waste segregation, energy saving, water conservation, and green living tailored for Sanjay Ghodawat University students and faculty.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetChat}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface border border-card-border transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5 text-secondary" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
        {/* Left Column: Quick Suggested Prompts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-card-border shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h3 className="font-headline text-sm font-semibold text-primary">Suggested Questions</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Tap any topic to ask EcoGuide for immediate campus-specific advice:
            </p>

            <div className="space-y-2.5">
              {SUGGESTED_QUESTIONS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.query)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs text-on-surface border border-card-border transition-all flex flex-col gap-1.5 cursor-pointer disabled:opacity-50 group hover:border-primary/40"
                  >
                    <div className="flex items-center gap-2 font-medium text-primary">
                      <IconComponent className="w-3.5 h-3.5 text-secondary group-hover:text-primary transition-colors" />
                      <span>{item.category}</span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant line-clamp-2">
                      "{item.query}"
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SGU Eco-Tip Widget */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-card-border text-xs">
            <div className="flex items-center gap-2 font-semibold text-primary mb-2">
              <Building className="w-4 h-4 text-primary" />
              <span>SGU Campus Tip</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Did you know? The **CREAM Lab** at SGU conducts ongoing renewable energy research. Always switch off computer workstations in technology labs when leaving to lower auxiliary loads.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-3 flex flex-col h-[650px] bg-surface-container-lowest rounded-2xl border border-card-border shadow-xs overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                    msg.role === 'user'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-pastel-mint text-primary border-emerald-300/50'
                  }`}
                >
                  {msg.role === 'user' ? 'U' : <Sparkles className="w-4 h-4 text-primary" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-xs'
                      : 'bg-surface-container-low text-on-surface border border-card-border rounded-tl-xs whitespace-pre-line'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div
                    className={`text-[10px] mt-1.5 flex justify-end ${
                      msg.role === 'user' ? 'text-emerald-100' : 'text-on-surface-variant'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="w-8 h-8 rounded-xl bg-pastel-mint text-primary border border-emerald-300/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="bg-surface-container-low rounded-2xl px-4 py-3 text-xs text-on-surface-variant border border-card-border flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-2 font-medium">EcoGuide is formulating practical SGU recommendations...</span>
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-pastel-rose/80 border border-rose-300/60 text-xs text-on-pastel-rose flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900">Communication Error</p>
                  <p className="mt-0.5">{errorMessage}</p>
                  <button
                    onClick={() => handleSendMessage()}
                    className="mt-2 text-[11px] font-semibold text-rose-800 underline hover:no-underline cursor-pointer"
                  >
                    Click here to retry
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface-container-low border-t border-card-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask EcoGuide about campus recycling, energy, water, or hostel habits..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-10 text-sm rounded-xl border border-card-border bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="inline-flex items-center justify-center p-3 sm:px-5 sm:py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Send message"
              >
                <span className="hidden sm:inline mr-1.5">Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[11px] text-on-surface-variant mt-2 text-center">
              EcoGuide provides educational recommendations based on SGU campus sustainability practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
