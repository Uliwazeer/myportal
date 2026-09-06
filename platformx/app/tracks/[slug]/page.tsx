"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAllTracks, getAllMentors, syncWithServer } from "@/lib/store";
import type { Track, MentorData } from "@/lib/data";

export default function TrackDetailPage() {
  const { slug } = useParams() as { slug: string };
  const [track, setTrack] = useState<Track | null>(null);
  const [trackMentors, setTrackMentors] = useState<MentorData[]>([]);
  const [loading, setLoading] = useState(true);

  function loadTrack() {
    const allT = getAllTracks();
    const allM = getAllMentors();
    let found = allT.find((t) => t.slug === slug);
    if (!found) {
      const matchingMentors = allM.filter((m) => m.tracks.includes(slug));
      if (matchingMentors.length > 0) {
        const formatted = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        found = {
          slug,
          name: formatted,
          tagline: `Specialized ${formatted} track guided by industry experts.`,
          level: matchingMentors[0].level || "Junior",
          durationWeeks: 8,
          modules: [
            { week: 1, title: `${formatted} Core Concepts`, topics: ["Fundamentals", "Architecture", "Tooling"] },
            { week: 2, title: "Applied Implementation", topics: ["Hands-on Labs", "Real-world Tasks"] },
            { week: 8, title: "Capstone Project", topics: ["Production Deployment", "Mentor Review"] },
          ],
          finalProject: `Full production ${formatted} project with 1-on-1 mentor code reviews`,
        };
      }
    }
    setTrack(found || null);
    if (found) {
      setTrackMentors(allM.filter((m) => m.tracks.includes(slug)));
    }
  }

  useEffect(() => {
    loadTrack();
    setLoading(false);
    syncWithServer().then(loadTrack);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted text-lg">Track not found.</p>
          <Link href="/tracks" className="text-accent hover:underline text-sm mt-2 block">
            Back to Tracks
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Mentors in this Track */}
      {trackMentors.length > 0 && (
        <div className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
              Mentors Teaching this Track ({trackMentors.length})
            </h2>
            <Link href="/mentors" className="text-xs text-accent hover:underline">
              View All Mentors →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {trackMentors.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between gap-3 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full ${m.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink truncate">{m.name}</p>
                    <p className="text-xs text-muted truncate">{m.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                  <span className="text-yellow-400">★ {m.rating}</span>
                  <div className="flex gap-2">
                    <Link
                      href={`/mentors/${m.id}`}
                      className="text-muted hover:text-ink transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href={`/book?mentor=${m.id}`}
                      className="text-accent font-semibold hover:underline"
                    >
                      Book →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {track.modules && track.modules.length > 0 && (
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
      )}

      {track.finalProject && (
        <div className="mt-10 rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider">Final Project</h2>
          <p className="mt-2 font-mono text-sm leading-relaxed text-ink">{track.finalProject}</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href={`/register?role=intern&track=${track.slug}`}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-[0_0_15px_rgba(230,0,0,0.4)]"
        >
          Register for this Track
        </Link>
        <Link
          href="/mentors"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:text-ink transition-colors"
        >
          Explore All Mentors
        </Link>
      </div>
    </section>
  );
}

