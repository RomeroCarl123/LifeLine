import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { SessionUser } from "../api";

type Props = {
  user: SessionUser | null;
  onLogout: () => void;
  children: ReactNode;
};

export default function AppShell({ user, onLogout, children }: Props) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuth = location.pathname === "/login" || location.pathname === "/register";
  void user;
  void onLogout;

  return (
    <div className="android-screen min-h-screen">
      <main className={isHome || isAuth ? "w-full" : "app-page-width w-full py-6"}>
        {children}
      </main>
    </div>
  );
}
