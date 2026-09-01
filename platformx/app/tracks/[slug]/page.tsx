import { notFound } from "next/navigation";
import Link from "next/link";
import { tracks } from "@/lib/data";

export function generateStaticParams() {
  return tracks.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const track = tracks.find((t) => t.slug === params.slug);
  return { title: track ? `${track.name} — PlatformX` : "Track Not Found" };
}

export default function TrackDetailPage({ params }: { params: { slug: string } }) {
  const track = tracks.find((t) => t.slug === params.slug);
  if (!track) notFound();

  return (
    <section className="mx-auto max-w-content px-6 py-16">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs text-accent">
          {track.level}
        </span>
        <span className="font-mono text-xs text-muted">{track.durationWeeks} Weeks</span>
      </div>

      <h1 className="mt-3 text-2xl font-semibold text-ink">{track.name}</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">{track.tagline}</p>

      <div className="mt-10 space-y-3">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">Weekly Schedule</h2>
        <ol className="space-y-3">
          {track.modules.map((m) => (
            <li key={m.week} className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-accent">
                  Week {String(m.week).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-medium text-ink">{m.title}</h3>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {m.topics.map((t) => (
                  <li
                    key={t}
                    className="rounded-md bg-surface2 px-2 py-1 text-xs text-muted border border-border/50"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">Final Project</h2>
        <p className="mt-2 font-mono text-sm leading-relaxed text-ink">{track.finalProject}</p>
      </div>

      <Link
        href="/register"
        className="mt-8 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-[0_0_15px_rgba(230,0,0,0.4)]"
      >
        Register for this Track
      </Link>
    </section>
  );
}

