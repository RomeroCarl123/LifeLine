import { useEffect, useState } from "react";
import { api } from "../api";

type Props = { token: string };

const urgencyStyles: Record<string, string> = {
  normal: "bg-[#FFF1F5] text-[#D02752]",
  urgent: "bg-[#FFF0F4] text-[#D02752]",
  critical: "bg-[#FFE5EA] text-[#D02752]",
};

const statusStyles: Record<string, string> = {
  pending: "bg-[#FFF1F5] text-[#8A244B]",
  approved: "bg-[#FFEAF0] text-[#D02752]",
  in_progress: "bg-[#E6F7F4] text-[#8A244B]",
  completed: "bg-[#FFE5EA] text-[#8A244B]",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function AdminDashboard({ token }: Props) {
  const [metrics, setMetrics] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [actionKey, setActionKey] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [m, r] = await Promise.all([
        api("/admin/dashboard", {}, token),
        api<any[]>("/requests", {}, token),
      ]);
      setMetrics(m);
      setRequests(r);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRequest = async (id: number, patch: Record<string, unknown>) => {
    setActionKey(`${id}-${Object.keys(patch).join("-")}`);
    try {
      await api(`/admin/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }, token);
      await load();
    } finally {
      setActionKey("");
    }
  };

  const findMatches = async (id: number) => {
    setActionKey(`${id}-matches`);
    try {
      const result = await api<{ donors: any[] }>(`/requests/${id}/matches`, {}, token);
      alert(`Matched donors: ${result.donors.map((d) => `${d.name} (${d.blood_type})`).join(", ") || "none"}`);
    } finally {
      setActionKey("");
    }
  };

  const maxUrgency = Math.max(
    1,
    ...((metrics?.requestsByUrgency ?? []).map((item: any) => item.count) as number[]),
  );

  if (!metrics) {
    return (
      <div className="panel animate-page-in p-6">
        {error ? (
          <div className="space-y-4">
            <p className="rounded-[1rem] border border-[#F0D7DD] bg-[#FBF1F4] px-4 py-3 text-sm font-semibold text-[#D02752]">
              {error}
            </p>
            <button className="btn-secondary" onClick={load}>
              Retry Loading Admin Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-[#D02752]">
              <span className="loading-spinner" />
              Loading admin dashboard...
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="skeleton-line h-24" />
              <div className="skeleton-line h-24" />
              <div className="skeleton-line h-24" />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="animate-page-in space-y-6">
      <div className="dashboard-hero overflow-hidden p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D02752]">
          Admin Dashboard
        </p>
        <h2 className="mt-3 text-3xl font-black leading-tight text-[#8A244B] sm:text-4xl">
          System overview and queue management
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8A244B]">
          Review metrics, move requests through the queue, and find donors without jumping between screens.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="dashboard-stat animate-card-in p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">
            Total Donors
          </p>
          <p className="mt-3 text-4xl font-black text-[#8A244B]">
            {metrics.totalDonors}
          </p>
        </div>
        <div className="dashboard-stat animate-card-in p-5" style={{ animationDelay: "60ms" }}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">
            Active Requests
          </p>
          <p className="mt-3 text-4xl font-black text-[#8A244B]">
            {metrics.activeRequests}
          </p>
        </div>
        <div className="dashboard-stat animate-card-in p-5" style={{ animationDelay: "120ms" }}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">
            Urgent Cases
          </p>
          <p className="mt-3 text-4xl font-black text-[#8A244B]">
            {metrics.urgentCases}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <section className="dashboard-section animate-card-in p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">
                Analytics
              </p>
              <h3 className="mt-1 text-xl font-black text-[#8A244B]">
                Request Health
              </h3>
            </div>
            <div className="rounded-full bg-[#FFE5EA] px-3 py-1 text-sm font-bold text-[#8A244B]">
              {metrics.completedRequests} completed
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-4">
              {(metrics.requestsByUrgency ?? []).map((item: any) => (
                <div key={item.urgency}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-bold capitalize text-[#8A244B]">
                      {item.urgency}
                    </span>
                    <span className="font-semibold text-[#8A244B]">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#EDF3F8]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.urgency === "critical"
                          ? "bg-[#F63049]"
                          : item.urgency === "urgent"
                            ? "bg-[#D29654]"
                            : "bg-[#6B879F]"
                      }`}
                      style={{ width: `${Math.max(8, (item.count / maxUrgency) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[1.25rem] border border-[#F6D6DE] bg-[#FFF5F8] p-4">
              <p className="text-sm font-black text-[#8A244B]">
                Top Request Locations
              </p>
              <div className="mt-4 space-y-3">
                {(metrics.topLocations ?? []).map((item: any) => (
                  <div key={item.location} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-semibold text-[#8A244B]">
                      {item.location}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 font-bold text-[#8A244B]">
                      {item.count}
                    </span>
                  </div>
                ))}
                {metrics.topLocations?.length === 0 && (
                  <p className="text-sm text-[#8A244B]">No location data yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="dashboard-section animate-card-in overflow-hidden">
        <div className="dashboard-section-header p-5">
          <h3 className="text-xl font-black text-[#8A244B]">Request Queue</h3>
          <p className="mt-1 text-sm text-[#8A244B]">
            Review priority, status, location, and matching actions.
          </p>
        </div>
        <div className="divide-y divide-[#F6D6DE]">
          {requests.map((req, index) => (
            <article key={req.id} className="animate-card-in grid gap-4 p-5 lg:grid-cols-[1fr_auto]" style={{ animationDelay: `${index * 45}ms` }}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-black text-[#8A244B]">
                    Request #{req.id}: {req.blood_type}
                  </p>
                  <span className="text-sm font-bold text-[#8A244B]">
                    {req.units} units
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#8A244B]">
                  {req.hospital || "Hospital not set"} -{" "}
                  {req.location || "Location not provided"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[req.status] ?? statusStyles.pending}`}>
                    {statusLabels[req.status] ?? req.status}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${urgencyStyles[req.urgency] ?? urgencyStyles.normal}`}>
                    {req.urgency}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button className="rounded-[1rem] border border-[#F1CAD5] bg-white px-3 py-2 text-sm font-bold text-[#8A244B] transition hover:bg-[#FFF5F8] disabled:opacity-70" disabled={actionKey === `${req.id}-status` || req.status !== "pending"} onClick={() => updateRequest(req.id, { status: "approved" })}>{actionKey === `${req.id}-status` ? <span className="loading-spinner" /> : "Approve"}</button>
                <button className="rounded-full bg-[#FFEAF0] px-3 py-2 text-sm font-bold text-[#8A244B] transition hover:bg-[#FFE1E9] disabled:opacity-70" disabled={actionKey === `${req.id}-status` || req.status !== "approved"} onClick={() => updateRequest(req.id, { status: "in_progress" })}>{actionKey === `${req.id}-status` ? <span className="loading-spinner" /> : "Start"}</button>
                <button className="rounded-full bg-[#FFE5EA] px-3 py-2 text-sm font-bold text-[#8A244B] transition hover:bg-[#FFEAF0] disabled:opacity-70" disabled={actionKey === `${req.id}-status` || req.status !== "in_progress"} onClick={() => updateRequest(req.id, { status: "completed" })}>{actionKey === `${req.id}-status` ? <span className="loading-spinner" /> : "Complete"}</button>
                <button className="rounded-full bg-[#FFE5EA] px-3 py-2 text-sm font-bold text-[#D02752] transition hover:bg-[#FFD9E2] disabled:opacity-70" disabled={actionKey === `${req.id}-urgency`} onClick={() => updateRequest(req.id, { urgency: "critical" })}>{actionKey === `${req.id}-urgency` ? <span className="loading-spinner" /> : "Mark Critical"}</button>
                <button className="rounded-[1rem] bg-[#F63049] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#D02752] disabled:opacity-70" disabled={actionKey === `${req.id}-matches`} onClick={() => findMatches(req.id)}>{actionKey === `${req.id}-matches` ? <span className="loading-spinner" /> : "Find Donors"}</button>
              </div>
            </article>
          ))}
          {requests.length === 0 && (
            <p className="p-5 text-sm text-[#8A244B]">
              No requests are currently in the queue.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
