import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";

type Props = { onAuth: (token: string, user: any) => void };

export default function Login({ onAuth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const entryAnimation = location.state?.from === "register" ? "auth-enter-left" : "auth-enter-right";

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
    <section className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:py-10">
      <div className={`auth-shell ${entryAnimation} w-full overflow-hidden rounded-[2rem]`}>
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="hero-highlight hidden p-8 lg:flex lg:min-h-[590px] lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-[var(--c-primary-strong)]">
                  L
                </span>
                <span className="text-sm font-bold">LifeLine Access</span>
              </div>
              <h2 className="mt-10 max-w-md text-4xl font-black leading-tight">
                Sign in to a calmer response workspace.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/72">
                Check availability, track requests, and keep the handoff between
                teams moving without digging through clutter.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.25rem] border border-white/12 bg-white/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white/72">Active requests</p>
                  <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold text-white">
                    Live
                  </span>
                </div>
                <p className="mt-3 text-3xl font-black">180+</p>
                <p className="mt-1 text-xs text-white/60">
                  Prioritized by urgency and location.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] bg-white/88 p-4 text-[var(--c-ink)]">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--c-ink-soft)]">
                    Donors
                  </p>
                  <p className="mt-2 text-2xl font-black">2.5k</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/12 p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/72">
                    Urgent
                  </p>
                  <p className="mt-2 text-2xl font-black">29</p>
                </div>
              </div>
            </div>
          </aside>

          <form onSubmit={submit} className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <Link
                to="/"
                className="mb-8 inline-flex items-center rounded-[1rem] border border-[var(--c-panel-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--c-ink)] transition hover:bg-[var(--c-bg-soft)]"
              >
                Back to Home
              </Link>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--c-ink-soft)]">
                Secure Sign In
              </p>
              <h1 className="mt-3 text-3xl font-black text-[var(--c-ink)] sm:text-4xl">
                Log in to your dashboard
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--c-muted)]">
                Use your account credentials to get back to your donor,
                requester, or admin workflow quickly.
              </p>

              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                    Email address
                  </span>
                  <input
                    className="auth-input"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    maxLength={120}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                    Password
                  </span>
                  <div className="relative">
                    <input
                      className="auth-input pr-12"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-ink-soft)] transition hover:text-[var(--c-ink)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              </div>

              {error && (
                <p className="mt-5 rounded-[1rem] border border-[var(--c-panel-border)] bg-[var(--c-bg-soft)] px-4 py-3 text-sm font-semibold text-[var(--c-ink-soft)]">
                  {error}
                </p>
              )}

              <button className="auth-button mt-6 w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="loading-spinner" />
                    Logging in
                  </span>
                ) : "Login"}
              </button>

              <div className="soft-panel mt-6 rounded-[1.25rem] p-4 text-center">
                <p className="text-sm text-[var(--c-ink)]">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    state={{ from: "login" }}
                    className="font-bold text-[var(--c-ink)] underline decoration-transparent transition hover:decoration-[var(--c-ink)]"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
