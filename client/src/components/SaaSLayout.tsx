import { useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { SessionUser, Role } from "../api";
import LiveNotifications from "./LiveNotifications";

type Props = {
  user: SessionUser | null;
  onLogout: () => void;
};

const roleToPrimary: Record<Role, string> = {
  donor: "/donor/dashboard",
  requester: "/requester/dashboard",
  admin: "/admin/dashboard",
};

type NavItem = {
  label: string;
  to: string;
  roles: Role[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    roles: ["donor", "admin", "requester"],
  },
  { label: "Donate Now", to: "/donor/dashboard", roles: ["donor"] },
  { label: "Availability", to: "/donor/dashboard", roles: ["donor"] },
  { label: "History", to: "/donor/dashboard", roles: ["donor"] },
  { label: "Inventory", to: "/admin/dashboard", roles: ["admin"] },
  { label: "Requests", to: "/admin/dashboard", roles: ["admin"] },
  { label: "Analytics", to: "/admin/dashboard", roles: ["admin"] },
];

export default function SaaSLayout({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const token = localStorage.getItem("token");

  const dashboardTarget = useMemo(() => {
    if (!user) return "/";
    return roleToPrimary[user.role] ?? "/";
  }, [user]);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "LL";
  const roleLabel = user?.role ? `${user.role} workspace` : "Workspace";

  const shownNavItems = useMemo(() => {
    if (!user) return [];
    return navItems.filter((i) => i.roles.includes(user.role));
  }, [user]);

  const logout = () => {
    setMobileNavOpen(false);
    onLogout();
    navigate("/login");
  };

  const isDashboardRoute =
    location.pathname.startsWith("/donor") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/requester");

  return (
    <div className="min-h-screen text-[var(--c-ink)]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 border-b border-[var(--c-panel-border)] bg-[rgba(255,255,255,0.94)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            className="rounded-xl border border-[var(--c-panel-border)] bg-white px-3 py-2 text-sm font-bold"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Open navigation"
          >
            ☰
          </button>
          <Link to={dashboardTarget} className="flex items-center gap-3">
            <span className="android-brand-mark grid h-10 w-10 place-items-center rounded-[1.1rem] text-lg font-black text-white">
              L
            </span>
            <div className="leading-tight">
              <div className="text-base font-extrabold">LifeLine</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--c-ink-soft)]">
                {roleLabel}
              </div>
            </div>
          </Link>
          {user && token && (
            <button type="button" aria-label="Notifications">
              <LiveNotifications token={token} />
            </button>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={
            "fixed left-0 top-0 z-50 h-screen w-[86%] max-w-[280px] transform border-r border-[var(--c-panel-border)] bg-white transition-transform duration-200 lg:static lg:h-auto lg:w-[240px] lg:max-w-none lg:translate-x-0 " +
            (mobileNavOpen ? "translate-x-0" : "-translate-x-full")
          }
          aria-hidden={!mobileNavOpen}
        >
          <div className="flex h-full flex-col">
            <div className="px-4 py-4 lg:px-5">
              <Link to={dashboardTarget} className="flex items-center gap-3">
                <span className="android-brand-mark grid h-11 w-11 place-items-center rounded-[1.1rem] text-lg font-black text-white">
                  L
                </span>
                <div className="leading-tight">
                  <div className="text-base font-extrabold">LifeLine</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--c-ink-soft)]">
                    {roleLabel}
                  </div>
                </div>
              </Link>
            </div>

            <nav className="flex-1 space-y-1 px-2 pb-4">
              {shownNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    "block rounded-xl px-3 py-2 text-sm font-extrabold text-[var(--c-muted)] " +
                    (isActive
                      ? "bg-[var(--c-bg-soft)] text-[var(--c-ink)]"
                      : "hover:bg-[var(--c-bg-soft)]")
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {/* Primary CTAs by role */}
              {user?.role === "donor" && (
                <Link
                  to="/donor/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="mt-3 block rounded-2xl bg-[var(--c-primary)] px-4 py-3 text-center text-sm font-black text-white shadow"
                >
                  Donate Now
                </Link>
              )}
              {user?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="mt-3 block rounded-2xl bg-[var(--c-primary)] px-4 py-3 text-center text-sm font-black text-white shadow"
                >
                  Emergency Queue
                </Link>
              )}
            </nav>

            <div className="border-t border-[var(--c-panel-border)] p-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="android-brand-mark grid h-10 w-10 place-items-center rounded-full text-xs font-bold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold">
                      {user.email}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--c-ink-soft)]">
                      {user.role}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-[var(--c-panel-border)] bg-white px-3 py-2 text-sm font-bold"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="auth-button block text-center">
                  Login
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* Click-catcher for mobile nav */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main */}
        <main className={"w-full " + (isDashboardRoute ? "lg:pl-[240px]" : "")}>
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {user ? <Outlet /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
