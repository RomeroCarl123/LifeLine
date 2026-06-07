import { Navigate } from "react-router-dom";
import type { SessionUser } from "../api";
import DonorDashboard from "./DonorDashboard";
import RequesterDashboard from "./RequesterDashboard";
import AdminDashboard from "./AdminDashboard";

type Props = {
  user: SessionUser | null;
  token: string | null;
};

export default function Dashboard({ user, token }: Props) {
  if (!user || !token) return <Navigate to="/login" replace />;

  if (user.role === "donor") return <DonorDashboard token={token} />;
  if (user.role === "requester") return <RequesterDashboard token={token} />;
  if (user.role === "admin") return <AdminDashboard token={token} />;

  return <Navigate to="/" replace />;
}
