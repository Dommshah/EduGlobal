"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashShell, { DashTab } from "@/components/DashShell";
import {
  StatCard,
  StatusChip,
  EmptyState,
  MiniBars,
  Panel,
  PIPELINE_ORDER,
  ENQUIRY_STATUS_META,
} from "@/components/DashKit";
import { api, Application, ContactMessage, Enquiry, Ticket, University } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const TABS: DashTab[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "pipeline", label: "Enquiry Pipeline", icon: "🧲" },
  { id: "applications", label: "Applications", icon: "📚" },
  { id: "contacts", label: "Contact Inbox", icon: "✉️" },
  { id: "tickets", label: "Ticket Desk", icon: "🛟" },
];

const APP_STATUSES = ["submitted", "documents", "reviewing", "offer", "visa", "enrolled", "rejected"];

interface CrmSummary {
  enquiries: { total: number; by_status: Record<string, number> };
  conversion_rate: number;
  applications: { total: number; by_status: Record<string, number> };
  new_enquiries: number;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, e, a, c, t] = await Promise.all([
        api.get<CrmSummary>("/crm/summary"),
        api.get<Enquiry[]>("/enquiries"),
        api.get<Application[]>("/applications"),
        api.get<ContactMessage[]>("/contacts"),
        api.get<Ticket[]>("/tickets"),
      ]);
      setSummary(s);
      setEnquiries(e);
      setApps(a);
      setContacts(c);
      setTickets(t);
    } catch {
      /* guard handles */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "employee") load();
  }, [user, load]);

  useEffect(() => {
    api.get<University[]>("/universities?limit=200").then(setUnis).catch(() => {});
  }, []);

  const uniNames = useMemo(() => {
    const m = new Map<number, string>();
    unis.forEach((u) => m.set(u.id, u.name));
    return m;
  }, [unis]);

  async function setEnquiryStatus(id: number, status: string) {
    setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, status: status as Enquiry["status"] } : e)));
    try {
      await api.patch(`/enquiries/${id}`, { status, claim: true });
      await load();
    } catch {
      load();
    }
  }

  async function setAppStatus(id: number, status: string) {
    setApps((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await api.patch(`/applications/${id}`, { status });
    } catch {
      load();
    }
  }

  if (loading) {
    return (
      <DashShell role="employee" title="CRM Workspace" tabs={TABS} active={tab} onTab={setTab}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse-soft rounded-3xl bg-ink-100" />
          ))}
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell role="employee" title="CRM Workspace" subtitle={`Counselor desk${user ? ` · ${user.name}` : ""}`} tabs={TABS} active={tab} onTab={setTab}>
      {tab === "overview" && summary && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="🧲" label="Total enquiries" value={summary.enquiries.total} sub={`${summary.new_enquiries} new to action`} />
            <StatCard icon="📈" label="Conversion rate" value={`${summary.conversion_rate}%`} sub="Enquiry → enrolled" gradient="from-emerald-500 to-emerald-700" />
            <StatCard icon="📚" label="My applications" value={summary.applications.total} sub="Assigned to me" gradient="from-sky-500 to-blue-700" />
            <StatCard icon="🛟" label="Open tickets" value={tickets.filter((t) => t.status !== "resolved").length} sub="Awaiting response" gradient="from-rose-500 to-rose-700" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Enquiries by stage">
              <MiniBars data={PIPELINE_ORDER.map((s) => ({ label: ENQUIRY_STATUS_META[s].label.replace(" 🎉", ""), count: summary.enquiries.by_status[s] ?? 0 }))} />
            </Panel>
            <Panel title="Applications by stage">
              {Object.keys(summary.applications.by_status).length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-900/50">No assigned applications yet.</p>
              ) : (
                <MiniBars
                  data={Object.entries(summary.applications.by_status).map(([s, count]) => ({
                    label: s.charAt(0).toUpperCase() + s.slice(1),
                    count,
                  }))}
                />
              )}
            </Panel>
          </div>

          <Panel title="Conversion funnel — enquiry to enrolment">
            <div className="grid gap-3 sm:grid-cols-5">
              {PIPELINE_ORDER.map((s, i) => {
                const count = summary.enquiries.by_status[s] ?? 0;
                const pct = summary.enquiries.total ? Math.round((count / summary.enquiries.total) * 100) : 0;
                return (
                  <div key={s} className="rounded-2xl border border-ink-100 bg-white p-4 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-900/40">Stage {i + 1}</p>
                    <p className="mt-1 font-display text-2xl font-bold text-ink-900">{count}</p>
                    <p className="text-[11px] text-ink-900/50">{ENQUIRY_STATUS_META[s].label.replace(" 🎉", "")} · {pct}%</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="New enquiries to action">
            {enquiries.filter((e) => e.status === "new").length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-900/50">All caught up! 🎉</p>
            ) : (
              <ul className="space-y-3">
                {enquiries
                  .filter((e) => e.status === "new")
                  .slice(0, 6)
                  .map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-ink-900">{e.name}</p>
                        <p className="text-xs text-ink-900/55">
                          {e.email} · {e.country_interest || "—"} · {e.level || "—"} · {e.intake || "—"}
                        </p>
                      </div>
                      <button onClick={() => setEnquiryStatus(e.id, "contacted")} className="btn-3d !px-4 !py-2 text-xs">
                        Mark contacted →
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      {tab === "pipeline" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-[900px] gap-4">
            {PIPELINE_ORDER.map((stage) => {
              const items = enquiries.filter((e) => e.status === stage);
              return (
                <div
                  key={stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId !== null) setEnquiryStatus(dragId, stage);
                    setDragId(null);
                  }}
                  className="glass w-64 shrink-0 rounded-3xl p-3"
                >
                  <div className="flex items-center justify-between px-2 py-1">
                    <p className="text-sm font-bold text-ink-900">{ENQUIRY_STATUS_META[stage].label}</p>
                    <span className="chip bg-ink-900/5 text-ink-900/60">{items.length}</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {items.map((e) => (
                      <div
                        key={e.id}
                        draggable
                        onDragStart={() => setDragId(e.id)}
                        className="cursor-grab rounded-2xl border border-ink-100 bg-white p-3 shadow-sm transition hover:shadow-luxe active:cursor-grabbing"
                      >
                        <p className="text-sm font-bold text-ink-900">{e.name}</p>
                        <p className="text-[11px] text-ink-900/50">{e.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                          {e.country_interest && <span className="chip bg-brand-50 text-brand-700">{e.country_interest}</span>}
                          {e.level && <span className="chip bg-amber-50 text-amber-700">{e.level}</span>}
                          {e.intake && <span className="chip bg-ink-50 text-ink-900/60">{e.intake}</span>}
                        </div>
                        {e.message && <p className="mt-2 line-clamp-2 text-[11px] text-ink-900/55">{e.message}</p>}
                        <p className="mt-2 text-[10px] text-ink-900/35">{new Date(e.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-ink-100 px-3 py-6 text-center text-[11px] text-ink-900/35">
                        Drop cards here
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-ink-900/40">💡 Drag enquiry cards between stages to update the pipeline</p>
        </div>
      )}

      {tab === "applications" && (
        <div className="space-y-4">
          {apps.length === 0 ? (
            <EmptyState icon="📚" title="No assigned applications" sub="Applications assigned to you (or created by your students) appear here." />
          ) : (
            apps.map((a) => (
              <div key={a.id} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-ink-900">
                      {a.student?.name ?? "Student"} → {uniNames.get(a.university_id) ?? `University #${a.university_id}`}
                    </p>
                    <p className="text-sm text-ink-900/55">
                      {a.course?.name ?? "—"} · {a.student?.email ?? ""}
                    </p>
                  </div>
                  <StatusChip status={a.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-ink-900/40">Move to:</span>
                  {APP_STATUSES.filter((s) => s !== a.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => setAppStatus(a.id, s)}
                      className="rounded-full bg-ink-900/5 px-3 py-1 text-[11px] font-semibold text-ink-900/60 transition hover:bg-brand-600 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "contacts" && (
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <EmptyState icon="✉️" title="Inbox zero!" sub="Messages from the public contact form land here." />
          ) : (
            contacts.map((c) => (
              <div key={c.id} className={`glass rounded-3xl p-5 ${c.handled ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink-900">
                      {c.name} <span className="font-normal text-ink-900/50">· {c.email}</span>
                    </p>
                    {c.subject && <p className="text-xs font-semibold text-brand-700">{c.subject}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!c.handled && (
                      <button
                        onClick={async () => {
                          setContacts((list) => list.map((x) => (x.id === c.id ? { ...x, handled: true } : x)));
                          await api.patch(`/contacts/${c.id}`, { handled: true }).catch(() => {});
                        }}
                        className="btn-3d !px-4 !py-2 text-xs"
                      >
                        Mark handled ✓
                      </button>
                    )}
                    <a href={`mailto:${c.email}`} className="rounded-xl border border-ink-100 px-4 py-2 text-xs font-semibold transition hover:bg-ink-50">
                      Reply ↗
                    </a>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line rounded-2xl bg-white px-4 py-3 text-sm text-ink-900/70">{c.message}</p>
                <p className="mt-2 text-[10px] text-ink-900/35">{new Date(c.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "tickets" && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <EmptyState icon="🛟" title="No tickets" sub="Student support requests will appear here." />
          ) : (
            tickets.map((t) => <TicketRow key={t.id} ticket={t} onSaved={load} />)
          )}
        </div>
      )}
    </DashShell>
  );
}

function TicketRow({ ticket, onSaved }: { ticket: Ticket; onSaved: () => void }) {
  const [response, setResponse] = useState(ticket.response ?? "");
  const [status, setStatus] = useState<string>(ticket.status);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api.patch(`/tickets/${ticket.id}`, { response, status });
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink-900">{ticket.subject}</p>
          <p className="text-xs text-ink-900/50">
            {ticket.message} · <span className="font-semibold capitalize">{ticket.priority} priority</span>
          </p>
        </div>
        <StatusChip status={status} kind="ticket" />
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <textarea rows={2} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Write a response…" className="input-luxe" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-luxe !w-auto">
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
        <button onClick={save} disabled={busy} className="btn-3d !px-5 !py-2.5 text-sm disabled:opacity-50">
          {busy ? "…" : "Save"}
        </button>
      </div>
      <p className="mt-2 text-[10px] text-ink-900/35">Raised {new Date(ticket.created_at).toLocaleString()}</p>
    </div>
  );
}
