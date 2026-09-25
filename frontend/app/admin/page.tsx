"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashShell, { DashTab } from "@/components/DashShell";
import { StatCard, StatusChip, EmptyState, MiniBars, Panel } from "@/components/DashKit";
import { api, Country, Ticket, University } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { compact, money } from "@/lib/format";

const TABS: DashTab[] = [
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "crm", label: "CRM Overview", icon: "🧲" },
  { id: "universities", label: "Universities", icon: "🏛️" },
  { id: "tickets", label: "Support Desk", icon: "🛟" },
];

interface Analytics {
  users_by_role: Record<string, number>;
  enquiries_by_status: Record<string, number>;
  applications_by_status: Record<string, number>;
  top_universities: { name: string; count: number }[];
  enquiries_by_country: { name: string; count: number }[];
  conversion_rate: number;
  weekly_signups: { label: string; count: number }[];
  recent_users: { id: number; name: string; email: string; role: string; created_at: string }[];
  totals: {
    users: number;
    enquiries: number;
    applications: number;
    tickets: number;
    contact_messages: number;
    unread_contacts: number;
  };
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
}

interface CrmEnquiry {
  id: number;
  name: string;
  email: string;
  country_interest?: string | null;
  level?: string | null;
  status: string;
  source: string;
  created_at: string;
}

