import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";

type Props = { token: string };

type AdminMetrics = {
  totalDonors: number;
  availableDonors: number;
  activeRequests: number;
  urgentCases: number;
  completedRequests: number;
  requestsByUrgency: { urgency: string; count: number }[];
  topLocations: { location: string; count: number }[];
};

type RequestRow = {
  id: number;
  blood_type: string;
  units: number;
  urgency: "normal" | "urgent" | "critical";
  status: "pending" | "approved" | "in_progress" | "completed";
  hospital: string;
  location: string;
  contact: string;
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function AdminDashboardNew({ token }: Props) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [m, r] = await Promise.all([
        api<AdminMetrics>("/admin/dashboard", {}, token),
        api<RequestRow[]>("/requests", {}, token),
      ]);
      setMetrics(m);
      setRequests(r ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const updateRequest = async (id: number, patch: Record<string, unknown>) => {
    setActionKey(String(id) + "-" + Object.keys(patch).join("-"));
    try {
      await api(
        `/admin/requests/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(patch),
        },
        token,
      );
      await load();
    } finally {
      setActionKey("");
    }
  };

  const inventoryRisk = useMemo(() => {
    // Placeholder heuristic since backend schema does not yet include inventory expiration.
    // Use pending/active requests as a proxy.
    if (!metrics) return { label: "Low", tone: "ok" as const };
    if (metrics.urgentCases > Math.max(1, metrics.activeRequests * 0.2)) {
      return { label: "Critical", tone: "critical" as const };
    }
    return { label: "Low", tone: "ok" as const };
  }, [metrics]);

  if (loading || !metrics) {
    return (
      <div className="animate-page-in space-y-4">
        <div className="rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="flex items-center gap-3 font-extrabold text-[var(--c-primary)]">
            <span className="loading-spinner" /> Loading admin dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in space-y-6">
      {/* Hero */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-muted)]">
            Admin Dashboard
          </div>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            Emergency-ready system overview
          </h1>
          <p className="mt-2 text-sm font-bold text-[var(--c-muted)]">
            Approve and move requests through the queue with minimal clicks.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricCard
              title="Active requests"
              value={metrics.activeRequests}
            />
            <MetricCard
              title="Urgent cases"
              value={metrics.urgentCases}
              tone="warn"
            />
            <MetricCard title="Completed" value={metrics.completedRequests} />
            <MetricCard
              title="Inventory risk"
              value={inventoryRisk.label}
              tone={inventoryRisk.tone === "critical" ? "critical" : "ok"}
              stringValue
            />
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-muted)]">
            Quick operations
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-[var(--c-bg-soft)] p-4">
              <div className="text-sm font-black">Fast-track critical</div>
              <div className="mt-1 text-xs font-bold text-[var(--c-muted)]">
                Approvals + assignment in fewer steps.
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-2xl bg-[var(--c-primary)] px-4 py-3 text-sm font-black text-white"
              onClick={async () => {
                // Placeholder action: no bulk endpoints in backend.
                alert(
                  "Design spec: add bulk fast-track in next backend iteration.",
                );
              }}
            >
              Open critical queue
            </button>
          </div>
        </div>
      </section>

      {/* Inventory + analytics cards (spec placeholders) */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-muted)]">
            Blood inventory
          </div>
          <h2 className="mt-2 text-lg font-black">Available by type</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const).map(
              (t) => (
                <div
                  key={t}
                  className="rounded-2xl border border-[var(--c-panel-border)] bg-[var(--c-bg-soft)] px-4 py-3"
                >
                  <div className="text-sm font-black">{t}</div>
                  <div className="mt-2 text-xs font-bold text-[var(--c-muted)]">
                    Status badge (design)
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-[#FFF5F8] border border-[#F1CAD5] p-4 text-sm font-bold text-[var(--c-ink-soft)]">
            Inventory analytics are not backed by inventory tables yet (spec
            placeholder).
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-muted)]">
                Analytics
              </div>
              <h2 className="mt-2 text-lg font-black">
                Demand vs supply (spec)
              </h2>
            </div>
            <div className="rounded-2xl bg-[var(--c-bg-soft)] px-4 py-3">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--c-muted)]">
                Top locations
              </div>
              <div className="mt-2 text-sm font-black">
                {metrics.topLocations?.[0]?.location ?? "—"}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--c-bg-soft)] p-4">
              <div className="text-sm font-black">Donations over time</div>
              <div className="mt-2 text-xs font-bold text-[var(--c-muted)]">
                Chart placeholder (next iteration)
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--c-bg-soft)] p-4">
              <div className="text-sm font-black">Urgency distribution</div>
              <div className="mt-2 text-xs font-bold text-[var(--c-muted)]">
                Use requestsByUrgency in backend/adapter
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--c-muted)]">
              Request health
            </div>
            <div className="mt-2 space-y-2">
              {(metrics.requestsByUrgency ?? []).map((item) => (
                <div
                  key={item.urgency}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="text-sm font-black capitalize">
                    {item.urgency}
                  </div>
                  <div className="text-sm font-black">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Requests table */}
      <section className="rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-muted)]">
              Request management
            </div>
            <h2 className="mt-2 text-lg font-black">
              Approve / reject with urgency-aware actions
            </h2>
          </div>
          <div className="rounded-2xl bg-[var(--c-bg-soft)] px-4 py-3">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--c-muted)]">
              Queue size
            </div>
            <div className="mt-2 text-sm font-black">{requests.length}</div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[860px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs font-black uppercase tracking-[0.18em] text-[var(--c-muted)]">
                <th className="p-3">ID</th>
                <th className="p-3">Blood</th>
                <th className="p-3">Units</th>
                <th className="p-3">Urgency</th>
                <th className="p-3">Hospital</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="border-t border-[var(--c-panel-border)] text-sm"
                >
                  <td className="p-3 font-extrabold">#{req.id}</td>
                  <td className="p-3 font-extrabold">{req.blood_type}</td>
                  <td className="p-3 font-bold">{req.units}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                        req.urgency === "critical"
                          ? "bg-[#fff0f2] text-[#b42336]"
                          : req.urgency === "urgent"
                            ? "bg-[#fff7ed] text-[#b45309]"
                            : "bg-[#eef6ff] text-[#2563eb]"
                      }`}
                    >
                      {req.urgency}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[var(--c-muted)]">
                    {req.hospital || "—"}
                  </td>
                  <td className="p-3 font-bold">
                    {statusLabel[req.status] ?? req.status}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-xl border border-[#F1CAD5] bg-white px-3 py-2 text-xs font-black text-[var(--c-ink-soft)] disabled:opacity-60"
                        disabled={
                          req.status !== "pending" ||
                          actionKey === `${req.id}-approve`
                        }
                        onClick={() =>
                          updateRequest(req.id, { status: "approved" })
                        }
                      >
                        {actionKey === `${req.id}-approve` ? "..." : "Approve"}
                      </button>
                      <button
                        className="rounded-xl bg-[#FFEAF0] px-3 py-2 text-xs font-black text-[var(--c-ink-soft)] disabled:opacity-60"
                        disabled={
                          req.status !== "approved" ||
                          actionKey === `${req.id}-start`
                        }
                        onClick={() =>
                          updateRequest(req.id, { status: "in_progress" })
                        }
                      >
                        {actionKey === `${req.id}-start` ? "..." : "Start"}
                      </button>
                      <button
                        className="rounded-xl bg-[#FFE5EA] px-3 py-2 text-xs font-black text-[var(--c-ink-soft)] disabled:opacity-60"
                        disabled={
                          req.status !== "in_progress" ||
                          actionKey === `${req.id}-complete`
                        }
                        onClick={() =>
                          updateRequest(req.id, { status: "completed" })
                        }
                      >
                        {actionKey === `${req.id}-complete`
                          ? "..."
                          : "Complete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center font-bold text-[var(--c-muted)]"
                  >
                    No requests in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-[#F1CAD5] bg-[#FFF5F8] px-4 py-3 text-sm font-bold text-[var(--c-ink-soft)]">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  tone,
  stringValue,
}: {
  title: string;
  value: number | string;
  tone?: "warn" | "critical" | "ok";
  stringValue?: boolean;
}) {
  const toneClass =
    tone === "critical"
      ? "bg-[#fff0f2] text-[#b42336]"
      : tone === "warn"
        ? "bg-[#fff7ed] text-[#b45309]"
        : "bg-[#eef6ff] text-[#2563eb]";

  return (
    <div className="rounded-2xl border border-[var(--c-panel-border)] bg-[var(--c-bg-soft)] p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--c-muted)]">
        {title}
      </div>
      <div
        className={`mt-2 text-3xl font-black ${stringValue ? "" : "text-[var(--c-ink)]"}`}
      >
        <span className={typeof value === "string" ? "" : ""}>{value}</span>
      </div>
      {typeof value === "string" ? (
        <div
          className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${toneClass}`}
        >
          {value}
        </div>
      ) : null}
    </div>
  );
}
