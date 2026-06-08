import { useMemo, useState } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AppShell from "./components/AppShell";
import SaaSLayout from "./components/SaaSLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DonorDashboard from "./pages/DonorDashboard";

import RequesterDashboard from "./pages/RequesterDashboard";

import type { SessionUser } from "./api";

function MainNav() {
  const location = useLocation();

  if (location.pathname !== "/") return null;

  // Removed the app-wide nav to avoid duplicating the redesigned Home page header.
  return null;
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

        <Route element={<SaaSLayout user={user} onLogout={authApi.onLogout} />}>
          <Route
            path="/dashboard"
            element={<Dashboard user={user} token={token} />}
          />
          <Route
            path="/admin/dashboard"
            element={
              token && user?.role === "admin" ? (
                <AdminDashboard token={token} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/donor/dashboard"
            element={
              token ? (
                <DonorDashboard token={token} />
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
