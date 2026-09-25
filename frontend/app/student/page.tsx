"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashShell, { DashTab } from "@/components/DashShell";
import {
  StatCard,
  StatusChip,
  ProgressBar,
  EmptyState,
  MiniBars,
  Panel,
  APP_STATUS_META,
} from "@/components/DashKit";
import { api, Application, Course, Ticket, University } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { money } from "@/lib/format";

const TABS: DashTab[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "applications", label: "My Applications", icon: "📚" },
  { id: "apply", label: "New Application", icon: "➕" },
  { id: "support", label: "Support", icon: "🛟" },
];

const JOURNEY = ["submitted", "documents", "reviewing", "offer", "visa", "enrolled"];

interface AppDetail extends Omit<Application, "documents" | "timeline"> {
  documents: { id: number; kind: string; status: string }[];
  timeline: { id: number; label: string; detail?: string; created_at: string }[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [apps, setApps] = useState<Application[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openApp, setOpenApp] = useState<AppDetail | null>(null);

  // Apply form
  const [unis, setUnis] = useState<University[]>([]);
  const [uniId, setUniId] = useState<number | "">("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [applyBusy, setApplyBusy] = useState(false);
  const [applyMsg, setApplyMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [a, t] = await Promise.all([api.get<Application[]>("/applications"), api.get<Ticket[]>("/tickets")]);
      setApps(a);
      setTickets(t);
    } catch {
      /* handled by guard */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "student") load();
  }, [user, load]);

  useEffect(() => {
    api.get<University[]>("/universities?limit=200").then(setUnis).catch(() => {});
  }, []);

  useEffect(() => {
    setCourseId("");
    const uni = unis.find((u) => u.id === uniId);
    if (uni) {
      api
        .get<Course[]>(`/universities/${uni.slug}/courses`)
        .then(setCourses)
        .catch(() => setCourses([]));
    } else {
      setCourses([]);
    }
  }, [uniId, unis]);

