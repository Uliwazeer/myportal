import Link from "next/link";
import type { Track } from "@/lib/data";

export default function TrackCard({ track }: { track: Track }) {
  return (
    <Link
      href={`/tracks/${track.slug}`}
      className="group flex flex-col h-full rounded-lg border border-border bg-surface p-5 transition-all duration-300 hover:border-accent hover:shadow-[0_0_15px_rgba(230,0,0,0.2)] hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">{track.durationWeeks} Weeks</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-white bg-border/50">
          {track.level}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-medium text-ink group-hover:text-accent transition-colors">{track.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{track.tagline}</p>
      <span className="mt-4 text-sm text-accent group-hover:underline flex items-center gap-1">
        View Track <span className="group-hover:translate-x-1 transition-transform">→</span>
      </span>
    </Link>
  );
}
