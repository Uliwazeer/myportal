import { stats } from "@/lib/data";

export default function StatusPanel() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <span className="font-mono text-xs text-muted">platform_status</span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          live
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.mono} className="rounded-md bg-surface2 p-3">
            <dt className="font-mono text-[11px] text-muted">{s.mono}</dt>
            <dd className="mt-1 font-mono text-2xl text-ink">{s.value}</dd>
            <dd className="text-xs text-muted">{s.label}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        {["linux", "docker", "kubernetes"].map((svc, i) => (
          <div key={svc} className="flex items-center justify-between font-mono text-xs">
            <span className="text-muted">{svc}</span>
            <span className={i === 2 ? "text-accent" : "text-success"}>
              {i === 2 ? "in_progress" : "healthy"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