  async function openDetail(app: Application) {
    if (openApp?.id === app.id) {
      setOpenApp(null);
      return;
    }
    try {
      setOpenApp(await api.get<AppDetail>(`/applications/${app.id}`));
    } catch {
      setOpenApp(null);
    }
  }

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!uniId || !courseId) return;
    setApplyBusy(true);
    setApplyMsg(null);
    try {
      await api.post("/applications", { university_id: uniId, course_id: courseId, notes: notes || undefined });
      setUniId("");
      setNotes("");
      setApplyMsg("🎉 Application submitted! Your counselor will review it shortly.");
      await load();
      setTab("applications");
    } catch (err) {
      setApplyMsg(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setApplyBusy(false);
    }
  }

  const stats = useMemo(() => {
    const by = (s: string) => apps.filter((a) => a.status === s).length;
    const inProgress = apps.filter((a) => JOURNEY.slice(0, 5).includes(a.status)).length;
    return {
      total: apps.length,
      inProgress,
      offers: by("offer") + by("visa") + by("enrolled"),
      enrolled: by("enrolled"),
    };
  }, [apps]);

  const uniNames = useMemo(() => {
    const m = new Map<number, string>();
    unis.forEach((u) => m.set(u.id, u.name));
    return m;
  }, [unis]);

  const barsData = useMemo(() => {
    const counts = new Map<string, number>();
    apps.forEach((a) => counts.set(a.status, (counts.get(a.status) ?? 0) + 1));
    return Array.from(counts.entries()).map(([status, count]) => ({
      label: APP_STATUS_META[status]?.label ?? status,
      count,
    }));
  }, [apps]);

  const featuredUnis = useMemo(() => unis.filter((u) => u.featured).slice(0, 4), [unis]);

  const milestones = useMemo(() => {
    const done = new Set(apps.map((a) => a.status));
    return [
      { icon: "📝", label: "Submit your first application", done: apps.length > 0 },
      { icon: "📄", label: "Complete your document checklist", done: apps.some((a) => ["reviewing", "offer", "visa", "enrolled"].includes(a.status)) },
      { icon: "🎓", label: "Receive your first offer", done: done.has("offer") || done.has("visa") || done.has("enrolled") },
      { icon: "🛂", label: "Visa approval", done: done.has("visa") || done.has("enrolled") },
      { icon: "✈️", label: "Fly to campus!", done: done.has("enrolled") },
    ];
  }, [apps]);

  const ticketForm = (
    <TicketForm
      onCreated={async () => setTickets(await api.get<Ticket[]>("/tickets").catch(() => tickets))}
    />
  );

  return (
    <DashShell role="student" title="Student Dashboard" subtitle="Welcome back" tabs={TABS} active={tab} onTab={setTab}>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse-soft rounded-3xl bg-ink-100" />
          ))}
        </div>
      ) : (
        <>
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon="📚" label="Applications" value={stats.total} sub="All time" />
                <StatCard icon="⏳" label="In progress" value={stats.inProgress} sub="Moving through stages" gradient="from-sky-500 to-blue-700" />
                <StatCard icon="🎉" label="Offers" value={stats.offers} sub="Offer / visa / enrolled" gradient="from-emerald-500 to-emerald-700" />
                <StatCard icon="🎓" label="Enrolled" value={stats.enrolled} sub="Dreams unlocked" gradient="from-gold-500 to-amber-700" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Application pipeline">
                  {barsData.length === 0 ? (
                    <p className="py-6 text-center text-sm text-ink-900/50">No applications yet — start one below!</p>
                  ) : (
                    <MiniBars data={barsData} />
                  )}
                </Panel>

                <Panel
                  title="Recent activity"
                  action={<Link href="/student" onClick={() => setTab("applications")} className="text-sm font-semibold text-brand-600">View all →</Link>}
                >
                  {apps.length === 0 ? (
                    <p className="py-6 text-center text-sm text-ink-900/50">Nothing here yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {apps.slice(0, 4).map((a) => (
                        <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-ink-900">{uniNames.get(a.university_id) ?? `University #${a.university_id}`}</p>
                            <p className="text-xs text-ink-900/50">
                              {a.course?.name ?? ""} · updated {new Date(a.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusChip status={a.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>

              <Panel title="Continue your journey">
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setTab("apply")} className="btn-3d !px-5 !py-2.5 text-sm">➕ New application</button>
                  <Link href="/chat" className="rounded-xl border border-ink-100 px-5 py-2.5 text-sm font-semibold transition hover:bg-ink-50">
                    🤖 Ask EduGuide AI
                  </Link>
                  <Link href="/countries" className="rounded-xl border border-ink-100 px-5 py-2.5 text-sm font-semibold transition hover:bg-ink-50">
                    🌍 Explore destinations
                  </Link>
                </div>
              </Panel>

              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Your milestones">
                  <ul className="space-y-2.5">
                    {milestones.map((m) => (
                      <li key={m.label} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3">
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base ${m.done ? "bg-emerald-100" : "bg-ink-100 opacity-60"}`}>
                          {m.done ? "✓" : m.icon}
                        </span>
                        <span className={`text-sm font-semibold ${m.done ? "text-ink-900" : "text-ink-900/45"}`}>{m.label}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Panel
                  title="Recommended for you"
                  action={<Link href="/universities" className="text-sm font-semibold text-brand-600">Explore →</Link>}
                >
                  <ul className="space-y-2.5">
                    {featuredUnis.map((u) => (
                      <li key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink-900">{u.name}</p>
                          <p className="text-xs text-ink-900/50">📍 {u.city} · #{u.world_rank ?? "—"} worldwide</p>
                        </div>
                        <button onClick={() => { setTab("apply"); }} className="shrink-0 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100">
                          Apply
                        </button>
                      </li>
                    ))}
                    {featuredUnis.length === 0 && <p className="py-6 text-center text-sm text-ink-900/50">Loading recommendations…</p>}
                  </ul>
                </Panel>
              </div>
            </div>
          )}

          {tab === "applications" && (
            <div className="space-y-4">
              {apps.length === 0 ? (
                <EmptyState icon="🎓" title="No applications yet" sub="Browse universities and submit your first application — your counselor takes it from there." />
              ) : (
                apps.map((a) => {
                  const stageIdx = JOURNEY.indexOf(a.status);
                  const detail = openApp?.id === a.id ? openApp : null;
                  return (
                    <div key={a.id} className="glass rounded-3xl p-5">
                      <button className="flex w-full flex-wrap items-center justify-between gap-3 text-left" onClick={() => openDetail(a)}>
                        <div className="min-w-0">
                          <p className="font-display text-lg font-bold text-ink-900">{uniNames.get(a.university_id) ?? `University #${a.university_id}`}</p>
                          <p className="text-sm text-ink-900/55">{a.course?.name ?? "—"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusChip status={a.status} />
                          <span className="text-xs text-ink-900/40">{detail ? "▲ Hide" : "▼ Details"}</span>
                        </div>
                      </button>

                      {/* Journey progress */}
                      <div className="mt-4">
                        <ProgressBar value={a.status === "rejected" ? 100 : ((stageIdx + 1) / JOURNEY.length) * 100} gradient={a.status === "rejected" ? "from-rose-400 to-rose-600" : "from-brand-500 to-emerald-500"} />
                        <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-ink-900/40">
                          {JOURNEY.map((s, i) => (
                            <span key={s} className={i <= stageIdx ? "text-brand-700" : ""}>{APP_STATUS_META[s].label}</span>
                          ))}
                        </div>
                      </div>

                      {detail && (
                        <div className="mt-5 grid gap-5 border-t border-ink-100 pt-5 md:grid-cols-2">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wide text-ink-900/45">Document checklist</h4>
                            <ul className="mt-2 space-y-1.5">
                              {detail.documents.map((d) => (
                                <li key={d.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                                  <span className="text-ink-900/75">{d.kind}</span>
                                  <span
                                    className={`chip ${
                                      d.status === "verified"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : d.status === "received"
                                          ? "bg-sky-50 text-sky-700"
                                          : "bg-ink-100 text-ink-900/50"
                                    }`}
                                  >
                                    {d.status === "verified" ? "✓ verified" : d.status}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wide text-ink-900/45">Timeline</h4>
                            <ul className="mt-2 space-y-2.5 border-l-2 border-brand-100 pl-4">
                              {detail.timeline.map((ev) => (
                                <li key={ev.id} className="relative text-sm">
                                  <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
                                  <p className="font-semibold text-ink-900">{ev.label}</p>
                                  {ev.detail && <p className="text-xs text-ink-900/50">{ev.detail}</p>}
                                  <p className="text-[10px] text-ink-900/35">{new Date(ev.created_at).toLocaleString()}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "apply" && (
            <div className="glass mx-auto max-w-2xl rounded-3xl p-8">
              <h2 className="font-display text-xl font-bold text-ink-900">Start a new application</h2>
              <p className="mt-1 text-sm text-ink-900/55">Pick a university and course — a document checklist is created automatically.</p>
              <form onSubmit={submitApplication} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">University</label>
                  <select required value={uniId} onChange={(e) => setUniId(e.target.value ? Number(e.target.value) : "")} className="input-luxe mt-1">
                    <option value="">Choose a university…</option>
                    {unis.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.city} {u.world_rank ? `(#{u.world_rank})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Course</label>
                  <select required value={courseId} onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : "")} disabled={!courses.length} className="input-luxe mt-1 disabled:opacity-60">
                    <option value="">{courses.length ? "Choose a course…" : "Select a university first"}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.level} · {c.duration} · {money(c.tuition, c.currency)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-900/50">Note to counselor (optional)</label>
                  <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input-luxe mt-1" placeholder="Anything we should know?" />
                </div>
                {applyMsg && <p className="rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-800">{applyMsg}</p>}
                <button disabled={applyBusy || !uniId || !courseId} className="btn-3d w-full !py-3 disabled:opacity-50">
                  {applyBusy ? "Submitting…" : "Submit application 🚀"}
                </button>
              </form>
            </div>
          )}

          {tab === "support" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="My support tickets">
                {tickets.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-900/50">No tickets — smooth sailing! 🛟</p>
                ) : (
                  <ul className="space-y-3">
                    {tickets.map((t) => (
                      <li key={t.id} className="rounded-2xl border border-ink-100 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-ink-900">{t.subject}</p>
                          <StatusChip status={t.status} kind="ticket" />
                        </div>
                        <p className="mt-1 text-xs text-ink-900/55">{t.message}</p>
                        {t.response && <p className="mt-2 rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-800"><b>Support:</b> {t.response}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              {ticketForm}
            </div>
          )}
        </>
      )}
    </DashShell>
  );
}

function TicketForm({ onCreated }: { onCreated: () => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/tickets", { subject, message, priority });
      setSubject("");
      setMessage("");
      setDone(true);
      setTimeout(() => setDone(false), 3500);
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Raise a ticket">
      <form onSubmit={submit} className="space-y-3">
        <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="input-luxe" />
        <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue…" className="input-luxe" />
        <div className="flex items-center gap-2">
          {["low", "normal", "urgent"].map((p) => (
            <button type="button" key={p} onClick={() => setPriority(p)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${priority === p ? "bg-brand-600 text-white" : "bg-ink-900/5 text-ink-900/60"}`}>
              {p}
            </button>
          ))}
        </div>
        {done && <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">✓ Ticket created</p>}
        <button disabled={busy} className="btn-3d w-full !py-2.5 text-sm disabled:opacity-50">{busy ? "Sending…" : "Submit ticket"}</button>
      </form>
    </Panel>
  );
}
