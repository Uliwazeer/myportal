import TrackCard from "@/components/TrackCard";
import { tracks } from "@/lib/data";

export const metadata = { title: "Learning Tracks — Mentorship Platform" };

export default function TracksPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Learning Tracks</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Each track is 8 weeks, ending with a real deployed final project — not just an exercise.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {tracks.map((t) => (
          <TrackCard key={t.slug} track={t} />
        ))}
      </div>
    </section>
  );
}

