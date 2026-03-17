'use client';
import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'How do I grow faster on Instagram?',
  'Write me a viral caption for a morning routine post',
  'What hashtags should I use for wellness content?',
  'How do I get brand deals with 80K followers?',
  'Best time to post on TikTok?',
  'How do I increase my engagement rate?',
];

export default function Chatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi Alex! I\'m your AI growth assistant. Ask me anything about growing your creator business — content strategy, brand deals, engagement tips, or caption writing.' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/v1/ai/chat', {
        message: content,
        history: messages.slice(-6), // send last 6 messages for context
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Make sure the backend is running and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 right-5 w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-all z-50 hover:scale-105"
        style={{
          width: 52, height: 52,
          background: open ? '#374151' : '#534AB7',
        }}
        title="AI Assistant"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2C6.03 2 2 5.58 2 10c0 1.85.67 3.56 1.8 4.93L2.5 19.5l4.93-1.27A9.45 9.45 0 0 0 11 19c4.97 0 9-3.58 9-8s-4.03-9-9-9z" fill="white"/>
            <path d="M7 10h8M7 7h5" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}

        {/* Unread dot */}
        {!open && messages.length === 1 && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-20 right-5 bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          style={{ width: 360, height: 520, border: '1px solid #E5E7EB' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
            style={{ background: '#534AB7' }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1C4.69 1 2 3.24 2 6c0 1.23.47 2.36 1.26 3.24L2.5 13l3.55-.92A6.6 6.6 0 0 0 8 12.5c3.31 0 6-2.24 6-5s-2.69-5-6-5z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-medium text-white">AI Growth Assistant</div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                <span className="text-[11px] text-white/70">Powered by Groq · Llama 3.3</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                    style={{ background: '#534AB7' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1C3.79 1 2 2.57 2 4.5c0 .86.35 1.65.93 2.26L2.5 9l2.48-.64A4.6 4.6 0 0 0 6 8.5c2.21 0 4-1.57 4-3.5S8.21 1 6 1z" fill="white"/>
                    </svg>
                  </div>
                )}
                <div
                  className="max-w-[78%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? '#534AB7' : '#F3F4F6',
                    color: msg.role === 'user' ? 'white' : '#374151',
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                  style={{ background: '#534AB7' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1C3.79 1 2 2.57 2 4.5c0 .86.35 1.65.93 2.26L2.5 9l2.48-.64A4.6 4.6 0 0 0 6 8.5c2.21 0 4-1.57 4-3.5S8.21 1 6 1z" fill="white"/>
                  </svg>
                </div>
                <div className="px-3 py-2.5 rounded-2xl bg-gray-100 flex gap-1 items-center" style={{ borderBottomLeftRadius: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                      style={{ animation: `bounce 1s infinite ${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (show only at start) */}
          {messages.length === 1 && (
            <div className="px-3 pb-2">
              <div className="text-[10px] text-gray-400 mb-1.5">Suggested questions</div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTIONS.slice(0, 4).map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="text-[10px] px-2 py-1 rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100">
            <div className="flex gap-2 items-center bg-gray-50 rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about growing your audience…"
                className="flex-1 bg-transparent text-[12px] outline-none text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity"
                style={{ background: '#534AB7', opacity: !input.trim() ? 0.4 : 1 }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 11L11 6 1 1v3.5L8 6l-7 1.5V11z" fill="white"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}