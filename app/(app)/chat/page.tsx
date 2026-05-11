"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "Jakie mam zlecenia na ten tydzień?",
  "Pokaż mi finansowe podsumowanie tego miesiąca",
  "Dodaj klienta Jan Kowalski, tel 500-100-200",
  "Ile mam otwartych zleceń?",
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Cześć! Jestem Twoim asystentem serwisowym. Mogę dodawać zlecenia, klientów, sprawdzać finanse i wiele więcej. W czym mogę pomóc?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: msg }] }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, { role: "assistant", content: data.message ?? "Przepraszam, wystąpił błąd. Spróbuj ponownie." }]);

      if (data.navigate?.route) {
        setTimeout(() => router.push(data.navigate.route), 800);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Przepraszam, wystąpił błąd. Spróbuj ponownie." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {messages.length === 1 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 text-center mb-3">Możesz też zapytać o:</p>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors active:bg-gray-100">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center mr-2 shrink-0 mt-1">
                <Sparkles size={14} className="text-violet-600" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-primary text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center mr-2 shrink-0">
              <Sparkles size={14} className="text-violet-600 animate-pulse" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 pt-3 pb-1">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Napisz wiadomość..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary max-h-32 disabled:opacity-50"
            style={{ minHeight: "44px" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
