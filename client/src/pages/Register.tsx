import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, Role } from "../api";

type Props = { onAuth: (token: string, user: any) => void };
const bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export default function Register({ onAuth }: Props) {
  const [role, setRole] = useState<Role>("donor");
  const [form, setForm] = useState({ name: "", email: "", password: "", bloodType: "O+", location: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const entryAnimation = location.state?.from === "login" ? "auth-enter-right" : "auth-enter-left";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedRole = params.get("role");
    if (requestedRole === "donor" || requestedRole === "requester") {
      setRole(requestedRole);
    }
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
    <section className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:py-10">
      <div className={`auth-shell ${entryAnimation} w-full overflow-hidden rounded-[2rem]`}>
        <div className="grid lg:grid-cols-[1.04fr_0.96fr]">
          <aside className="hero-highlight hidden p-8 lg:flex lg:min-h-[640px] lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-[var(--c-primary-strong)]">
                  L
                </span>
                <span className="text-sm font-bold">LifeLine Onboarding</span>
              </div>
              <h2 className="mt-10 max-w-md text-4xl font-black leading-tight">
                Create a profile in a cleaner, role-based system.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/72">
                Join as a donor or requester and start from a dashboard that
                matches the work you need to do.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.25rem] border border-white/12 bg-white/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/72">
                  Setup Path
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-[var(--c-primary-strong)]">
                      1
                    </span>
                    <span className="text-sm font-semibold">Choose your role</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/88 text-sm font-black text-[var(--c-ink)]">
                      2
                    </span>
                    <span className="text-sm font-semibold">Add contact details</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/12 text-sm font-black text-white">
                      3
                    </span>
                    <span className="text-sm font-semibold">Open your dashboard</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] bg-white/88 p-4 text-[var(--c-ink)]">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--c-ink-soft)]">
                    Coverage
                  </p>
                  <p className="mt-2 text-2xl font-black">24/7</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/12 p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                    Matching
                  </p>
                  <p className="mt-2 text-2xl font-black">Live</p>
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
                Create Account
              </p>
              <h1 className="mt-3 text-3xl font-black text-[var(--c-ink)] sm:text-4xl">
                Start your LifeLine profile
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--c-muted)]">
                Tell us who you are joining as so the dashboard opens with the
                right tools.
              </p>

              <div className="soft-panel mt-7 grid grid-cols-2 gap-2 rounded-[1.25rem] p-1.5">
                {(["donor", "requester"] as Role[]).map((nextRole) => (
                  <button
                    key={nextRole}
                    type="button"
                    onClick={() => setRole(nextRole)}
                    className={`rounded-[1rem] px-3 py-2.5 text-xs font-bold capitalize transition sm:text-sm ${
                      role === nextRole
                        ? "bg-[var(--c-primary)] text-white shadow-sm"
                        : "text-[var(--c-ink)] hover:bg-white"
                    }`}
                  >
                    {nextRole}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                    Full name
                  </span>
                  <input className="auth-input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={80} pattern="[A-Za-z][A-Za-z\\s'.-]*" title="Use letters, spaces, apostrophes, periods, and hyphens only." />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                    Email address
                  </span>
                  <input className="auth-input" placeholder="you@example.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required maxLength={120} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                    Password
                  </span>
                  <div className="relative">
                    <input className="auth-input pr-12" placeholder="Create a password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required minLength={8} maxLength={72} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}" title="Use at least 8 characters with uppercase, lowercase, and a number." />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-ink-soft)] transition hover:text-[var(--c-ink)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[var(--c-muted)]">
                    At least 8 characters with uppercase, lowercase, and a number.
                  </p>
                </label>
                {role === "donor" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                        Blood type
                      </span>
                      <select className="auth-input" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} required>
                        {bloodTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-[var(--c-ink)]">
                        Location
                      </span>
                      <input className="auth-input" placeholder="City or area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required minLength={2} maxLength={120} pattern="[A-Za-z0-9\\s,.'-]+" title="Use a real city/area name. Letters, numbers, spaces, commas, periods, apostrophes, and hyphens only." />
                    </label>
                  </div>
                )}
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
                    Creating account
                  </span>
                ) : "Create Account"}
              </button>
              <div className="soft-panel mt-6 rounded-[1.25rem] p-4 text-center">
                <p className="text-sm text-[var(--c-ink)]">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    state={{ from: "register" }}
                    className="font-bold text-[var(--c-ink)] underline decoration-transparent transition hover:decoration-[var(--c-ink)]"
                  >
                    Login
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
