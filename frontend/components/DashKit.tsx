"use client";

export const APP_STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
  draft: { label: "Draft", chip: "bg-ink-100 text-ink-900/60", dot: "bg-ink-400" },
  submitted: { label: "Submitted", chip: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  documents: { label: "Documents", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  reviewing: { label: "Under review", chip: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  offer: { label: "Offer received", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  visa: { label: "Visa stage", chip: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
  enrolled: { label: "Enrolled 🎓", chip: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-600" },
  rejected: { label: "Not successful", chip: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
};

export const ENQUIRY_STATUS_META: Record<string, { label: string; chip: string }> = {
  new: { label: "New", chip: "bg-sky-50 text-sky-700" },
  contacted: { label: "Contacted", chip: "bg-amber-50 text-amber-700" },
  qualified: { label: "Qualified", chip: "bg-indigo-50 text-indigo-700" },
  converted: { label: "Converted 🎉", chip: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Closed", chip: "bg-ink-100 text-ink-900/50" },
};

export const PIPELINE_ORDER = ["new", "contacted", "qualified", "converted", "closed"];

export function StatCard({
  icon,
  label,
  value,
  sub,
  gradient = "from-brand-500 to-brand-800",
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  gradient?: string;
}) {
  return (
    <div className="card-3d glass rounded-3xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-900/45">{label}</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-ink-900/50">{sub}</p>}
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-xl text-white shadow-3d`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

export function StatusChip({ status, kind = "app" }: { status: string; kind?: "app" | "enquiry" | "ticket" }) {
  const meta =
    kind === "app"
      ? APP_STATUS_META[status]
      : kind === "enquiry"
        ? ENQUIRY_STATUS_META[status]
        : status === "resolved"
          ? { label: "Resolved", chip: "bg-emerald-50 text-emerald-700" }
          : status === "pending"
            ? { label: "Pending", chip: "bg-amber-50 text-amber-700" }
            : { label: "Open", chip: "bg-rose-50 text-rose-700" };
  return (
    <span className={`chip ${meta?.chip ?? "bg-ink-100 text-ink-900/60"}`}>{meta?.label ?? status}</span>
  );
}

export function ProgressBar({ value, gradient = "from-brand-500 to-gold-500" }: { value: number; gradient?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-ink-100">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ icon = "🗂️", title, sub }: { icon?: string; title: string; sub?: string }) {
  return (
    <div className="glass grid place-items-center rounded-3xl px-6 py-14 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="mt-3 font-display text-lg font-bold text-ink-900">{title}</p>
      {sub && <p className="mt-1 max-w-sm text-sm text-ink-900/55">{sub}</p>}
    </div>
  );
}

export function MiniBars({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-ink-900/60">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-700"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right font-bold text-ink-900">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`glass rounded-3xl p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
