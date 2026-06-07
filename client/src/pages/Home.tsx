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
  return (
    <div className="android-screen w-full text-[var(--c-ink)]">
      <section className="app-page-width w-full py-8 lg:py-10">
        <div className="hero-surface overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.78fr] lg:p-10">
            <div className="animate-page-in">
              <div className="chip inline-flex items-center gap-3 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--c-primary)]" />
                <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--c-ink-soft)]">
                  Blood response coordination
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-[var(--c-ink)] sm:text-5xl lg:text-6xl">
                Find the right blood donor workflow without getting lost.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--c-muted)] sm:text-lg">
                LifeLine gives donors, requesters, and admins a focused place to
                create requests, search matches, and keep urgent cases visible.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register?role=donor" className="auth-button px-7 py-3.5 text-center text-base">
                  Become a Donor
                </Link>
                <Link to="/register?role=requester" className="btn-secondary px-7 py-3.5 text-center text-base">
                  Request Blood
                </Link>
              </div>
            </div>

            <aside className="grid gap-3">
              {quickStats.map((item, index) => (
                <div
                  key={item.label}
                  className="metric-card animate-card-in p-5"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--c-ink-soft)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-[var(--c-ink)]">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--c-muted)]">{item.note}</p>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <section className="app-page-width w-full py-8" id="about">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--c-ink-soft)]">
              Start Here
            </p>
            <h2 className="mt-2 text-3xl font-black text-[var(--c-ink)]">
              Pick the path that matches your job.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--c-muted)]">
            The redesign keeps the three main journeys visible up front so new
            users do not have to guess where to begin.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {entryCards.map((item, index) => (
            <article
              key={item.title}
              className="section-card animate-card-in p-6"
              style={{ animationDelay: `${index * 65}ms` }}
            >
              <h3 className="text-xl font-black text-[var(--c-ink)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--c-muted)]">{item.body}</p>
              <Link to={item.href} className="btn-secondary mt-6 inline-flex px-5 py-2.5 text-sm">
                {item.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="app-page-width w-full py-8">
        <div className="dashboard-section overflow-hidden">
          <div className="dashboard-section-header p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--c-ink-soft)]">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-black text-[var(--c-ink)]">
              A simple path from intake to action.
            </h2>
          </div>
          <div className="grid gap-0 divide-y divide-[var(--c-panel-border)] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {workflow.map((step, index) => (
              <div key={step} className="p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--c-primary-soft)] text-sm font-black text-[var(--c-ink-soft)]">
                  {index + 1}
                </span>
                <p className="mt-4 text-base font-bold leading-7 text-[var(--c-ink)]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="app-page-width w-full py-8">
        <div className="hero-highlight overflow-hidden rounded-xl p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-black">Ready for a cleaner dashboard?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                Create an account or sign in to use the role-specific workspace.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="rounded-lg bg-white px-6 py-3 text-center text-sm font-bold text-[var(--c-ink)]"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-center text-sm font-bold text-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-[var(--c-panel-border)] bg-white/70">
        <div className="app-page-width flex flex-col gap-3 py-8 text-sm text-[var(--c-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-black text-[var(--c-ink)]">LifeLine</p>
          <p>Blood donation coordination for donors, hospitals, and response teams.</p>
        </div>
      </footer>
    </div>
  );
}
