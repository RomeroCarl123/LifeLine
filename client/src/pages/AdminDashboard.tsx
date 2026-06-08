import { useEffect, useState } from "react";
import { api } from "../api";

type Props = { token: string };

const urgencyStyles: Record<
  string,
  { pill: string; dot: string; bar: string }
> = {
  normal: {
    pill: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    bar: "bg-slate-400",
  },
  urgent: {
    pill: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  critical: {
    pill: "bg-red-100 text-red-700",
    dot: "bg-red-600",
    bar: "bg-red-600",
  },
};

const statusStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  approved: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  in_progress: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
};

const FONT_HEAD = { fontFamily: "Urbanist, system-ui, sans-serif" };
const FONT_BODY = { fontFamily: "Epilogue, system-ui, sans-serif" };

export default function AdminDashboard({ token }: Props) {
  const [metrics, setMetrics] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [actionKey, setActionKey] = useState("");
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "in_progress" | "completed"
  >("all");
  const [query, setQuery] = useState("");

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

  const updateRequest = async (
    id: number,
    patch: Record<string, unknown>,
  ) => {
    setActionKey(`${id}-${Object.keys(patch).join("-")}`);
    try {
      await api(
        `/admin/requests/${id}`,
        { method: "PATCH", body: JSON.stringify(patch) },
        token,
      );
      await load();
    } finally {
      setActionKey("");
    }
  };

  const findMatches = async (id: number) => {
    setActionKey(`${id}-matches`);
    try {
      const result = await api<{ donors: any[] }>(
        `/requests/${id}/matches`,
        {},
        token,
      );
      alert(
        `Matched donors: ${
          result.donors
            .map((d) => `${d.name} (${d.blood_type})`)
            .join(", ") || "none"
        }`,
      );
    } finally {
      setActionKey("");
    }
  };

  const maxUrgency = Math.max(
    1,
    ...(((metrics?.requestsByUrgency ?? []).map(
      (i: any) => i.count,
    ) as number[]) || []));

  if (!metrics) {
    return (
      <section
        className="min-h-[60vh] rounded-3xl bg-white p-8 ring-1 ring-slate-200"
        style={FONT_BODY}
      >
        {error ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
            <button
              onClick={load}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-500">
              Loading admin console…
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // NOTE: `filtered2` is the real search filter used by the UI.
  // Keep this component simple: do not render a second filtered list.


  const filtered2 = requests
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) => {
      if (!query.trim()) return true;
      const s = `${r.blood_type} ${r.hospital ?? ""} ${r.location ?? ""}`.toLowerCase();
      return s.includes(query.toLowerCase());
    });

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <section className="space-y-6" style={FONT_BODY}>
      {/* SPLIT HERO */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: Operational console */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Admin Console · Live
            </div>

            <h1
              className="mt-5 text-4xl font-black leading-[1.05] sm:text-5xl"
              style={FONT_HEAD}
            >
              Triage the queue.
              <br />
              <span className="text-red-400">Move blood faster.</span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Approve requests, escalate critical cases, and match donors — all
              from one operational surface.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Stat label="Donors" value={metrics.totalDonors} />
              <Stat label="Active" value={metrics.activeRequests} accent />
              <Stat label="Urgent" value={metrics.urgentCases} />
            </div>
          </div>
        </div>

        {/* Right: Analytics card */}
        <div className="rounded-3xl bg-white p-7 ring-1 ring-slate-200">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-600">
                Request Health
              </p>
              <h3
                className="mt-1 text-2xl font-black text-slate-900"
                style={FONT_HEAD}
              >
                By urgency
              </h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              {metrics.completedRequests} completed
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {(metrics.requestsByUrgency ?? []).map((item: any) => {
              const s = urgencyStyles[item.urgency] ?? urgencyStyles.normal;
              const width = `${Math.max(6, (item.count / maxUrgency) * 100)}%`;
              return (
                <div key={item.urgency}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold capitalize text-slate-700">
                      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                      {item.urgency}
                    </span>
                    <span className="font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Top Locations
            </p>
            <div className="mt-3 space-y-2">
              {(metrics.topLocations ?? []).slice(0, 4).map((item: any) => (
                <div key={item.location} className="flex items-center justify-between text-sm">
                  <span className="truncate font-semibold text-slate-700">
                    {item.location}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-900 ring-1 ring-slate-200">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!metrics.topLocations || metrics.topLocations.length === 0) && (
                <p className="text-sm text-slate-500">No location data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUEUE WORKSPACE */}
      <div className="rounded-3xl bg-white ring-1 ring-slate-200">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-600">
              Queue
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-900" style={FONT_HEAD}>
              Request center
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blood type, hospital, location…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none lg:w-72"
            />

            <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1">
              {(["all", "pending", "approved", "in_progress", "completed"] as const).map(
                (k) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                      filter === k
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {k === "all" ? "All" : statusLabels[k]}
                    {k !== "all" && <span className="ml-1.5 opacity-70">{(counts as any)[k]}</span>}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filtered2.map((req) => {
            const u = urgencyStyles[req.urgency] ?? urgencyStyles.normal;
            return (
              <article
                key={req.id}
                className="group relative grid gap-5 p-6 transition hover:bg-slate-50 lg:grid-cols-[1fr_auto]"
              >
                <span
                  className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${u.bar}`}
                />

                <div className="pl-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-base font-black text-red-600 ring-1 ring-red-200"
                      style={FONT_HEAD}
                    >
                      {req.blood_type}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900" style={FONT_HEAD}>
                        Request #{req.id}
                        <span className="ml-2 text-sm font-bold text-slate-500">
                          · {req.units} units
                        </span>
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {req.hospital || "Hospital not set"} — {req.location || "Location not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        statusStyles[req.status] ?? statusStyles.pending
                      }`}
                    >
                      {statusLabels[req.status] ?? req.status}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${u.pill}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.dot}`} />
                      {req.urgency}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-3 lg:justify-end">
                  <ActionBtn
                    disabled={actionKey === `${req.id}-status` || req.status !== "pending"}
                    onClick={() => updateRequest(req.id, { status: "approved" })}
                  >
                    Approve
                  </ActionBtn>
                  <ActionBtn
                    disabled={actionKey === `${req.id}-status` || req.status !== "approved"}
                    onClick={() => updateRequest(req.id, { status: "in_progress" })}
                  >
                    Start
                  </ActionBtn>
                  <ActionBtn
                    disabled={actionKey === `${req.id}-status` || req.status !== "in_progress"}
                    onClick={() => updateRequest(req.id, { status: "completed" })}
                  >
                    Complete
                  </ActionBtn>
                  <ActionBtn
                    variant="warn"
                    disabled={actionKey === `${req.id}-urgency` || req.urgency === "critical"}
                    onClick={() => updateRequest(req.id, { urgency: "critical" })}
                  >
                    Mark Critical
                  </ActionBtn>
                  <ActionBtn
                    variant="primary"
                    disabled={actionKey === `${req.id}-matches`}
                    onClick={() => findMatches(req.id)}
                  >
                    Find Donors
                  </ActionBtn>
                </div>
              </article>
            );
          })}

          {filtered2.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-500">
                No requests match this view.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── primitives ── */
function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ring-1 ${
        accent
          ? "bg-red-600/15 ring-red-500/30"
          : "bg-white/5 ring-white/10"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
        {label}
      </p>
      <p
        className="mt-2 text-2xl font-black text-white"
        style={{ fontFamily: "Urbanist, system-ui, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "warn";
}) {
  const base =
    "rounded-xl px-3.5 py-2 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed";
  const map: Record<typeof variant, string> = {
    default:
      "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-900 hover:text-white hover:ring-slate-900",
    primary: "bg-slate-900 text-white hover:bg-red-600",
    warn: "bg-amber-100 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${map[variant]}`}
    >
      {children}
    </button>
  );
}

