import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type Props = { onAuth: (token: string, user: any) => void };

export default function AdminLogin({ onAuth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await api<{ token: string; user: any }>("/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      onAuth(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0f172a] flex items-center justify-center px-5"
      style={{ fontFamily: "Urbanist, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-[#ef4444] mx-auto grid place-items-center font-black text-white text-2xl mb-4">
            L
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Admin Access</h1>
          <p className="text-slate-400 text-sm">Secure administrative login</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {isSubmitting ? "Authenticating…" : "Admin Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}