const ROLE_CHIPS: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700",
  employee: "bg-sky-50 text-sky-700",
  student: "bg-emerald-50 text-emerald-700",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("analytics");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [enquiries, setEnquiries] = useState<CrmEnquiry[]>([]);
  const [unis, setUnis] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);  const [loading, setLoading] = useState(true);
  const [userQuery, setUserQuery] = useState("");
  const [userRole, setUserRole] = useState("");
  const [uniQuery, setUniQuery] = useState("");

  const load = useCallback(async () => {
    try {
      const [a, u, e, t] = await Promise.all([
        api.get<Analytics>("/admin/analytics"),
        api.get<AdminUser[]>("/admin/users"),
        api.get<CrmEnquiry[]>("/enquiries"),
        api.get<Ticket[]>("/tickets"),
      ]);
      setAnalytics(a);
      setUsers(u);
      setEnquiries(e);
      setTickets(t);
    } catch {
      /* guard handles */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  useEffect(() => {
    api.get<University[]>("/universities?limit=300").then(setUnis).catch(() => {});
    api.get<Country[]>("/countries").then(setCountries).catch(() => {});
  }, []);

  const filteredUsers = useMemo(() => {
    const q = userQuery.toLowerCase();
    return users.filter(
      (u) =>
        (!userRole || u.role === userRole) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [users, userQuery, userRole]);

  const filteredUnis = useMemo(() => {
    const q = uniQuery.toLowerCase();
    return unis.filter((u) => !q || u.name.toLowerCase().includes(q));
  }, [unis, uniQuery]);

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api.post("/admin/users", {
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        role: fd.get("role"),
      });
      (e.target as HTMLFormElement).reset();
      await load();
    } catch {
      alert("Could not create user — email may already exist.");
    }
  }

  async function changeRole(id: number, role: string) {
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
    await api.patch(`/admin/users/${id}`, { role }).catch(load);
  }

  async function deleteUser(u: AdminUser) {
    if (!confirm(`Delete ${u.name} (${u.email})? This cannot be undone.`)) return;
    setUsers((list) => list.filter((x) => x.id !== u.id));
    await api.delete(`/admin/users/${u.id}`).catch(load);
  }

  async function toggleFeatured(u: University) {
    setUnis((list) => list.map((x) => (x.id === u.id ? { ...x, featured: !x.featured } : x)));
    await api.patch(`/admin/universities/${u.id}`, { featured: !u.featured }).catch(() => {});
  }

  async function deleteUniversity(u: University) {
    if (!confirm(`Remove ${u.name} and its courses from the catalog?`)) return;
    setUnis((list) => list.filter((x) => x.id !== u.id));
    await api.delete(`/admin/universities/${u.id}`).catch(load);
  }

  if (loading) {
    return (
      <DashShell role="admin" title="Admin Control Center" tabs={TABS} active={tab} onTab={setTab}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse-soft rounded-3xl bg-ink-100" />
          ))}
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell role="admin" title="Admin Control Center" subtitle="Full platform visibility" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="👥" label="Users" value={analytics.totals.users} sub={`${analytics.users_by_role.student ?? 0} students · ${analytics.users_by_role.employee ?? 0} staff`} />
            <StatCard icon="🧲" label="Enquiries" value={analytics.totals.enquiries} sub={`${analytics.conversion_rate}% converted`} gradient="from-gold-500 to-amber-700" />
            <StatCard icon="📚" label="Applications" value={analytics.totals.applications} sub={`${analytics.applications_by_status.enrolled ?? 0} enrolled`} gradient="from-sky-500 to-blue-700" />
            <StatCard icon="✉️" label="Contact messages" value={analytics.totals.contact_messages} sub={`${analytics.totals.unread_contacts} unhandled`} gradient="from-purple-500 to-purple-800" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Top universities by applications">
              <MiniBars data={analytics.top_universities.map((u) => ({ label: u.name, count: u.count }))} />
            </Panel>
            <Panel title="Demand by destination">
              {analytics.enquiries_by_country.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-900/50">No enquiry data yet.</p>
              ) : (
                <MiniBars data={analytics.enquiries_by_country.map((c) => ({ label: c.name, count: c.count }))} />
              )}
            </Panel>
            <Panel title="Users by role">
              <div className="grid grid-cols-3 gap-3">
                {["student", "employee", "admin"].map((r) => (
                  <div key={r} className="rounded-2xl border border-ink-100 bg-white p-4 text-center">
                    <p className="font-display text-2xl font-bold text-ink-900">{analytics.users_by_role[r] ?? 0}</p>
                    <p className={`chip mt-1 ${ROLE_CHIPS[r]}`}>{r}</p>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Enquiries by stage">
              <MiniBars
                data={Object.entries(analytics.enquiries_by_status).map(([s, count]) => ({
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                  count,
                }))}
              />
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Weekly signups (last 8 weeks)">
              <div className="flex h-40 items-end gap-2">
                {analytics.weekly_signups.map((w) => {
                  const max = Math.max(...analytics.weekly_signups.map((x) => x.count), 1);
                  return (
                    <div key={w.label} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-xs font-bold text-ink-900">{w.count}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-700"
                        style={{ height: `${Math.max(4, (w.count / max) * 100)}%` }}
                      />
                      <span className="text-[10px] text-ink-900/40">{w.label}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <Panel title="Recent signups">
              <ul className="space-y-2">
                {analytics.recent_users.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-900">{u.name}</p>
                      <p className="truncate text-xs text-ink-900/50">{u.email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`chip ${ROLE_CHIPS[u.role] ?? "bg-ink-100"}`}>{u.role}</p>
                      <p className="mt-1 text-[10px] text-ink-900/40">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-6">
          <Panel title="Add a user">
            <form onSubmit={createUser} className="grid gap-3 sm:grid-cols-5">
              <input required name="name" placeholder="Full name" className="input-luxe sm:col-span-1" />
              <input required type="email" name="email" placeholder="Email" className="input-luxe" />
              <input required name="password" placeholder="Temp password" className="input-luxe" />
              <select name="role" className="input-luxe" defaultValue="student">
                <option value="student">Student</option>
                <option value="employee">Counselor</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn-3d !py-2.5 text-sm">Create user</button>
            </form>
          </Panel>

          <Panel
            title={`All users (${filteredUsers.length})`}
            action={
              <div className="flex gap-2">
                <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="🔍 Search name/email" className="input-luxe !w-48 !py-2 text-sm" />
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="input-luxe !w-auto !py-2 text-sm">
                  <option value="">All roles</option>
                  <option value="student">Students</option>
                  <option value="employee">Counselors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-[11px] uppercase tracking-wide text-ink-900/40">
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3">Joined</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-ink-50 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-bold text-ink-900">{u.name}</p>
                        <p className="text-xs text-ink-900/50">{u.email}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className={`chip cursor-pointer ${ROLE_CHIPS[u.role] ?? ""}`}
                        >
                          <option value="student">student</option>
                          <option value="employee">employee</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="py-3 pr-3 text-xs text-ink-900/50">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => deleteUser(u)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <p className="py-8 text-center text-sm text-ink-900/50">No users match.</p>}
            </div>
          </Panel>
        </div>
      )}

      {tab === "crm" && (
        <Panel title={`All enquiries (${enquiries.length})`}>
          {enquiries.length === 0 ? (
            <EmptyState icon="🧲" title="No enquiries yet" sub="Website enquiries and dashboard-created leads appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-[11px] uppercase tracking-wide text-ink-900/40">
                    <th className="py-2 pr-3">Lead</th>
                    <th className="py-2 pr-3">Interest</th>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((e) => (
                    <tr key={e.id} className="border-b border-ink-50 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-bold text-ink-900">{e.name}</p>
                        <p className="text-xs text-ink-900/50">{e.email}</p>
                      </td>
                      <td className="py-3 pr-3 text-xs text-ink-900/70">
                        {e.country_interest || "—"} · {e.level || "—"}
                      </td>
                      <td className="py-3 pr-3"><span className="chip bg-ink-50 text-ink-900/60">{e.source}</span></td>
                      <td className="py-3 pr-3">
                        <select
                          value={e.status}
                          onChange={async (ev) => {
                            const status = ev.target.value;
                            setEnquiries((list) => list.map((x) => (x.id === e.id ? { ...x, status } : x)));
                            await api.patch(`/enquiries/${e.id}`, { status }).catch(() => {});
                          }}
                          className="chip cursor-pointer bg-brand-50 text-brand-700"
                        >
                          {["new", "contacted", "qualified", "converted", "closed"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-xs text-ink-900/50">{new Date(e.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {tab === "universities" && (
        <div className="space-y-6">
          <Panel title="Add a university">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                try {
                  const created = await api.post<University>("/admin/universities", {
                    name: fd.get("name"),
                    country_id: Number(fd.get("country_id")),
                    city: fd.get("city"),
                    world_rank: fd.get("world_rank") ? Number(fd.get("world_rank")) : null,
                    type: fd.get("type"),
                  });
                  setUnis((l) => [created, ...l]);
                  (e.target as HTMLFormElement).reset();
                } catch {
                  alert("Could not create university.");
                }
              }}
              className="grid gap-3 sm:grid-cols-6"
            >
              <input required name="name" placeholder="University name" className="input-luxe sm:col-span-2" />
              <select required name="country_id" className="input-luxe" defaultValue="">
                <option value="" disabled>Country…</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                ))}
              </select>
              <input required name="city" placeholder="City" className="input-luxe" />
              <input name="world_rank" type="number" min="1" placeholder="World rank" className="input-luxe" />
              <select name="type" className="input-luxe" defaultValue="Public">
                <option>Public</option>
                <option>Private</option>
              </select>
              <button className="btn-3d !py-2.5 text-sm sm:col-span-6">Add to catalog</button>
            </form>
          </Panel>

          <Panel
            title={`Universities (${filteredUnis.length})`}
            action={
              <input value={uniQuery} onChange={(e) => setUniQuery(e.target.value)} placeholder="🔍 Search" className="input-luxe !w-48 !py-2 text-sm" />
            }
          >
            <div className="max-h-[520px] overflow-y-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-ink-100 text-[11px] uppercase tracking-wide text-ink-900/40">
                    <th className="py-2 pr-3">University</th>
                    <th className="py-2 pr-3">Rank</th>
                    <th className="py-2 pr-3">Tuition</th>
                    <th className="py-2 pr-3">Featured</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnis.map((u) => (
                    <tr key={u.id} className="border-b border-ink-50 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-bold text-ink-900">{u.name}</p>
                        <p className="text-xs text-ink-900/50">{u.city}</p>
                      </td>
                      <td className="py-3 pr-3 text-ink-900/70">#{u.world_rank ?? "—"}</td>
                      <td className="py-3 pr-3 text-xs text-ink-900/70">{money(u.tuition_min)}–{money(u.tuition_max)}</td>
                      <td className="py-3 pr-3">
                        <button
                          onClick={() => toggleFeatured(u)}
                          className={`chip transition ${u.featured ? "bg-gold-100 text-amber-800" : "bg-ink-100 text-ink-900/50"}`}
                        >
                          {u.featured ? "★ Featured" : "☆ Standard"}
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => deleteUniversity(u)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {tab === "tickets" && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <EmptyState icon="🛟" title="No tickets" sub="All support requests across the platform appear here." />
          ) : (
            tickets.map((t) => <AdminTicketRow key={t.id} ticket={t} onSaved={load} />)
          )}
        </div>
      )}
    </DashShell>
  );
}

function AdminTicketRow({ ticket, onSaved }: { ticket: Ticket; onSaved: () => void }) {
  const [response, setResponse] = useState(ticket.response ?? "");
  const [status, setStatus] = useState<string>(ticket.status);
  const [busy, setBusy] = useState(false);

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink-900">{ticket.subject}</p>
          <p className="text-xs text-ink-900/55">{ticket.message}</p>
        </div>
        <StatusChip status={status} kind="ticket" />
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <textarea rows={2} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Response…" className="input-luxe min-w-0 flex-1" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-luxe !w-auto">
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
        <button
          onClick={async () => {
            setBusy(true);
            await api.patch(`/tickets/${ticket.id}`, { response, status }).catch(() => {});
            setBusy(false);
            onSaved();
          }}
          disabled={busy}
          className="btn-3d !px-5 !py-2.5 text-sm disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
