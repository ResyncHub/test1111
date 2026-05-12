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
      if (data.navigate?.route) setTimeout(() => router.push(data.navigate.route), 800);
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
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {messages.length === 1 && (
          <div className="mt-4">
            <p className="text-xs text-center mb-3" style={{ color: "hsl(215 20% 45%)" }}>Możesz też zapytać o:</p>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} className="text-left text-xs rounded-xl px-3 py-2.5 border transition-colors"
                  style={{ background: "hsl(217 33% 10%)", borderColor: "hsl(217 33% 18%)", color: "hsl(215 20% 65%)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0 mt-1" style={{ background: "hsla(262,80%,60%,0.15)" }}>
                <Sparkles size={14} style={{ color: "hsl(262 80% 70%)" }} />
              </div>
            )}
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
              style={m.role === "user" ? { background: "hsl(217 91% 60%)", color: "hsl(222 47% 5%)", borderBottomRightRadius: "4px" }
                : { background: "hsl(222 47% 9%)", color: "hsl(210 40% 90%)", borderBottomLeftRadius: "4px", border: "1px solid hsl(217 33% 15%)" }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0" style={{ background: "hsla(262,80%,60%,0.15)" }}>
              <Sparkles size={14} className="animate-pulse" style={{ color: "hsl(262 80% 70%)" }} />
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(217 33% 15%)", borderBottomLeftRadius: "4px" }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "hsl(215 20% 45%)", animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t pt-3 pb-1" style={{ borderColor: "hsl(217 33% 15%)" }}>
        <div className="flex items-end gap-2">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            rows={1} placeholder="Napisz wiadomość..." disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm resize-none focus:outline-none max-h-32 disabled:opacity-50 border"
            style={{ background: "hsl(217 33% 9%)", borderColor: "hsl(217 33% 18%)", color: "hsl(210 40% 98%)", minHeight: "44px" }} />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform shrink-0"
            style={{ background: "hsl(217 91% 60%)", color: "hsl(222 47% 5%)" }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
