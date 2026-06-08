import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, Role } from "../api";

type Props = { onAuth: (token: string, user: any) => void };

const bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

type FieldProps = {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
};

export default function Register({ onAuth }: Props) {
  const [role, setRole] = useState<Role>("donor");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bloodType: "O+",
    location: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("role");
    if (requested === "donor" || requested === "requester") setRole(requested);
  }, [location.search]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      };

      if (role === "donor") {
        payload.bloodType = form.bloodType;
        payload.location = form.location;
        payload.availability = true;
      }

      const data = await api<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
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
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
        {/* LEFT — form */}
        <main className="flex items-center justify-center px-5 py-12 sm:px-10 lg:order-1">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ll-muted,#64748b)] hover:text-[var(--ll-ink,#0f172a)]"
            >
              ← Back to home
            </Link>

            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ll-accent,#ef4444)]">
                Create account
              </p>
              <h2
                className="mt-3 text-4xl font-black leading-tight"
                style={{ fontFamily: "Epilogue, sans-serif" }}
              >
                Start your LifeLine profile.
              </h2>
              <p className="mt-2 text-sm text-[var(--ll-muted,#64748b)]">
                Pick a role so we open the dashboard with the right tools from
                minute one.
              </p>
            </div>

            {/* Role toggle */}
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-[var(--ll-line,#e2e8f0)] bg-white p-1.5">
              {(["donor", "requester"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition ${
                    role === r
                      ? "bg-[var(--ll-ink,#0f172a)] text-white shadow-sm"
                      : "text-[var(--ll-muted,#64748b)] hover:bg-white"
                  }`}
                >
                  {r === "donor" ? "I'm a donor" : "I need blood"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Full name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                  maxLength={80}
                  pattern="[A-Za-z][A-Za-z\s'.-]*"
                  className="auth-input"
                  placeholder="Jane Doe"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  maxLength={120}
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </Field>

              <Field
                label="Password"
                hint={
                  <span className="text-[var(--ll-muted,#64748b)]">
                    8+ chars
                  </span>
                }
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    minLength={8}
                    maxLength={72}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
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
                <p className="mt-1.5 text-xs text-[var(--ll-muted,#64748b)]">
                  Upper + lowercase + a number.
                </p>
              </Field>

              {role === "donor" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Blood type">
                    <select
                      value={form.bloodType}
                      onChange={(e) =>
                        setForm({ ...form, bloodType: e.target.value })
                      }
                      className="auth-input"
                    >
                      {bloodTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Location">
                    <input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      required
                      minLength={2}
                      maxLength={120}
                      pattern="[A-Za-z0-9\s,.'-]+"
                      className="auth-input"
                      placeholder="City, area"
                    />
                  </Field>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-[var(--ll-accent,#ef4444)]/30 bg-[var(--ll-accent,#ef4444)]/10 px-4 py-3 text-sm font-medium text-[var(--ll-accent,#ef4444)]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[var(--ll-ink,#0f172a)] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--ll-accent,#ef4444)] disabled:opacity-60"
              >
                {isSubmitting ? "Creating…" : "Create account →"}
              </button>

              <p className="pt-2 text-center text-sm text-[var(--ll-muted,#64748b)]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{ from: "register" }}
                  className="font-bold text-[var(--ll-ink,#0f172a)] underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </main>

        {/* RIGHT — dark setup-path panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--ll-ink,#0f172a)] p-10 text-white lg:order-2 lg:flex xl:p-14">
          <div
            className="pointer-events-none absolute -left-32 -bottom-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
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
              <p className="text-sm font-semibold">Onboarding</p>
            </div>
          </header>

          <div className="relative space-y-8">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              3 steps · ~1 min
            </p>
            <h1
              className="text-5xl font-black leading-[1.05] xl:text-6xl"
              style={{ fontFamily: "Epilogue, sans-serif" }}
            >
              Join the{" "}
              <span className="text-[var(--ll-accent,#ef4444)]">network</span>
              <br />
              that answers first.
            </h1>

            <ol className="space-y-4">
              {[
                [
                  "01",
                  "Choose your role",
                  "Donor or requester — pick the workflow that fits.",
                ],
                [
                  "02",
                  "Add contact details",
                  "Name, email, password. Donors add type + area.",
                ],
                ["03", "Open your dashboard", "Live queue ready in seconds."],
              ].map(([n, title, body]) => (
                <li
                  key={n}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <span
                    className="text-2xl font-black text-[var(--ll-accent,#ef4444)]"
                    style={{ fontFamily: "Epilogue, sans-serif" }}
                  >
                    {n}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-white/60">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                Coverage
              </p>
              <p
                className="mt-1 text-2xl font-black"
                style={{ fontFamily: "Epilogue, sans-serif" }}
              >
                24/7
              </p>
            </div>
            <div className="rounded-xl border border-[var(--ll-accent,#ef4444)]/40 bg-[var(--ll-accent,#ef4444)]/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                Matching
              </p>
              <p
                className="mt-1 text-2xl font-black"
                style={{ fontFamily: "Epilogue, sans-serif" }}
              >
                Live
              </p>
            </div>
          </div>
        </aside>
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
