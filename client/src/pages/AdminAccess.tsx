import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

type Props = { onAuth: (token: string, user: any) => void };

export default function AdminAccess({ onAuth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await api<{ token: string; user: any }>("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password, accessKey }),
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
      <div className="auth-shell w-full overflow-hidden rounded-[2rem]">
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="hero-highlight hidden p-8 text-white lg:flex lg:min-h-[590px] lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-[var(--c-primary-strong)]">
                  A
                </span>
                <span className="text-sm font-bold">Admin Access</span>
              </div>
              <h2 className="mt-10 max-w-md text-4xl font-black leading-tight">
                Restricted operational access for the admin dashboard.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/72">
                This sign-in path is reserved for the system administrator and
                requires a separate access key.
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-white/12 bg-white/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/72">
                Access Rules
              </p>
              <div className="mt-4 space-y-3 text-sm text-white/78">
                <p>Use the admin account email and password.</p>
                <p>Enter the configured secret admin access key.</p>
                <p>Public registration and standard login do not allow admin entry.</p>
              </div>
            </div>
          </aside>

          <form onSubmit={submit} className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <Link
                to="/login"
                className="mb-8 inline-flex items-center rounded-[1rem] border border-[var(--c-panel-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--c-ink)] transition hover:bg-[var(--c-bg-soft)]"
              >
                Back to Login
              </Link>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--c-ink-soft)]">
                Secret Entry
              </p>
              <h1 className="mt-3 text-3xl font-black text-[var(--c-ink)] sm:text-4xl">
                Admin dashboard access
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--c-muted)]">
                Sign in with the admin account and the private access key to
                open the admin dashboard.
              </p>

              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                    Admin email
                  </span>
                  <input
                    className="auth-input"
                    placeholder="admin@example.com"
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

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                    Secret access key
                  </span>
                  <div className="relative">
                    <input
                      className="auth-input pr-12"
                      placeholder="Enter the admin access key"
                      type={showAccessKey ? "text" : "password"}
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      autoComplete="off"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessKey((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-ink-soft)] transition hover:text-[var(--c-ink)]"
                      aria-label={showAccessKey ? "Hide access key" : "Show access key"}
                    >
                      {showAccessKey ? "Hide" : "Show"}
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
                    Verifying access
                  </span>
                ) : "Open Admin Dashboard"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
