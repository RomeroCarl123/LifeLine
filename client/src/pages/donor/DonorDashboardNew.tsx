import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";

type Props = { token: string };

type DonorProfile = {
  user_id: number;
  blood_type: string;
  location: string;
  availability: boolean;
};

type MatchRequest = {
  id: number;
  blood_type: string;
  units: number;
  urgency: "normal" | "urgent" | "critical";
  status: "pending" | "approved" | "in_progress" | "completed";
  hospital: string;
  location: string;
  contact: string;
};

const urgencyOrder: Record<string, number> = {
  critical: 0,
  urgent: 1,
  normal: 2,
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function DonorDashboardNew({ token }: Props) {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [matches, setMatches] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const criticalCount = useMemo(
    () => matches.filter((m) => m.urgency === "critical").length,
    [matches],
  );

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [p, r] = await Promise.all([
        api<DonorProfile>("/donors/me", {}, token),
        api<{ requests: MatchRequest[] }>(
          "/donors/requests/matches",
          {},
          token,
        ),
      ]);
      setProfile(p);
      setMatches(r.requests ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const toggleAvailability = async () => {
    if (!profile) return;
    setToggleLoading(true);
    try {
      await api(
        "/donors/me",
        {
          method: "PATCH",
          body: JSON.stringify({ availability: !profile.availability }),
        },
        token,
      );
      await load();
    } finally {
      setToggleLoading(false);
    }
  };

  const acceptRequest = async (id: number) => {
    setAcceptingId(id);
    try {
      await api(`/donors/requests/${id}/respond`, { method: "POST" }, token);
      setMessage(`Accepted request #${id}.`);
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setAcceptingId(null);
    }
  };

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const oa = urgencyOrder[a.urgency] ?? 3;
      const ob = urgencyOrder[b.urgency] ?? 3;
      if (oa !== ob) return oa - ob;
      return b.id - a.id;
    });
  }, [matches]);

  if (loading || !profile) {
    return (
      <div className="animate-page-in space-y-4">
        <div className="rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="flex items-center gap-3 font-extrabold text-[var(--c-primary)]">
            <span className="loading-spinner" /> Loading donor dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-in space-y-6">
      {/* Hero + emergency */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-primary-strong)]">
                Donor Dashboard
              </div>
              <h1 className="mt-2 text-2xl font-black text-[var(--c-ink)] sm:text-3xl">
                Donate when it matters.
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--c-muted)]">
                Your availability controls which requests you can accept.
              </p>
            </div>

            {criticalCount > 0 ? (
              <div className="rounded-2xl border border-[#F1CAD5] bg-[#FFF5F8] p-3">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--c-ink-soft)]">
                  Emergency matches
                </div>
                <div className="mt-2 text-2xl font-black text-[var(--c-ink-soft)]">
                  {criticalCount}
                </div>
                <div className="mt-1 text-xs font-bold text-[var(--c-muted)]">
                  Critical requests nearby
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--c-panel-border)] bg-[var(--c-bg-soft)] p-3">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--c-muted)]">
                  No critical queue
                </div>
                <div className="mt-2 text-sm font-bold text-[var(--c-ink)]">
                  You’re all set.
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--c-bg-soft)] p-4">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--c-muted)]">
                Blood type
              </div>
              <div className="mt-2 text-3xl font-black text-[var(--c-ink)]">
                {profile.blood_type}
              </div>
              <div className="mt-2 text-sm font-bold text-[var(--c-muted)]">
                Compatible requests prioritize urgent cases.
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--c-muted)]">
                    Availability
                  </div>
                  <div className="mt-2 text-2xl font-black text-[var(--c-ink)]">
                    {profile.availability ? "Available" : "Paused"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleAvailability}
                  disabled={toggleLoading}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    profile.availability
                      ? "border border-[#F1CAD5] bg-white text-[var(--c-ink-soft)] hover:bg-[#FFF5F8]"
                      : "bg-[var(--c-primary)] text-white hover:bg-[var(--c-primary-strong)]"
                  }`}
                >
                  {toggleLoading
                    ? "Updating"
                    : profile.availability
                      ? "Pause"
                      : "Donate Now"}
                </button>
              </div>
              <div className="mt-2 text-sm font-bold text-[var(--c-muted)]">
                {profile.availability
                  ? "You can accept matching requests right now."
                  : "Turn availability on to respond to requests."}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-primary-strong)]">
            Quick actions
          </div>
          <div className="mt-4 space-y-3">
            <button className="w-full rounded-2xl bg-[var(--c-primary)] px-4 py-3 text-left text-sm font-black text-white">
              Donate Now
              <div className="mt-1 text-xs font-bold text-white/80">
                2-step scheduling (design)
              </div>
            </button>
            <LinkLike />
            <LinkLike label="View History" hint="Donation timeline" />
          </div>
        </div>
      </section>

      {/* Matches */}
      <section className="rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-muted)]">
              Matches
            </div>
            <h2 className="mt-2 text-xl font-black">
              Requests you can respond to
            </h2>
            <p className="mt-1 text-sm font-bold text-[var(--c-muted)]">
              Sorted by critical → urgent → normal.
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--c-bg-soft)] px-4 py-3">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--c-muted)]">
              Next step
            </div>
            <div className="mt-2 text-sm font-extrabold text-[var(--c-ink)]">
              {profile.availability ? "Accept to start" : "Enable availability"}
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-[#F1CAD5] bg-[#FFF5F8] px-4 py-3 text-sm font-bold text-[var(--c-ink-soft)]">
            {message}
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sortedMatches.slice(0, 10).map((req) => (
            <article
              key={req.id}
              className="rounded-2xl border border-[var(--c-panel-border)] bg-[var(--c-panel)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--c-muted)]">
                    Request #{req.id}
                  </div>
                  <div className="mt-2 text-xl font-black">
                    {req.blood_type}{" "}
                    <span className="text-base">· {req.units} units</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-[var(--c-muted)]">
                    {req.hospital || "Hospital not set"}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                    req.urgency === "critical"
                      ? "bg-[#fff0f2] text-[#b42336]"
                      : req.urgency === "urgent"
                        ? "bg-[#fff7ed] text-[#b45309]"
                        : "bg-[#eef6ff] text-[#2563EB]"
                  }`}
                >
                  {req.urgency}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--c-bg-soft)] px-3 py-2">
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--c-muted)]">
                    Location
                  </div>
                  <div className="mt-1 font-bold">
                    {req.location || "Not provided"}
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--c-bg-soft)] px-3 py-2">
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--c-muted)]">
                    Status
                  </div>
                  <div className="mt-1 font-bold">
                    {statusLabel[req.status] ?? req.status}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => acceptRequest(req.id)}
                disabled={!profile.availability || acceptingId === req.id}
                className="mt-4 w-full rounded-2xl bg-[var(--c-primary)] px-4 py-3 text-center text-sm font-black text-white disabled:opacity-60"
              >
                {acceptingId === req.id
                  ? "Accepting"
                  : profile.availability
                    ? "Accept"
                    : "Enable availability"}
              </button>
            </article>
          ))}

          {sortedMatches.length === 0 && (
            <div className="sm:col-span-2 rounded-2xl border border-dashed border-[#F1CAD5] bg-[#FFF5F8] p-6 text-sm font-bold text-[var(--c-ink-soft)]">
              No matches yet.
              <div className="mt-2 text-sm font-bold text-[var(--c-muted)]">
                Turn availability on to receive compatible requests.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Placeholders for schedule + history to match spec */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-muted)]">
            Upcoming donation
          </div>
          <h3 className="mt-2 text-lg font-black">
            Schedule your next donation
          </h3>
          <div className="mt-3 rounded-2xl bg-[var(--c-bg-soft)] p-4 text-sm font-bold text-[var(--c-muted)]">
            Empty state (design): Add an appointment in 2 minutes.
          </div>
        </div>
        <div className="lg:col-span-5 rounded-2xl border border-[var(--c-panel-border)] bg-white p-5 shadow-[var(--c-shadow)]">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--c-muted)]">
            Donation history
          </div>
          <h3 className="mt-2 text-lg font-black">Your timeline</h3>
          <div className="mt-3 rounded-2xl bg-[var(--c-bg-soft)] p-4 text-sm font-bold text-[var(--c-muted)]">
            History timeline component (design placeholder).
          </div>
        </div>
      </section>
    </div>
  );
}

function LinkLike({ label, hint }: { label?: string; hint?: string }) {
  if (!label) return null;
  return (
    <div className="rounded-2xl border border-[var(--c-panel-border)] bg-white px-4 py-3">
      <div className="text-sm font-black">{label}</div>
      {hint ? (
        <div className="mt-1 text-xs font-bold text-[var(--c-muted)]">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
