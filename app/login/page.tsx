"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "hsl(222 47% 5%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "hsl(217 91% 60%)" }}
          >
            <span className="text-2xl font-bold" style={{ color: "hsl(222 47% 5%)" }}>MS</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "hsl(210 40% 98%)" }}>Mózg Serwisowy</h1>
          <p className="text-sm mt-1" style={{ color: "hsl(215 20% 55%)" }}>Panel zarządzania serwisem okienno-drzwiowym</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border p-6 space-y-4"
          style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}
        >
          <div>
            <label
              className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: "hsl(215 20% 55%)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none transition-all placeholder:opacity-40"
              style={{
                background: "hsl(217 33% 9%)",
                borderColor: "hsl(217 33% 18%)",
                color: "hsl(210 40% 98%)",
              }}
              placeholder="twoj@email.pl"
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: "hsl(215 20% 55%)" }}
            >
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none transition-all placeholder:opacity-40"
              style={{
                background: "hsl(217 33% 9%)",
                borderColor: "hsl(217 33% 18%)",
                color: "hsl(210 40% 98%)",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              className="text-sm px-3 py-2 rounded-lg border"
              style={{
                color: "hsl(0 72% 61%)",
                background: "hsla(0,72%,51%,0.1)",
                borderColor: "hsla(0,72%,51%,0.2)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity active:scale-95 transition-transform"
            style={{
              background: "hsl(217 91% 60%)",
              color: "hsl(222 47% 5%)",
            }}
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>
      </div>
    </div>
  );
}
