import type { Lab } from "@/lib/data";

export default function LabCard({ lab }: { lab: Lab }) {
  return (
    <div className="group rounded-lg border border-border bg-surface p-5 transition-all duration-300 hover:border-accent hover:shadow-[0_0_15px_rgba(230,0,0,0.15)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-accent">{lab.track}</span>
        <span className="font-mono text-xs text-muted">#{lab.id}</span>
      </div>

      <h3 className="mt-2 text-base font-medium text-ink group-hover:text-accent transition-colors">{lab.title}</h3>

      <div className="mt-3 rounded-md bg-surface2 p-3 border border-border/50">
        <p className="font-mono text-xs leading-relaxed text-muted">{lab.scenario}</p>
      </div>

      <ul className="mt-3 space-y-1.5">
        {lab.checks.map((c) => (
          <li key={c} className="flex items-start gap-2 text-xs text-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
            {c}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-4 w-full rounded-md border border-border py-2 text-sm text-ink transition-all hover:border-accent hover:text-white hover:bg-accent hover:shadow-[0_0_10px_rgba(230,0,0,0.3)]"
      >
        Start Lab
      </button>
    </div>
  );
}
