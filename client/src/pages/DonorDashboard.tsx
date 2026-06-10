import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

type Props = { token: string };

const urgencyStyles: Record<
  string,
  { dot: string; pill: string; label: string }
> = {
  normal: {
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Normal",
  },
  urgent: {
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Urgent",
  },
  critical: {
    dot: "bg-[var(--ll-accent,#ef4444)]",
    pill: "bg-red-50 text-red-700 border-red-200",
    label: "Critical",
  },
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function DonorDashboard({ token }: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  // Requests you can respond to are already matched by blood type + location on the backend.
  // So we don't need any donor-side filters here.

  const load = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);

    const [profileData, matchData, directRequests] = await Promise.all([
      api("/donors/me", {}, token),
      api<{ requests: any[] }>(`/donors/requests/matches`, {}, token),
      api<any[]>(`/requests/donors/requests`, {}, token),
    ]);

    setProfile(profileData);
    setMatches([...directRequests, ...matchData.requests]);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggle = async () => {
    if (!profile) return;
    setIsToggling(true);
    try {
      await api(
        "/donors/me",
        {
          method: "PATCH",
          body: JSON.stringify({ availability: !profile.availability }),
        },
        token,
      );

      setProfile({ ...profile, availability: !profile.availability });
      setMessage("");
      await load();
    } finally {
      setIsToggling(false);
    }
  };

  const acceptRequest = async (id: number) => {
    try {
      setAcceptingId(id);
      await api(`/donors/requests/${id}/respond`, { method: "POST" }, token);
      setMessage(`You accepted request #${id}.`);
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setAcceptingId(null);
    }
  };

  const criticalCount = matches.filter((m) => m.urgency === "critical").length;
  const urgentCount = matches.filter((m) => m.urgency === "urgent").length;

  if (isLoading || !profile) {
    return (
      <section
        className="min-h-screen bg-[var(--ll-bg,#f8fafc)] px-6 py-10"
        style={{ fontFamily: "'Epilogue', system-ui, sans-serif" }}
      >
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <span className="loading-spinner" />
            Loading donor workspace…
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="min-h-screen bg-[var(--ll-bg,#f8fafc)] px-4 py-8 sm:px-6 lg:px-10"
      style={{ fontFamily: "'Epilogue', system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        {/* SPLIT HERO */}
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_1.05fr]">
          {/* Dark operational panel */}
          <div className="relative bg-[var(--ll-ink,#0f172a)] p-8 text-white lg:p-10">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ll-accent,#ef4444)]" />
              Donor Console
            </div>

            <h2
              className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl"
              style={{ fontFamily: "'Urbanist', system-ui, sans-serif" }}
            >
              Ready when
              <br />
              <span className="text-[var(--ll-accent,#ef4444)]">
                the call comes.
              </span>
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Your blood type, location, and availability decide who reaches
              you. Toggle on, scan the queue, accept in one tap.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              <Stat label="Matches" value={String(matches.length)} />
              <Stat label="Critical" value={String(criticalCount)} accent />
              <Stat label="Urgent" value={String(urgentCount)} />
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="relative flex h-2.5 w-2.5">
                {profile.availability && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    profile.availability ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                />
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Live status
                </p>
                <p className="text-sm font-semibold text-white">
                  {profile.availability
                    ? "Available to be matched"
                    : "Paused — not receiving"}
                </p>
              </div>
            </div>
          </div>

          {/* Light availability panel */}
          <div className="flex flex-col justify-between gap-6 p-8 lg:p-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ll-accent,#ef4444)]">
                Profile
              </p>
              <h3
                className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl"
                style={{ fontFamily: "'Urbanist', system-ui, sans-serif" }}
              >
                Your donation workspace
              </h3>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <ProfileCell
                  label="Blood type"
                  value={profile.blood_type}
                  highlight
                />
                <ProfileCell label="Location" value={profile.location || "—"} />
                <ProfileCell
                  label="State"
                  value={profile.availability ? "Active" : "Paused"}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Availability switch
                  </p>
                  <p
                    className="mt-1 text-lg font-black text-slate-900"
                    style={{ fontFamily: "'Urbanist', system-ui, sans-serif" }}
                  >
                    {profile.availability
                      ? "You're on call."
                      : "You're paused."}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {profile.availability
                      ? "Requests matching your type will appear here in real time."
                      : "Turn on to start receiving matchable requests."}
                  </p>
                </div>
              </div>

              <button
                onClick={toggle}
                disabled={isToggling}
                className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition disabled:opacity-60 ${
                  profile.availability
                    ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-[var(--ll-ink,#0f172a)] text-white hover:bg-[var(--ll-accent,#ef4444)]"
                }`}
              >
                {isToggling ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="loading-spinner" />
                    Updating
                  </span>
                ) : profile.availability ? (
                  "Pause availability"
                ) : (
                  "Mark available"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* QUEUE */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 p-6 sm:p-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--ll-accent,#ef4444)]">
                Live queue
              </p>
              <h3
                className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl"
                style={{ fontFamily: "'Urbanist', system-ui, sans-serif" }}
              >
                Requests you can respond to
              </h3>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Matched by your blood type and location, then sorted by urgency.
              </p>
            </div>

            <button
              onClick={() => load(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {isRefreshing ? (
                <>
                  <span className="loading-spinner" /> Refreshing
                </>
              ) : (
                <>↻ Refresh</>
              )}
            </button>
          </div>

          {message && (
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-900 sm:px-8">
              {message}
            </div>
          )}

          {/* Filter rail removed: requests are returned already matching the donor's blood type + location. */}
          <div className="grid gap-3 border-b border-slate-200 bg-slate-50/60 p-6 sm:p-8">
            <div className="text-sm font-semibold text-slate-700">
              Showing requests matched to your blood type.
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-4 p-6 sm:p-8 xl:grid-cols-2">
            {matches.map((req) => {
              const u = urgencyStyles[req.urgency] ?? urgencyStyles.normal;
              return (
                <article
                  key={req.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
                >
                  <span
                    className={`absolute left-0 top-0 h-full w-1 ${u.dot}`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-3xl font-black tracking-tight text-slate-900"
                          style={{
                            fontFamily: "'Urbanist', system-ui, sans-serif",
                          }}
                        >
                          {req.blood_type}
                        </span>
                        <span className="text-sm font-bold text-slate-500">
                          · {req.units} units
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {req.hospital || "Hospital not set"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${u.pill}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.dot}`} />
                      {u.label}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-x-4 gap-y-2 border-t border-slate-100 pt-4 pl-2 text-sm sm:grid-cols-2">
                    <MetaRow
                      label="Location"
                      value={req.location || "Not provided"}
                    />
                    <MetaRow
                      label="Status"
                      value={statusLabels[req.status] ?? req.status}
                    />
                    <div className="sm:col-span-2">
                      <MetaRow
                        label="Contact"
                        value={req.contact || "Not provided"}
                      />
                    </div>
                  </div>

                  <button
                    className="mt-5 w-full rounded-xl bg-[var(--ll-ink,#0f172a)] px-4 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[var(--ll-accent,#ef4444)] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    onClick={() => acceptRequest(req.id)}
                    disabled={!profile.availability || acceptingId === req.id}
                  >
                    {acceptingId === req.id ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <span className="loading-spinner" /> Accepting
                      </span>
                    ) : profile.availability ? (
                      "Accept request →"
                    ) : (
                      "Mark available to accept"
                    )}
                  </button>
                </article>
              );
            })}

            {matches.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 xl:col-span-2">
                <p className="font-semibold text-slate-900">
                  No open matches right now.
                </p>
                <p className="mt-1">
                  We'll surface new requests here the moment they're posted.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-black tracking-tight ${
          accent ? "text-[var(--ll-accent,#ef4444)]" : "text-white"
        }`}
        style={{ fontFamily: "'Urbanist', system-ui, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function ProfileCell({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-black tracking-tight ${
          highlight ? "text-[var(--ll-accent,#ef4444)]" : "text-slate-900"
        }`}
        style={{ fontFamily: "'Urbanist', system-ui, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function FilterInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--ll-accent,#ef4444)] focus:outline-none focus:ring-2 focus:ring-red-100"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-slate-600">
      <span className="font-bold text-slate-900">{label}:</span> {value}
    </p>
  );
}
