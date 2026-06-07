import { useMemo, useState } from "react";
import {
  HashRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AppShell from "./components/AppShell";
import SaaSLayout from "./components/SaaSLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminAccess from "./pages/AdminAccess";
import Dashboard from "./pages/Dashboard";
import AdminDashboardNew from "./pages/admin/AdminDashboardNew";
import DonorDashboardNew from "./pages/donor/DonorDashboardNew";
import RequesterDashboard from "./pages/RequesterDashboard";

import type { SessionUser } from "./api";

function MainNav() {
  const location = useLocation();

  if (location.pathname !== "/") return null;

  return (
    <nav className="site-nav sticky top-0 z-50">
      <div className="app-shell-width flex w-full flex-wrap items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="android-brand-mark grid h-12 w-12 place-items-center rounded-[1.1rem] text-lg font-black text-white">
            L
          </span>
          <span>
            <span className="block text-base font-extrabold leading-tight text-[var(--c-ink)]">
              LifeLine
            </span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--c-ink-soft)]">
              Blood Response Network
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link px-4 py-2 text-sm ${isActive ? "nav-link-active" : ""}`
            }
          >
            Home
          </NavLink>
          <a href="#about" className="nav-link px-4 py-2 text-sm">
            About
          </a>
          <Link to="/login" className="nav-link px-4 py-2 text-sm">
            Login
          </Link>
          <Link to="/register" className="auth-button px-5 py-2.5 text-sm">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<SessionUser | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const authApi = useMemo(
    () => ({
      onAuth: (nextToken: string, nextUser: SessionUser) => {
        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem("token", nextToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
      },
      onLogout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      },
    }),
    [],
  );

  return (
    <HashRouter>
      <MainNav />
      <Routes>
        <Route
          path="/"
          element={
            <AppShell user={user} onLogout={authApi.onLogout}>
              <Home />
            </AppShell>
          }
        />
        <Route
          path="/login"
          element={
            <AppShell user={user} onLogout={authApi.onLogout}>
              <Login onAuth={authApi.onAuth} />
            </AppShell>
          }
        />
        <Route
          path="/register"
          element={
            <AppShell user={user} onLogout={authApi.onLogout}>
              <Register onAuth={authApi.onAuth} />
            </AppShell>
          }
        />
        <Route
          path="/admin-access"
          element={
            <AppShell user={user} onLogout={authApi.onLogout}>
              <AdminAccess onAuth={authApi.onAuth} />
            </AppShell>
          }
        />

        <Route element={<SaaSLayout user={user} onLogout={authApi.onLogout} />}>
          <Route
            path="/dashboard"
            element={<Dashboard user={user} token={token} />}
          />
          <Route
            path="/admin/dashboard"
            element={
              token && user?.role === "admin" ? (
                <AdminDashboardNew token={token} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/donor/dashboard"
            element={
              token ? (
                <DonorDashboardNew token={token} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/requester/dashboard"
            element={
              token ? (
                <RequesterDashboard token={token} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
