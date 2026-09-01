import type { Lab } from "@/lib/data";

export default function LabCard({ lab }: { lab: Lab }) {
  const difficultyColors = {
    Beginner: "border-green-500/40 bg-green-500/10 text-green-400",
    Intermediate: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    Advanced: "border-red-500/40 bg-red-500/10 text-red-400",
  };

  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-accent hover:shadow-[0_0_15px_rgba(230,0,0,0.15)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-xs text-accent font-semibold">{lab.track}</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold border rounded-full px-2.5 py-0.5 ${
                difficultyColors[lab.difficulty || "Beginner"]
              }`}
            >
              {lab.difficulty || "Beginner"}
            </span>
            <span className="font-mono text-[11px] text-muted">#{lab.id}</span>
          </div>
        </div>

        <h3 className="text-base font-semibold text-ink group-hover:text-accent transition-colors">
          {lab.title}
        </h3>

        <div className="mt-2.5 rounded-lg bg-surface2 p-3 border border-border/50">
          <p className="text-xs leading-relaxed text-muted">{lab.scenario}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted">
          {lab.estimatedTime && (
            <span className="flex items-center gap-1">
              <span>⏱️</span> {lab.estimatedTime}
            </span>
          )}
          {lab.xp && (
            <span className="flex items-center gap-1 font-mono text-accent font-semibold">
              <span>⚡</span> {lab.xp} XP
            </span>
          )}
          {lab.prerequisites && (
            <span className="flex items-center gap-1 text-[10px]">
              <span className="text-muted">Prereq:</span> {lab.prerequisites}
            </span>
          )}
        </div>

        <ul className="mt-3.5 space-y-1.5">
          {lab.checks.map((c) => (
            <li key={c} className="flex items-start gap-2 text-xs text-muted">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-xl border border-border py-2 text-xs font-semibold text-ink transition-all hover:border-accent hover:text-white hover:bg-accent hover:shadow-[0_0_10px_rgba(230,0,0,0.3)]"
      >
        Start Lab →
      </button>
    </div>
  );
}
