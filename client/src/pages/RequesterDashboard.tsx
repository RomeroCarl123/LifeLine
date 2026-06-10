import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { DEFAULT_LOCATION } from "../constants/location";

type Props = { token: string };

const urgencyStyles: Record<string, string> = {
  normal: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  urgent: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  critical: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  in_progress: "In progress",
  completed: "Completed",
};

export default function RequesterDashboard({ token }: Props) {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState({
    bloodType: "",
    location: "",
    urgency: "",
    search: "",
  });

  const [form, setForm] = useState({
    bloodType: "O+",
    units: 1,
    urgency: "normal",
    location: DEFAULT_LOCATION,
    hospital: "",
    contact: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSearchingDonors, setIsSearchingDonors] = useState(false);

  const [donorSearch, setDonorSearch] = useState({
    bloodType: "O+",
    location: DEFAULT_LOCATION,
    search: "",
    availableOnly: true,
  });

  const [donors, setDonors] = useState<any[]>([]);

  const criticalRequests = useMemo(
    () => requests.filter((r) => r.urgency === "critical").length,
    [requests],
  );
  const requestsWithLocation = useMemo(
    () => requests.filter((r) => r.location).length,
    [requests],
  );
  const activeRequests = useMemo(
    () => requests.filter((r) => r.status !== "completed"),
    [requests],
  );
  const requestHistory = useMemo(
    () => requests.filter((r) => r.status === "completed"),
    [requests],
  );
  const availableDonorResults = useMemo(
    () => donors.filter((d) => d.availability).length,
    [donors],
  );
  const requesterLocation = useMemo(
    () => donorSearch.location || DEFAULT_LOCATION,
    [donorSearch.location],
  );
  const nearbyDonors = useMemo(
    () => donors.filter((donor) => donor.availability).slice(0, 4),
    [donors],
  );

  const load = async (showFiltering = false) => {
    if (showFiltering) setIsFiltering(true);
    try {
      const params = new URLSearchParams();
      if (filter.bloodType) params.set("bloodType", filter.bloodType);
      if (filter.location) params.set("location", filter.location);
      if (filter.urgency) params.set("urgency", filter.urgency);
      if (filter.search) params.set("search", filter.search);

      const data = await api<any[]>(
        `/requests?${params.toString()}`,
        {},
        token,
      );
      setRequests(data);
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api(
        "/requests",
        {
          method: "POST",
          body: JSON.stringify({ ...form, units: Number(form.units) }),
        },
        token,
      );
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
      params.set("location", requesterLocation);
      if (donorSearch.search) params.set("search", donorSearch.search);
      params.set("availableOnly", String(donorSearch.availableOnly));

      const result = await api<any[]>(
        `/requests/donors/search?${params.toString()}`,
        {},
        token,
      );
      setDonors(result);
    } finally {
      setIsSearchingDonors(false);
    }
  };

  const card = "rounded-2xl border border-[var(--ll-line)] bg-white";

  const inputCls =
    "w-full rounded-lg border border-[var(--ll-line)] bg-white px-3 py-2.5 text-sm text-[var(--ll-ink)] placeholder:text-[var(--ll-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ll-accent)]/30 focus:border-[var(--ll-accent)]";
  const labelCls =
    "text-xs font-medium uppercase tracking-wider text-[var(--ll-muted)]";
  const eyebrow =
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ll-accent)]";

  return (
    <section
      className="space-y-8 text-[var(--ll-ink)]"
      style={{ fontFamily: "Epilogue, Urbanist, ui-sans-serif" }}
    >
      {/* SPLIT HERO */}
      <div className={`${card} overflow-hidden`}>
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — dark stats panel */}
          <div className="bg-[var(--ll-ink)] text-white p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--ll-accent)] animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                Live operations
              </span>
            </div>

            <h2
              className="text-3xl sm:text-4xl font-semibold leading-[1.05] tracking-tight"
              style={{ fontFamily: "Urbanist" }}
            >
              Coordinate every
              <br />
              request from one queue.
            </h2>

            <p className="text-sm text-white/70 max-w-md leading-relaxed">
              Create requests, match donors nearby, and track every case to
              resolution.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <Stat dark label="Open" value={requests.length} />
              <Stat dark label="Critical" value={criticalRequests} accent />
              <Stat dark label="Geotagged" value={requestsWithLocation} />
            </div>
          </div>

          {/* Right — create request */}
          <form
            onSubmit={create}
            className="p-8 sm:p-10 space-y-6 bg-[var(--ll-bg)]"
          >
            <div>
              <p className={eyebrow}>01 — New request</p>
              <h3
                className="mt-2 text-2xl font-semibold tracking-tight"
                style={{ fontFamily: "Urbanist" }}
              >
                Log it once. Match it fast.
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Blood type">
                <input
                  className={inputCls}
                  placeholder="O+"
                  value={form.bloodType}
                  onChange={(e) =>
                    setForm({ ...form, bloodType: e.target.value })
                  }
                />
              </Field>

              <Field label="Units">
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  value={form.units}
                  onChange={(e) =>
                    setForm({ ...form, units: Number(e.target.value) })
                  }
                />
              </Field>

              <Field label="Urgency">
                <select
                  className={inputCls}
                  value={form.urgency}
                  onChange={(e) =>
                    setForm({ ...form, urgency: e.target.value })
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </Field>

              <Field label="Contact">
                <input
                  className={inputCls}
                  placeholder="Phone or email"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                />
              </Field>

              <Field label="Hospital" full>
                <input
                  className={inputCls}
                  placeholder="Hospital name"
                  value={form.hospital}
                  onChange={(e) =>
                    setForm({ ...form, hospital: e.target.value })
                  }
                />
              </Field>

              <Field label="Location" full>
                <input
                  className={inputCls}
                  placeholder="City, district, or area"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </Field>
            </div>

            <button
              disabled={isCreating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ll-accent)] px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-60"
            >
              {isCreating ? (
                <>
                  <Spinner /> Creating…
                </>
              ) : (
                "Create request →"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* DONOR SEARCH */}
      <section className={`${card} overflow-hidden`}>
        <header className="flex flex-wrap items-end justify-between gap-4 px-6 sm:px-8 py-6 border-b border-[var(--ll-line)]">
          <div>
            <p className={eyebrow}>02 — Donor search</p>
            <h3
              className="mt-2 text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "Urbanist" }}
            >
              Match nearby donors in seconds.
            </h3>
          </div>

          <button
            onClick={searchDonors}
            disabled={isSearchingDonors}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--ll-line)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--ll-surface)] transition"
          >
            {isSearchingDonors ? (
              <>
                <Spinner dark /> Searching…
              </>
            ) : (
              "Refresh search"
            )}
          </button>
        </header>

        <div className="bg-[var(--ll-surface)] p-6 sm:p-8">
          <div className="overflow-hidden rounded-xl border border-[var(--ll-line)] bg-white">
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--ll-line)]">
              <p className="text-sm font-medium">Nearby donor data</p>
              <div className="flex gap-2">
                <Chip>{requesterLocation || "No requester area yet"}</Chip>
                <Chip>
                  {donorSearch.availableOnly ? "Available only" : "All donors"}
                </Chip>
              </div>
            </div>
            <div className="grid gap-px bg-[var(--ll-line)] md:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-white p-5 sm:p-6">
                <p className={eyebrow}>Requester area</p>
                <h4
                  className="mt-2 text-2xl font-semibold tracking-tight"
                  style={{ fontFamily: "Urbanist" }}
                >
                  {requesterLocation || "Add a request location"}
                </h4>
                <p className="mt-3 text-sm leading-6 text-[var(--ll-muted)]">
                  Donor matches are filtered by Valencia City, Bukidnon, then
                  by blood type and availability.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <MiniStat label="Matches" value={donors.length} />
                  <MiniStat label="Available" value={availableDonorResults} accent />
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6">
                <p className={eyebrow}>Closest matches</p>
                <div className="mt-4 space-y-3">
                  {nearbyDonors.map((donor) => (
                    <div
                      key={donor.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ll-line)] bg-[var(--ll-bg)] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{donor.name}</p>
                        <p className="text-xs text-[var(--ll-muted)]">
                          {donor.location || "No location"} - {donor.email}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                        {donor.blood_type}
                      </span>
                    </div>
                  ))}

                  {nearbyDonors.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[var(--ll-line)] bg-[var(--ll-bg)] p-5 text-sm text-[var(--ll-muted)]">
                      Run a donor search to show available donors near the requester location.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 border-b border-t border-[var(--ll-line)]">
          <StripStat label="Total matches" value={donors.length} />
          <StripStat
            label="Available now"
            value={availableDonorResults}
            accent
          />
          <StripStat
            label="Search area"
            value={requesterLocation || "—"}
            text
          />
        </div>

        <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[320px_1fr]">
          <aside className={`${card} p-5 space-y-5 h-fit bg-[var(--ll-bg)]`}>
            <p className={eyebrow}>Filters</p>

            <Field label="Blood type">
              <input
                className={inputCls}
                value={donorSearch.bloodType}
                onChange={(e) =>
                  setDonorSearch({ ...donorSearch, bloodType: e.target.value })
                }
              />
            </Field>

            <Field label="Search area">
              <input
                className={`${inputCls} bg-[var(--ll-surface)]`}
                value={requesterLocation}
                readOnly
              />
            </Field>

            <Field label="Keyword">
              <input
                className={inputCls}
                placeholder="Name, email, location"
                value={donorSearch.search}
                onChange={(e) =>
                  setDonorSearch({ ...donorSearch, search: e.target.value })
                }
              />
            </Field>

            <div>
              <p className={labelCls}>Availability</p>
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-[var(--ll-surface)] p-1">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() =>
                      setDonorSearch({ ...donorSearch, availableOnly: v })
                    }
                    className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                      donorSearch.availableOnly === v
                        ? "bg-white text-[var(--ll-ink)] shadow-sm"
                        : "text-[var(--ll-muted)]"
                    }`}
                  >
                    {v ? "Available" : "All donors"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={searchDonors}
              disabled={isSearchingDonors}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ll-ink)] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-60"
            >
              {isSearchingDonors ? (
                <>
                  <Spinner /> Running…
                </>
              ) : (
                "Search donors"
              )}
            </button>
          </aside>

          <div className="space-y-3">
            {donors.map((d, i) => (
              <article
                key={d.id}
                className={`${card} grid gap-4 px-5 py-4 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center hover:border-[var(--ll-ink)]/20 transition`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div>
                  <p className="text-base font-semibold">{d.name}</p>
                  <p className="text-sm text-[var(--ll-muted)]">{d.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={labelCls}>Type</p>
                    <p className="mt-0.5 font-medium">{d.blood_type}</p>
                  </div>
                  <div>
                    <p className={labelCls}>Location</p>
                    <p className="mt-0.5 font-medium">{d.location || "—"}</p>
                  </div>
                </div>

                <span
                  className={`justify-self-start lg:justify-self-end rounded-full px-3 py-1 text-xs font-medium ${
                    d.availability
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {d.availability ? "● Available" : "Unavailable"}
                </span>
              </article>
            ))}

            {donors.length === 0 && (
              <div className={`${card} border-dashed p-8 text-center`}>
                <p className="text-sm text-[var(--ll-muted)]">
                  No matches yet. Run a search to see donors here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REQUEST CENTER */}
      <section className={`${card} overflow-hidden`}>
        <header className="flex flex-wrap items-end justify-between gap-4 px-6 sm:px-8 py-6 border-b border-[var(--ll-line)]">
          <div>
            <p className={eyebrow}>03 — Request center</p>
            <h3
              className="mt-2 text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "Urbanist" }}
            >
              Active queue and history.
            </h3>
          </div>

          <button
            onClick={() => load(true)}
            disabled={isFiltering}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--ll-line)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--ll-surface)] transition"
          >
            {isFiltering ? (
              <>
                <Spinner dark /> Applying…
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </header>

        <div className="grid gap-4 border-b border-[var(--ll-line)] bg-[var(--ll-bg)] p-6 sm:p-8 lg:grid-cols-4">
          <Field label="Blood type">
            <input
              className={inputCls}
              value={filter.bloodType}
              onChange={(e) =>
                setFilter({ ...filter, bloodType: e.target.value })
              }
            />
          </Field>
          <Field label="Location">
            <input
              className={inputCls}
              value={filter.location}
              onChange={(e) =>
                setFilter({ ...filter, location: e.target.value })
              }
            />
          </Field>
          <Field label="Urgency">
            <select
              className={inputCls}
              value={filter.urgency}
              onChange={(e) =>
                setFilter({ ...filter, urgency: e.target.value })
              }
            >
              <option value="">All</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Search">
            <input
              className={inputCls}
              placeholder="Hospital or keyword"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Active */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--ll-muted)]">
                {activeRequests.length} active request
                {activeRequests.length === 1 ? "" : "s"}
              </p>
            </div>

            {isLoading && (
              <>
                {[0, 1].map((i) => (
                  <div key={i} className={`${card} p-6 animate-pulse h-32`} />
                ))}
              </>
            )}

            {!isLoading &&
              activeRequests.map((req) => (
                <article
                  key={req.id}
                  className={`${card} hover:border-[var(--ll-ink)]/20 transition`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4 border-b border-[var(--ll-line)]">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--ll-muted)]">
                        #{req.id}
                      </p>
                      <p
                        className="mt-1 text-2xl font-semibold tracking-tight"
                        style={{ fontFamily: "Urbanist" }}
                      >
                        {req.blood_type}{" "}
                        <span className="text-base font-normal text-[var(--ll-muted)]">
                          · {req.units} units
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-[var(--ll-muted)]">
                        {req.hospital || "Hospital not set"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          urgencyStyles[req.urgency] ?? urgencyStyles.normal
                        }`}
                      >
                        {req.urgency}
                      </span>
                      <Chip>{statusLabels[req.status] ?? req.status}</Chip>
                    </div>
                  </div>

                  <div className="grid gap-px bg-[var(--ll-line)] sm:grid-cols-3">
                    <MetaCell label="Location" value={req.location || "—"} />
                    <MetaCell label="Contact" value={req.contact || "—"} />
                    <MetaCell
                      label="Stage"
                      value={statusLabels[req.status] ?? req.status}
                    />
                  </div>
                </article>
              ))}

            {!isLoading && activeRequests.length === 0 && (
              <div
                className={`${card} border-dashed p-8 text-center text-sm text-[var(--ll-muted)]`}
              >
                No active requests match these filters.
              </div>
            )}
          </div>

          {/* History timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--ll-muted)]">
                History · {requestHistory.length} completed
              </p>
            </div>

            <div className={`${card} p-5 bg-[var(--ll-bg)]`}>
              <ol className="space-y-5">
                {!isLoading &&
                  requestHistory.map((req, i) => (
                    <li key={req.id} className="relative pl-7">
                      {i !== requestHistory.length - 1 && (
                        <span className="absolute left-[9px] top-5 h-[calc(100%+1.25rem)] w-px bg-[var(--ll-line)]" />
                      )}
                      <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-white ring-2 ring-[var(--ll-accent)]" />
                      <p className="text-sm font-medium">
                        Request #{req.id} completed
                      </p>
                      <p className="text-xs text-[var(--ll-muted)] mt-0.5">
                        {req.hospital || "Hospital not set"} · {req.blood_type}{" "}
                        · {req.units} units
                      </p>
                      <p className="text-xs text-[var(--ll-muted)]">
                        {req.location || "No location"}
                      </p>
                    </li>
                  ))}

                {!isLoading && requestHistory.length === 0 && (
                  <p className="text-sm text-[var(--ll-muted)]">
                    No completed requests yet.
                  </p>
                )}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

/* ---------- tiny primitives ---------- */
function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      {" "}
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--ll-muted)]">
        {label}
      </span>{" "}
      {children}{" "}
    </label>
  );
}

function Stat({
  label,
  value,
  dark,
  accent,
}: {
  label: string;
  value: number;
  dark?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-xs uppercase tracking-wider ${dark ? "text-white/50" : "text-[var(--ll-muted)]"}`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-3xl font-semibold tracking-tight ${accent ? "text-[var(--ll-accent)]" : ""}`}
        style={{ fontFamily: "Urbanist" }}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--ll-line)] bg-[var(--ll-bg)] px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-[var(--ll-muted)]">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold tracking-tight ${
          accent ? "text-[var(--ll-accent)]" : ""
        }`}
        style={{ fontFamily: "Urbanist" }}
      >
        {value}
      </p>
    </div>
  );
}

function StripStat({
  label,
  value,
  accent,
  text,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  text?: boolean;
}) {
  return (
    <div className="px-6 py-5 border-r border-[var(--ll-line)] last:border-r-0">
      <p className="text-xs uppercase tracking-wider text-[var(--ll-muted)]">
        {label}
      </p>
      <p
        className={`mt-1 ${
          text
            ? "text-base font-medium truncate"
            : "text-3xl font-semibold tracking-tight"
        } ${accent ? "text-[var(--ll-accent)]" : ""}`}
        style={{ fontFamily: "Urbanist" }}
      >
        {value}
      </p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--ll-surface)] px-3 py-1 text-xs font-medium text-[var(--ll-ink)]">
      {children}
    </span>
  );
}

function MetaCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white px-5 py-3">
      <p className="text-xs uppercase tracking-wider text-[var(--ll-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <span
      className={`h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin ${
        dark ? "text-[var(--ll-ink)]" : "text-white"
      }`}
    />
  );
}
