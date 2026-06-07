import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { SessionUser } from "../api";
import LiveNotifications from "./LiveNotifications";

type Props = {
  user: SessionUser | null;
  onLogout: () => void;
};

export default function Layout({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "LL";
  const token = localStorage.getItem("token");
  const roleLabel = user?.role ? `${user.role} workspace` : "Workspace";
  const dashboardTarget =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "donor"
        ? "/donor/dashboard"
        : user?.role === "requester"
          ? "/requester/dashboard"
          : "/dashboard";

  return (
    <div className="android-screen min-h-screen text-[var(--c-ink)]">
      <nav className="site-nav sticky top-0 z-50">
        <div className="app-shell-width flex w-full flex-wrap items-center justify-between gap-3 py-3">
          <Link to={dashboardTarget} className="flex items-center gap-3">
            <span className="android-brand-mark grid h-12 w-12 place-items-center rounded-[1.1rem] text-lg font-black text-white">
              L
            </span>
            <span>
              <span className="block text-base font-extrabold leading-tight text-[var(--c-ink)]">
                LifeLine
              </span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--c-ink-soft)]">
                {roleLabel}
              </span>
            </span>
          </Link>

          <div className="order-3 flex w-full flex-wrap items-center gap-2 lg:order-2 lg:w-auto">
            <NavLink
              to={dashboardTarget}
              className={({ isActive }) =>
                `nav-link px-4 py-2 text-sm ${isActive ? "nav-link-active" : ""}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link px-4 py-2 text-sm ${isActive ? "nav-link-active" : ""}`
              }
            >
              Home
            </NavLink>
            {user?.role === "admin" && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `nav-link px-4 py-2 text-sm ${isActive ? "nav-link-active" : ""}`
                }
              >
                Queue
              </NavLink>
            )}
          </div>

          <div className="order-2 flex flex-wrap items-center gap-2 sm:gap-3 lg:order-3">
            {user && token && <LiveNotifications token={token} />}

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((next) => !next)}
                  className="soft-panel flex min-w-0 items-center gap-2 rounded-[1.15rem] py-1.5 pl-1.5 pr-3 transition hover:bg-white"
                  aria-label="Profile menu"
                >
                  <span className="android-brand-mark grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block max-w-[180px] truncate text-left text-xs font-semibold text-[var(--c-ink)]">
                      {user.email}
                    </span>
                    <span className="block text-left text-[11px] font-bold capitalize tracking-[0.12em] text-[var(--c-ink-soft)]">
                      {user.role}
                    </span>
                  </span>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[var(--c-ink)]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="animate-dropdown absolute right-0 mt-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-[var(--c-panel-border)] bg-[rgba(255,255,255,0.98)] shadow-[var(--shadow-lg)] backdrop-blur">
                    <div className="border-b border-[var(--c-panel-border)] p-4">
                      <p className="truncate text-sm font-black text-[var(--c-ink)]">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs font-bold capitalize tracking-[0.12em] text-[var(--c-ink-soft)]">
                        {user.role} account
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={dashboardTarget}
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-[1rem] px-3 py-2.5 text-sm font-semibold text-[var(--c-ink)] hover:bg-[var(--c-bg-soft)]"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-[1rem] px-3 py-2.5 text-sm font-semibold text-[var(--c-ink)] hover:bg-[var(--c-bg-soft)]"
                      >
                        Home
                      </Link>
                      <button
                        className="mt-1 block w-full rounded-[1rem] px-3 py-2.5 text-left text-sm font-bold text-[var(--c-ink-soft)] hover:bg-[var(--c-bg-soft)]"
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                          navigate("/login");
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="auth-button px-4 py-2.5 text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="app-page-width w-full py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
