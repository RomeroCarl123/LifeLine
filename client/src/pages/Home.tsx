import { Link } from "react-router-dom";

const quickStats = [
  { label: "Active donors", value: "2,500+", note: "ready to match nearby" },
  { label: "Open requests", value: "180+", note: "prioritized by urgency" },
  { label: "Live updates", value: "24/7", note: "for donors and requesters" },
];

const entryCards = [
  {
    title: "I want to donate",
    body: "Create a donor profile, set your blood type and location, then respond when a matching request appears.",
    href: "/register?role=donor",
    action: "Join as donor",
  },
  {
    title: "I need blood",
    body: "Post a request with the hospital, urgency, units, and contact details so donors can act quickly.",
    href: "/register?role=requester",
    action: "Create request account",
  },
  {
    title: "I already have access",
    body: "Return to your dashboard to manage matches, requests, notifications, and operational status.",
    href: "/login",
    action: "Sign in",
  },
];

const workflow = [
  "Choose the role that matches your task.",
  "Fill only the details needed for matching.",
  "Use the dashboard queue to respond or track progress.",
];

export default function Home() {
  const quickStats = [
    { label: "Active donors", value: "2,500+", note: "ready to match nearby" },
    { label: "Open requests", value: "180+", note: "prioritized by urgency" },
    {
      label: "Avg response",
      value: "< 12m",
      note: "from request to first match",
    },
  ];

  const entryCards = [
    {
      eyebrow: "01 — Donor",
      title: "I want to donate",
      body: "Create a donor profile, set your blood type and location, then respond when a matching request appears nearby.",
      href: "/register?role=donor",
      action: "Join as donor →",
    },
    {
      eyebrow: "02 — Requester",
      title: "I need blood",
      body: "Post a request with hospital, urgency, units, and contact details so donors can act in minutes, not hours.",
      href: "/register?role=requester",
      action: "Create request →",
    },
    {
      eyebrow: "03 — Returning",
      title: "I already have access",
      body: "Jump back into your dashboard to manage matches, requests, notifications, and operational status.",
      href: "/login",
      action: "Sign in →",
    },
  ];

  const workflow = [
    {
      step: "Choose your role",
      detail:
        "Donor, requester, or coordinator — each gets a focused workspace.",
    },
    {
      step: "Share only what matches",
      detail: "Blood type, location, urgency. Nothing more than necessary.",
    },
    {
      step: "Act from one queue",
      detail: "Respond, track, and close requests from a single dashboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--ll-bg)] text-[var(--ll-ink)] font-body">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-[var(--ll-line)] bg-[var(--ll-bg)]/80 backdrop-blur ll-animate-in">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--ll-accent)] text-white font-display font-bold">
              L
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              LifeLine
            </span>
          </div>
          <nav className="hidden gap-8 text-sm text-[var(--ll-muted)] md:flex justify-center">
            <a href="#how" className="hover:text-[var(--ll-ink)]">
              How it works
            </a>
            <a href="#start" className="hover:text-[var(--ll-ink)]">
              Get started
            </a>
            <a href="#about" className="hover:text-[var(--ll-ink)]">
              About
            </a>
          </nav>
          <Link
            to="/login"
            className="text-sm font-semibold text-[var(--ll-ink)] hover:text-[var(--ll-accent)]"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* HERO — SPLIT */}
      <section className="border-b border-[var(--ll-line)] ll-animate-in">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          {/* LEFT */}
          <div className="flex flex-col justify-center px-6 py-16 lg:py-24 lg:pr-16">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--ll-line)] bg-white px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ll-accent)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ll-accent)]" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ll-muted)]">
                Live · 24 active requests
              </span>
            </div>

            <h1 className="mt-8 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-[var(--ll-ink)] sm:text-6xl lg:text-7xl">
              Blood, matched.
              <span className="block text-[var(--ll-accent)]">In minutes.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--ll-muted)] lg:text-lg">
              LifeLine connects donors, hospitals, and response teams in one
              focused workspace. No noise. No guesswork. Just the next action.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register?role=donor"
                className="rounded-lg bg-[var(--ll-ink)] px-7 py-4 text-center text-sm font-semibold text-white transition hover:bg-[var(--ll-accent)]"
              >
                Become a donor
              </Link>
              <Link
                to="/register?role=requester"
                className="rounded-lg border border-[var(--ll-line)] bg-white px-7 py-4 text-center text-sm font-semibold text-[var(--ll-ink)] transition hover:border-[var(--ll-ink)]"
              >
                Request blood
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6 text-xs text-[var(--ll-muted)]">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-[var(--ll-bg)] bg-gradient-to-br from-slate-300 to-slate-500"
                  />
                ))}
              </div>
              <span>Trusted by 2,500+ donors across 40+ cities</span>
            </div>
          </div>

          {/* RIGHT — STATS PANEL */}
          <div className="relative border-t border-[var(--ll-line)] bg-[var(--ll-ink)] px-6 py-16 lg:border-l lg:border-t-0 lg:py-24 lg:pl-16">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                Network status · today
              </p>

              <div className="mt-8 space-y-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[1fr_auto] items-end gap-6 bg-[var(--ll-ink)] p-6"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm text-white/70">{item.note}</p>
                    </div>
                    <p className="font-display text-5xl font-extrabold tracking-tight text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div>
                  <p className="font-display text-sm font-bold text-white">
                    O− needed
                  </p>
                  <p className="text-xs text-white/60">
                    St. Mary's · 2 units · critical
                  </p>
                </div>
                <span className="rounded-md bg-[var(--ll-accent)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  Urgent
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTRY CARDS */}
      <section
        id="start"
        className="border-b border-[var(--ll-line)] ll-animate-in"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ll-muted)]">
                Start here
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight">
                Pick your path.
              </h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-[var(--ll-muted)] lg:justify-self-end">
              Three journeys, surfaced up front — so first-time users never have
              to guess where to begin.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--ll-line)] bg-[var(--ll-line)] lg:grid-cols-3">
            {entryCards.map((item) => (
              <article
                key={item.title}
                className="group flex flex-col bg-white p-8 transition hover:bg-[var(--ll-surface)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ll-accent)]">
                  {item.eyebrow}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[var(--ll-muted)]">
                  {item.body}
                </p>
                <Link
                  to={item.href}
                  className="mt-8 inline-flex w-fit text-sm font-semibold text-[var(--ll-ink)] transition group-hover:text-[var(--ll-accent)]"
                >
                  {item.action}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="border-b border-[var(--ll-line)] bg-[var(--ll-surface)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ll-muted)]">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight">
            From intake to action, in three steps.
          </h2>

          <div className="mt-12 grid gap-10 lg:grid-cols-3 justify-items-center">
            {workflow.map((item, i) => (
              <div
                key={item.step}
                className="border-t-2 border-[var(--ll-ink)] pt-6 text-center w-full max-w-[28rem]"
              >
                <p className="font-display text-6xl font-extrabold tracking-tight text-[var(--ll-ink)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-6 font-display text-xl font-bold">
                  {item.step}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ll-muted)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-[var(--ll-line)] bg-[var(--ll-ink)] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Every minute counts.
              <span className="block text-[var(--ll-accent)]">
                Be ready before the call.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
              Create your account in under a minute. We'll only notify you for
              matching requests near you.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              to="/register"
              className="rounded-lg bg-[var(--ll-accent)] px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-[var(--ll-ink)]"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-white/20 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 text-sm text-[var(--ll-muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded bg-[var(--ll-accent)] text-white font-display text-[10px] font-bold">
              L
            </span>
            <span className="font-display font-bold text-[var(--ll-ink)]">
              LifeLine
            </span>
          </div>
          <p>
            Blood donation coordination for donors, hospitals, and response
            teams.
          </p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
