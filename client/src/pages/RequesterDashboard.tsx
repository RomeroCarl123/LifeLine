import { FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import LocationMap from "../components/LocationMap";

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

export default function RequesterDashboard({ token }: Props) {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState({ bloodType: "", location: "", urgency: "", search: "" });
  const [form, setForm] = useState({ bloodType: "O+", units: 1, urgency: "normal", location: "", hospital: "", contact: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSearchingDonors, setIsSearchingDonors] = useState(false);
  const [donorSearch, setDonorSearch] = useState({
    bloodType: "O+",
    location: "",
    search: "",
    availableOnly: true,
  });
  const [donors, setDonors] = useState<any[]>([]);

  const criticalRequests = requests.filter((req) => req.urgency === "critical").length;
  const requestsWithLocation = requests.filter((req) => req.location).length;
  const activeRequests = requests.filter((req) => req.status !== "completed");
  const requestHistory = requests.filter((req) => req.status === "completed");
  const availableDonorResults = donors.filter((donor) => donor.availability).length;

  const load = async (showFiltering = false) => {
    if (showFiltering) setIsFiltering(true);
    try {
      const params = new URLSearchParams();
      if (filter.bloodType) params.set("bloodType", filter.bloodType);
      if (filter.location) params.set("location", filter.location);
      if (filter.urgency) params.set("urgency", filter.urgency);
      if (filter.search) params.set("search", filter.search);
      const data = await api<any[]>(`/requests?${params.toString()}`, {}, token);
      setRequests(data);
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api("/requests", {
        method: "POST",
        body: JSON.stringify({ ...form, units: Number(form.units) }),
      }, token);
      await load();
    } finally {
      setIsCreating(false);
    }
  };

  const searchDonors = async () => {
    setIsSearchingDonors(true);
    try {
      const params = new URLSearchParams();
      if (donorSearch.bloodType) params.set("bloodType", donorSearch.bloodType);
      if (donorSearch.location) params.set("location", donorSearch.location);
      if (donorSearch.search) params.set("search", donorSearch.search);
      params.set("availableOnly", String(donorSearch.availableOnly));
      const result = await api<any[]>(`/requests/donors/search?${params.toString()}`, {}, token);
      setDonors(result);
    } finally {
      setIsSearchingDonors(false);
    }
  };

  return (
    <section className="animate-page-in space-y-6">
      <div className="dashboard-hero overflow-hidden">
        <div className="grid gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#D02752]">
              Request Operations
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-[#8A244B] sm:text-4xl">
              Simple request and donor workflow
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#8A244B]">
              Create requests, search donors, and track progress from one cleaner page.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="dashboard-stat p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D02752]">
                Active Queue
              </p>
              <p className="mt-2 text-4xl font-black text-[#8A244B]">{requests.length}</p>
            </div>
            <div className="dashboard-stat p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D02752]">
                Critical
              </p>
              <p className="mt-2 text-4xl font-black text-[#8A244B]">{criticalRequests}</p>
            </div>
            <div className="dashboard-stat p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D02752]">
                With Location
              </p>
              <p className="mt-2 text-4xl font-black text-[#8A244B]">{requestsWithLocation}</p>
            </div>
          </div>
        </div>
          <div className="border-t border-[#F6D6DE] bg-[linear-gradient(180deg,rgba(255,245,248,0.92),rgba(255,255,255,0.6))] px-6 py-4 sm:px-8">
            <div className="flex flex-wrap gap-2">
            <span className="android-chip px-3 py-1 text-xs uppercase tracking-[0.16em]">
              Minimal Mode
            </span>
            <span className="android-chip px-3 py-1 text-xs uppercase tracking-[0.16em]">
              Donor Search Ready
            </span>
            <span className="android-chip px-3 py-1 text-xs uppercase tracking-[0.16em]">
              Live Queue View
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <form onSubmit={create} className="dashboard-section animate-card-in p-6 sm:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#D02752]">
                New Request
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#8A244B]">
                Capture the request clearly.
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[#8A244B]">
                Add the essentials once, keep the details readable, and make the
                request easy to match.
              </p>
            </div>
            <button className="auth-button w-full sm:w-auto" disabled={isCreating}>
              {isCreating ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="loading-spinner" />
                  Creating
                </span>
              ) : "Create Request"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Blood Type
              </span>
              <input className="auth-input" placeholder="O+" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Units
              </span>
              <input className="auth-input" type="number" min="1" placeholder="1" value={form.units} onChange={(e) => setForm({ ...form, units: Number(e.target.value) })} />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Urgency
              </span>
              <select className="auth-input" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Contact
              </span>
              <input className="auth-input" placeholder="Phone or email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Hospital
              </span>
              <input className="auth-input" placeholder="Hospital name" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Location
              </span>
              <input className="auth-input" placeholder="City, district, or area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
          </div>
        </form>

        <section className="dashboard-section animate-card-in overflow-hidden">
          <div className="dashboard-section-header px-6 py-6 sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#D02752]">
                  Donor Search
                </p>
                <h3 className="mt-2 text-2xl font-black text-[#8A244B]">
                  A full search workspace for matching nearby donors.
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#8A244B]">
                  Filters stay together on the left, the map stays visible, and the results board becomes easier to scan.
                </p>
              </div>
              <button className="btn-secondary w-full sm:w-auto" onClick={searchDonors} disabled={isSearchingDonors}>
                {isSearchingDonors ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="loading-spinner" />
                    Searching
                  </span>
                ) : "Refresh Donor Search"}
              </button>
            </div>
          </div>

          <div className="border-b border-[#F6D6DE] bg-[#FFF8FA] px-6 py-6 sm:px-7">
            <div className="overflow-hidden rounded-[1.8rem] border border-[#F1CAD5] bg-white shadow-[0_18px_34px_-24px_rgba(138,36,75,0.14)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F6D6DE] px-5 py-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D02752]">
                    Live Map Stage
                  </p>
                  <h4 className="mt-1 text-lg font-black text-[#8A244B]">
                    Full-width donor map
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="android-chip px-3 py-1 text-xs uppercase tracking-[0.14em]">
                    {donorSearch.location || "No area selected"}
                  </span>
                  <span className="android-chip px-3 py-1 text-xs uppercase tracking-[0.14em]">
                    {donorSearch.availableOnly ? "Available only" : "All donors"}
                  </span>
                </div>
              </div>
              <div className="min-h-[440px]">
                <LocationMap location={donorSearch.location} />
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-b border-[#F6D6DE] bg-[#FFF5F8] px-6 py-5 sm:grid-cols-3 sm:px-7">
            <div className="rounded-[1.3rem] bg-white px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                Total Matches
              </p>
              <p className="mt-2 text-3xl font-black text-[#8A244B]">{donors.length}</p>
            </div>
            <div className="rounded-[1.3rem] bg-white px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                Available Now
              </p>
              <p className="mt-2 text-3xl font-black text-[#8A244B]">{availableDonorResults}</p>
            </div>
            <div className="rounded-[1.3rem] bg-white px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                Search Area
              </p>
              <p className="mt-2 text-sm font-black text-[#8A244B]">
                {donorSearch.location || "No area selected"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[0.74fr_1.26fr] sm:p-7">
            <aside className="space-y-5">
              <div className="android-tonal-surface rounded-[1.6rem] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D02752]">
                      Filter Rail
                    </p>
                    <h4 className="mt-2 text-lg font-black text-[#8A244B]">
                      Build the donor match
                    </h4>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#8A244B]">
                    Search kit
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.35rem] bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                      Match Target
                    </p>
                    <label className="mt-3 block space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                        Blood Type
                      </span>
                      <input
                        className="auth-input"
                        placeholder="O+"
                        value={donorSearch.bloodType}
                        onChange={(e) => setDonorSearch({ ...donorSearch, bloodType: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="rounded-[1.35rem] bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                      Search Radius
                    </p>
                    <label className="mt-3 block space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                        Search Area
                      </span>
                      <input
                        className="auth-input"
                        placeholder="City, district, or hospital area"
                        value={donorSearch.location}
                        onChange={(e) => setDonorSearch({ ...donorSearch, location: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="rounded-[1.35rem] bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                      Refine Search
                    </p>
                    <label className="mt-3 block space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                        Keyword Search
                      </span>
                      <input
                        className="auth-input"
                        placeholder="Name, email, or location"
                        value={donorSearch.search}
                        onChange={(e) => setDonorSearch({ ...donorSearch, search: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.35rem] border border-[#F1CAD5] bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                    Availability Mode
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-[1.1rem] bg-[#FFF5F8] p-1.5">
                    <button
                      type="button"
                      onClick={() => setDonorSearch({ ...donorSearch, availableOnly: true })}
                      className={`rounded-[0.9rem] px-3 py-2 text-xs font-bold transition ${
                        donorSearch.availableOnly
                          ? "bg-[#F63049] text-white"
                          : "text-[#8A244B]"
                      }`}
                    >
                      Available Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonorSearch({ ...donorSearch, availableOnly: false })}
                      className={`rounded-[0.9rem] px-3 py-2 text-xs font-bold transition ${
                        !donorSearch.availableOnly
                          ? "bg-[#F63049] text-white"
                          : "text-[#8A244B]"
                      }`}
                    >
                      All Donors
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.2rem] bg-white px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                      Mode
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#8A244B]">
                      {donorSearch.availableOnly ? "Urgent-ready search" : "Wider donor lookup"}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] bg-white px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                      Focus
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#8A244B]">
                      {donorSearch.search || donorSearch.location || "No filter emphasis yet"}
                    </p>
                  </div>
                </div>

                <button type="button" className="auth-button mt-5 w-full" onClick={searchDonors} disabled={isSearchingDonors}>
                  {isSearchingDonors ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="loading-spinner" />
                      Running Search
                    </span>
                  ) : "Search Donors"}
                </button>
              </div>
            </aside>

            <div className="space-y-5">
              <div className="android-tonal-surface rounded-[1.6rem] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D02752]">
                      Results Board
                    </p>
                    <h4 className="mt-1 text-xl font-black text-[#8A244B]">
                      Nearby donor matches
                    </h4>
                    <p className="mt-2 text-sm leading-7 text-[#8A244B]">
                      Review matches in a denser list with status, blood type, and location visible at a glance.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="android-chip px-3 py-1 text-xs uppercase tracking-[0.14em]">
                      {donors.length === 0 ? "No results" : `${donors.length} matches`}
                    </span>
                    <span className="android-chip px-3 py-1 text-xs uppercase tracking-[0.14em]">
                      {donorSearch.bloodType || "Any blood type"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {donors.map((donor, index) => (
                  <article
                    key={donor.id}
                    className="android-list-item animate-card-in overflow-hidden p-0"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                      <div>
                        <p className="text-lg font-black text-[#8A244B]">{donor.name}</p>
                        <p className="mt-1 text-sm text-[#8A244B]">{donor.email}</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                            Blood Type
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#8A244B]">{donor.blood_type}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                            Location
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#8A244B]">
                            {donor.location || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <span className="rounded-full bg-[#FFF1F5] px-3 py-1 text-sm font-bold text-[#8A244B]">
                          {donor.availability ? "Available" : "Unavailable"}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#8A244B]">
                          Search result
                        </span>
                      </div>
                    </div>
                  </article>
                ))}

                {donors.length === 0 && (
                  <div className="rounded-[1.6rem] border border-dashed border-[#F1CAD5] bg-[#FFF5F8] p-6">
                    <p className="text-sm font-semibold text-[#8A244B]">
                      The results board is empty.
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#8A244B]">
                      Set the blood type, pick a search area, and run the donor search to load nearby matches here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-section animate-card-in overflow-hidden">
        <div className="dashboard-section-header px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#D02752]">
                Request Center
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#8A244B]">
                Redesigned request list and history
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#8A244B]">
                Keep active cases up front, and move completed requests into a cleaner history feed.
              </p>
            </div>
            <button className="btn-secondary w-full sm:w-auto" onClick={() => load(true)} disabled={isFiltering}>
              {isFiltering ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loading-spinner" />
                  Applying
                </span>
              ) : "Refresh Requests"}
            </button>
          </div>
        </div>

        <div className="border-b border-[#F6D6DE] bg-[#FFF5F8] px-5 py-5 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_0.9fr_1.2fr]">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Blood Type
              </span>
              <input className="auth-input" placeholder="Filter blood type" value={filter.bloodType} onChange={(e) => setFilter({ ...filter, bloodType: e.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Location
              </span>
              <input className="auth-input" placeholder="Filter location" value={filter.location} onChange={(e) => setFilter({ ...filter, location: e.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Urgency
              </span>
              <select className="auth-input" value={filter.urgency} onChange={(e) => setFilter({ ...filter, urgency: e.target.value })}>
                <option value="">All urgency</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                Search
              </span>
              <input className="auth-input" placeholder="Search hospital or request" value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
            </label>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D02752]">
                  Active Request List
                </p>
                <h4 className="mt-1 text-xl font-black text-[#8A244B]">
                  {activeRequests.length} open request{activeRequests.length === 1 ? "" : "s"}
                </h4>
              </div>
              <span className="rounded-full bg-[#FFF1F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8A244B]">
                Live Queue
              </span>
            </div>

            {isLoading && (
              <>
                <div className="panel rounded-[1.5rem] p-6">
                  <div className="skeleton-line h-7 w-1/2" />
                  <div className="skeleton-line mt-4 h-4 w-2/3" />
                  <div className="skeleton-line mt-6 h-16" />
                </div>
                <div className="panel rounded-[1.5rem] p-6">
                  <div className="skeleton-line h-7 w-1/2" />
                  <div className="skeleton-line mt-4 h-4 w-2/3" />
                  <div className="skeleton-line mt-6 h-16" />
                </div>
              </>
            )}

            {!isLoading && activeRequests.map((req, index) => (
              <article
                key={req.id}
                className="android-list-item animate-card-in overflow-hidden p-0"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F8DDE4] px-5 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D02752]">
                      Request #{req.id}
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#8A244B]">
                      {req.blood_type}
                      <span className="ml-2 text-base font-bold text-[#8A244B]">
                        {req.units} units
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#8A244B]">
                      {req.hospital || "Hospital not set"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${urgencyStyles[req.urgency] ?? urgencyStyles.normal}`}>
                      {req.urgency}
                    </span>
                    <span className="rounded-full bg-[#FFF1F5] px-3 py-1.5 text-xs font-bold text-[#8A244B]">
                      {statusLabels[req.status] ?? req.status}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 px-5 py-4 text-sm text-[#8A244B] sm:grid-cols-3">
                  <div className="rounded-[1rem] bg-[#FFF5F8] px-4 py-3">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                      Location
                    </span>
                    <span className="mt-1 block font-semibold text-[#8A244B]">
                      {req.location || "Not provided"}
                    </span>
                  </div>
                  <div className="rounded-[1rem] bg-[#FFF5F8] px-4 py-3">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                      Contact
                    </span>
                    <span className="mt-1 block font-semibold text-[#8A244B]">
                      {req.contact || "Not provided"}
                    </span>
                  </div>
                  <div className="rounded-[1rem] bg-[#FFF5F8] px-4 py-3">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D02752]">
                      Stage
                    </span>
                    <span className="mt-1 block font-semibold text-[#8A244B]">
                      {statusLabels[req.status] ?? req.status}
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {!isLoading && activeRequests.length === 0 && (
              <p className="rounded-[1.5rem] border border-dashed border-[#F1CAD5] bg-[#FFF5F8] p-6 text-sm text-[#8A244B]">
                No active requests found with the current filters.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D02752]">
                  Request History
                </p>
                <h4 className="mt-1 text-xl font-black text-[#8A244B]">
                  Completed timeline
                </h4>
              </div>
              <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#D02752]">
                {requestHistory.length} archived
              </span>
            </div>

            <div className="panel rounded-[1.6rem] p-4 sm:p-5">
              <div className="space-y-4">
                {!isLoading && requestHistory.map((req, index) => (
                  <div key={req.id} className="relative pl-8">
                    {index !== requestHistory.length - 1 && (
                      <span className="absolute left-[11px] top-8 h-[calc(100%+0.75rem)] w-px bg-[#F1CAD5]" />
                    )}
                    <span className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-[#F63049] shadow-[0_0_0_6px_rgba(47,108,71,0.12)]" />
                    <article className="rounded-[1.35rem] bg-[#FFF5F8] px-4 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-[#8A244B]">
                            Request #{req.id} completed
                          </p>
                          <p className="mt-1 text-sm text-[#8A244B]">
                            {req.hospital || "Hospital not set"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#8A244B]">
                          {req.blood_type} · {req.units} units
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#D02752]">
                        <span className="rounded-full bg-white px-3 py-1">
                          {req.location || "No location"}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          {statusLabels[req.status] ?? req.status}
                        </span>
                      </div>
                    </article>
                  </div>
                ))}

                {!isLoading && requestHistory.length === 0 && (
                  <p className="rounded-[1.35rem] border border-dashed border-[#F1CAD5] bg-white px-4 py-5 text-sm text-[#8A244B]">
                    No completed requests yet. Finished requests will appear here as history.
                  </p>
                )}

                {isLoading && (
                  <>
                    <div className="rounded-[1.35rem] bg-[#FFF5F8] px-4 py-5">
                      <div className="skeleton-line h-4 w-1/2" />
                      <div className="skeleton-line mt-3 h-3 w-2/3" />
                    </div>
                    <div className="rounded-[1.35rem] bg-[#FFF5F8] px-4 py-5">
                      <div className="skeleton-line h-4 w-1/2" />
                      <div className="skeleton-line mt-3 h-3 w-2/3" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
