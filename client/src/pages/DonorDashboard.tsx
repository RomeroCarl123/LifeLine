import { useEffect, useState } from "react";
import { api } from "../api";

type Props = { token: string };

const urgencyStyles: Record<string, string> = {
  normal: "bg-[#FFF1F5] text-[#D02752]",
  urgent: "bg-[#FFF0F4] text-[#D02752]",
  critical: "bg-[#FFE5EA] text-[#D02752]",
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
  const [matchFilter, setMatchFilter] = useState({
    bloodType: "",
    location: "",
    urgency: "",
    search: "",
  });

  const load = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    const params = new URLSearchParams();
    if (matchFilter.bloodType) params.set("bloodType", matchFilter.bloodType);
    if (matchFilter.location) params.set("location", matchFilter.location);
    if (matchFilter.urgency) params.set("urgency", matchFilter.urgency);
    if (matchFilter.search) params.set("search", matchFilter.search);
    const [profileData, matchData] = await Promise.all([
      api("/donors/me", {}, token),
      api<{ requests: any[] }>(`/donors/requests/matches?${params.toString()}`, {}, token),
    ]);
    setProfile(profileData);
    setMatches(matchData.requests);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => { load(); }, [token]);

  const toggle = async () => {
    if (!profile) return;
    setIsToggling(true);
    try {
      await api("/donors/me", {
        method: "PATCH",
        body: JSON.stringify({ availability: !profile.availability }),
      }, token);
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

  if (isLoading || !profile) {
    return (
      <div className="panel animate-page-in p-6">
        <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-[#D02752]">
          <span className="loading-spinner" />
          Loading donor profile...
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="skeleton-line h-20" />
          <div className="skeleton-line h-20" />
          <div className="skeleton-line h-20" />
        </div>
      </div>
    );
  }

  return (
    <section className="animate-page-in space-y-6">
      <div className="dashboard-hero overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[1.5fr_0.9fr] md:p-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D02752]">
              Donor Dashboard
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#8A244B] sm:text-4xl">
              Your donation workspace
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8A244B]">
              Check your status, review matching requests, and respond quickly when you are needed.
            </p>
          </div>
          <div className="dashboard-stat p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">Current availability</p>
            <p className="mt-2 text-2xl font-black text-[#8A244B]">{profile.availability ? "Available" : "Paused"}</p>
            <p className="mt-2 text-sm text-[#8A244B]">
              {profile.availability ? "You can accept new matches right now." : "Turn availability on to receive matchable requests."}
            </p>
            <button
              onClick={toggle}
              disabled={isToggling}
              className={`mt-5 w-full rounded-[1rem] px-4 py-3 text-sm font-bold transition ${
                profile.availability
                  ? "border border-[#F1CAD5] bg-white text-[#8A244B] hover:bg-[#FFF5F8]"
                  : "bg-[#F63049] text-white hover:bg-[#D02752]"
              }`}
            >
              {isToggling ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loading-spinner" />
                  Updating
                </span>
              ) : profile.availability ? "Pause Availability" : "Mark Available"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="dashboard-stat animate-card-in p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">
            Blood Type
          </p>
          <p className="mt-3 text-3xl font-black text-[#8A244B]">
            {profile.blood_type}
          </p>
        </article>
        <article className="dashboard-stat animate-card-in p-5" style={{ animationDelay: "60ms" }}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">
            Location
          </p>
          <p className="mt-3 text-xl font-bold text-[#8A244B]">
            {profile.location}
          </p>
        </article>
        <article className="dashboard-stat animate-card-in p-5" style={{ animationDelay: "120ms" }}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">
            Status
          </p>
          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${
              profile.availability
                ? "bg-[#FFE5EA] text-[#8A244B]"
                : "bg-[#FFF1F5] text-[#8A244B]"
            }`}
          >
            {profile.availability ? "Available for matches" : "Not available"}
          </span>
        </article>
      </div>
      <section className="dashboard-section animate-card-in overflow-hidden">
        <div className="dashboard-section-header p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D02752]">
                Matching Requests
              </p>
              <h3 className="mt-1 text-xl font-black text-[#8A244B]">
                Requests You Can Respond To
              </h3>
              <p className="mt-1 text-sm text-[#8A244B]">
                Matches use your blood type and location, then prioritize urgent cases.
              </p>
            </div>
            <button className="btn-secondary w-full sm:w-auto" onClick={() => load(true)} disabled={isRefreshing}>
              {isRefreshing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loading-spinner" />
                  Refreshing
                </span>
              ) : "Refresh Matches"}
            </button>
          </div>
          {message && (
            <p className="mt-4 rounded-[1rem] border border-[#E4EDF6] bg-[#FFF5F8] px-4 py-3 text-sm font-semibold text-[#D02752]">
              {message}
            </p>
          )}
        </div>
        <div className="dashboard-filter-grid border-b border-[#F6D6DE] p-5">
          <input
            className="auth-input"
            placeholder="Filter blood type"
            value={matchFilter.bloodType}
            onChange={(e) => setMatchFilter({ ...matchFilter, bloodType: e.target.value })}
          />
          <input
            className="auth-input"
            placeholder="Filter location"
            value={matchFilter.location}
            onChange={(e) => setMatchFilter({ ...matchFilter, location: e.target.value })}
          />
          <select
            className="auth-input"
            value={matchFilter.urgency}
            onChange={(e) => setMatchFilter({ ...matchFilter, urgency: e.target.value })}
          >
            <option value="">All urgency</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
          <input
            className="auth-input"
            placeholder="Search hospital or contact"
            value={matchFilter.search}
            onChange={(e) => setMatchFilter({ ...matchFilter, search: e.target.value })}
          />
          <button className="btn-secondary lg:h-[3.3rem]" onClick={() => load(true)} disabled={isRefreshing}>
            {isRefreshing ? <span className="loading-spinner" /> : "Search"}
          </button>
        </div>
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {matches.map((req, index) => (
            <article key={req.id} className="android-list-item animate-card-in p-5" style={{ animationDelay: `${index * 45}ms` }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-[#8A244B]">
                    {req.blood_type}
                    <span className="ml-2 text-base font-bold text-[#8A244B]">
                      {req.units} units
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#8A244B]">
                    {req.hospital || "Hospital not set"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${urgencyStyles[req.urgency] ?? urgencyStyles.normal}`}>
                  {req.urgency}
                </span>
              </div>
              <div className="mt-4 grid gap-2 border-t border-[#F8DDE4] pt-4 text-sm text-[#8A244B] sm:grid-cols-2">
                <p>
                  <span className="font-bold text-[#8A244B]">Location:</span>{" "}
                  {req.location || "Not provided"}
                </p>
                <p>
                  <span className="font-bold text-[#8A244B]">Status:</span>{" "}
                  {statusLabels[req.status] ?? req.status}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-bold text-[#8A244B]">Contact:</span>{" "}
                  {req.contact || "Not provided"}
                </p>
              </div>
              <button
                className="auth-button mt-5 w-full"
                onClick={() => acceptRequest(req.id)}
                disabled={!profile.availability || acceptingId === req.id}
              >
                {acceptingId === req.id ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="loading-spinner" />
                    Accepting
                  </span>
                ) : profile.availability ? "Accept Request" : "Mark Available to Accept"}
              </button>
            </article>
          ))}
          {matches.length === 0 && (
            <p className="rounded-[1.25rem] border border-dashed border-[#F1CAD5] bg-[#FFF5F8] p-5 text-sm text-[#8A244B] lg:col-span-2">
              No open matching requests found for your blood type and location.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
