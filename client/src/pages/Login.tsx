import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";

type Props = { onAuth: (token: string, user: any) => void };

type FieldProps = {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
};

type StatProps = {
  label: string;
  value: string;
  accent?: boolean;
};

export default function Login({ onAuth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const fromRegister = location.state?.from === "register";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await api<{ token: string; user: any }>("/auth/login", {
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
      className="min-h-screen bg-[var(--ll-bg,#f8fafc)] text-[var(--ll-ink,#0f172a)] ll-animate-in"
      style={{ fontFamily: "Urbanist, system-ui, sans-serif" }}
    >
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — dark operational panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--ll-ink,#0f172a)] p-10 text-white lg:flex xl:p-14">
          <div
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, var(--ll-accent,#ef4444), transparent)",
            }}
          />
          <header className="relative flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--ll-accent,#ef4444)] font-black">
              L
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                LifeLine
              </p>
              <p className="text-sm font-semibold">Response Workspace</p>
            </div>
          </header>

          <div className="relative space-y-8">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Sign in
            </p>
            <h1
              className="text-5xl font-black leading-[1.05] xl:text-6xl"
              style={{ fontFamily: "Epilogue, sans-serif" }}
            >
              Calm under{" "}
              <span className="text-[var(--ll-accent,#ef4444)]">pressure.</span>
              <br />
              Built for speed.
            </h1>
            <p className="max-w-md text-base text-white/60">
              Pick up where you left off — check availability, track requests,
              and keep the handoff between teams moving without digging through
              clutter.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Stat label="Active requests" value="180+" accent />
              <Stat label="Donors ready" value="2.5k" />
              <Stat label="Urgent now" value="29" />
              <Stat label="Coverage" value="24/7" />
            </div>
          </div>

          <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ll-accent,#ef4444)] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--ll-accent,#ef4444)]" />
            </span>
            <p className="text-sm text-white/80">
              Live: <span className="font-semibold text-white">O−</span>{" "}
              requested at St. Mary's
            </p>
          </div>
        </aside>

        {/* RIGHT — form */}
        <main className="flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ll-muted,#64748b)] hover:text-[var(--ll-ink,#0f172a)]"
            >
              ← Back to home
            </Link>

            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ll-accent,#ef4444)]">
                Secure sign in
              </p>
              <h2
                className="mt-3 text-4xl font-black leading-tight"
                style={{ fontFamily: "Epilogue, sans-serif" }}
              >
                Welcome back.
              </h2>
              <p className="mt-2 text-sm text-[var(--ll-muted,#64748b)]">
                Use your credentials to return to your donor, requester, or
                admin workflow.
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <Field label="Email address">
                <input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  maxLength={120}
                  className="auth-input"
                />
              </Field>

              <Field
                label="Password"
                hint={
                  <Link
                    to="/forgot"
                    className="text-[var(--ll-accent,#ef4444)] hover:underline"
                  >
                    Forgot?
                  </Link>
                }
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="auth-input pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-[var(--ll-muted,#64748b)] hover:text-[var(--ll-ink,#0f172a)]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="rounded-xl border border-[var(--ll-accent,#ef4444)]/30 bg-[var(--ll-accent,#ef4444)]/10 px-4 py-3 text-sm font-medium text-[var(--ll-accent,#ef4444)]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-xl bg-[var(--ll-ink,#0f172a)] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--ll-accent,#ef4444)] disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Sign in →"}
              </button>

              <p className="pt-2 text-center text-sm text-[var(--ll-muted,#64748b)]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  state={{ from: "login" }}
                  className="font-bold text-[var(--ll-ink,#0f172a)] underline-offset-4 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>

      <style>{`
        .auth-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--ll-line, #e2e8f0);
          background: #fff;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          color: var(--ll-ink, #0f172a);
          transition: border-color .15s, box-shadow .15s;
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--ll-ink, #0f172a);
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.08);
        }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ll-muted,#64748b)]">
          {label}
        </span>
        {hint && <span className="text-xs font-semibold">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Stat({ label, value, accent }: StatProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-[var(--ll-accent,#ef4444)]/40 bg-[var(--ll-accent,#ef4444)]/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-black text-white"
        style={{ fontFamily: "Epilogue, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}
