"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Message {
  id: string;
  role: 'user' | 'bhooneeti';
  content: string;
}

export default function BhooNeeti() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const currentQuery = query.trim();
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: currentQuery };
    
    setMessages(prev => [...prev, newUserMsg]);
    setQuery("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bhooneeti/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentQuery })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      const newBhooNeetiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'bhooneeti', 
        content: data.answer 
      };
      
      setMessages(prev => [...prev, newBhooNeetiMsg]);
    } catch (err: any) {
      setError(err.message || 'Unable to reach BhooNeeti\'s AI service right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuery = "What are the major causes of agricultural land conversion around Pune?";

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-6 py-4 flex-shrink-0 border-b border-accent/50 bg-background/95 backdrop-blur z-10">
        <Header 
          breadcrumbs={[{ label: 'BhooNeeti' }]}
          title="BhooNeeti"
          subtitle="AI-assisted research & policy intelligence"
        />
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {messages.length === 0 ? (
          // STATE A: Empty State - Centered Composer
          <div className="flex-1 flex flex-col items-center justify-center p-6 transition-all duration-500 ease-in-out">
            <div className="max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-primary mb-6 text-center">Ask a land-governance question...</h2>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-accent">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="E.g., What are the major causes of land conversion?"
                    className="flex-1 p-3 border border-accent rounded-lg focus:outline-none focus:border-primary text-foreground"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !query.trim()}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Researching...' : 'Ask BhooNeeti'}
                  </button>
                </form>
                {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}
                <div className="mt-4 flex gap-2 items-center flex-wrap justify-center">
                  <span className="text-xs text-text-secondary">Try:</span>
                  <button 
                    onClick={() => setQuery(sampleQuery)}
                    disabled={isLoading}
                    className="text-xs bg-background text-primary px-3 py-1.5 rounded border border-accent hover:border-primary transition-colors text-left disabled:opacity-50"
                  >
                    {sampleQuery}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // STATE B: Chat State
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Scrollable Conversation */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <div className="max-w-4xl mx-auto space-y-8 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    {msg.role === 'user' ? (
                      <div className="max-w-[80%]">
                        <div className="text-xs font-semibold text-text-secondary mb-1 ml-1 uppercase">User</div>
                        <div className="bg-primary text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="text-xs font-semibold text-primary mb-2 ml-1 uppercase tracking-wider">BhooNeeti</div>
                        <div className="bg-white p-6 rounded-xl border border-accent shadow-sm">
                          <div className="whitespace-pre-wrap text-foreground prose prose-sm max-w-none">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-xs font-semibold text-primary mb-2 ml-1 uppercase tracking-wider">BhooNeeti</div>
                    <div className="bg-white p-4 rounded-xl border border-accent shadow-sm text-text-secondary text-sm flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      BhooNeeti is researching...
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center border border-red-100">
                    {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom Composer */}
            <div className="bg-background/95 backdrop-blur border-t border-accent/50 p-4 shrink-0 transition-all duration-500 ease-in-out">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-accent focus-within:border-primary transition-colors">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 p-3 border-none rounded-lg focus:outline-none focus:ring-0 text-foreground bg-transparent"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !query.trim()}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Researching...' : 'Ask'}</span>
                    {!isLoading && <span>➤</span>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
