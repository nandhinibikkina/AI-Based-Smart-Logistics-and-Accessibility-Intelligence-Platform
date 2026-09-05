import {
  Bot,
  Send,
  Sparkles,
  User,
  Info,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  getAssistantResponse,
  welcomeMessage,
  quickQuestions,
  type ChatMessage,
} from '@/lib/assistantEngine';

let msgCounter = 0;
const nextId = () => `msg-${++msgCounter}`;

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const sendQuestion = (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;

    const userMsg: ChatMessage = { id: nextId(), role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    window.setTimeout(() => {
      const response = getAssistantResponse(q);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', text: response },
      ]);
      setThinking(false);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <Bot className="h-3.5 w-3.5" />
          AI Assistant
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          NER-LINK AI Assistant
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-slate-600">
          Ask about routes, risks, deliveries and logistics.
        </p>
      </div>

      {/* Chat container */}
      <div className="mt-8 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ height: 'min(70vh, 640px)' }}>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                  m.role === 'assistant'
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {m.role === 'assistant' ? (
                  <Bot className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'assistant'
                    ? 'bg-slate-50 text-slate-800'
                    : 'bg-teal-600 text-white'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-4 py-3.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" />
              </div>
            </div>
          )}
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && !thinking && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Sparkles className="h-3.5 w-3.5" /> Quick questions
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendQuestion(q)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-200 p-3 sm:p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask NER-LINK AI..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
        <p className="text-xs leading-relaxed text-slate-500">
          NER-LINK AI Assistant is a hackathon prototype. Responses are
          generated from local rule-based logic using sample logistics data —
          not a live AI service or external API.
        </p>
      </div>
    </div>
  );
}
