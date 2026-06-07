import { Navigate } from "react-router-dom";
import type { Role, SessionUser } from "../api";

type Props = {
  user: SessionUser | null;
  allow: Role[];
  children: React.ReactNode;
};

export default function ProtectedRoute({ user, allow, children }: Props) {
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
