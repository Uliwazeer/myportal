"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllMentors, getAllTracks, syncWithServer } from "@/lib/store";
import type { MentorData, Track } from "@/lib/data";

export default function RegisterMentorsList() {
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    setMentors(getAllMentors());
    setTracks(getAllTracks());
    syncWithServer().then(() => {
      setMentors(getAllMentors());
      setTracks(getAllTracks());
    });
  }, []);

  return (
    <div className="rounded-lg border border-border bg-surface2 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink">Our Verified Mentors</h3>
        <Link
          href="/mentors"
          className="text-xs text-accent hover:underline font-medium"
        >
          View All ({mentors.length}) →
        </Link>
      </div>

      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
        {mentors.map((m) => {
          const mTracks = tracks.filter((t) => m.tracks?.includes(t.slug));

          return (
            <div
              key={m.id}
              className="p-3 rounded-xl border border-border/60 bg-surface/80 hover:border-accent/50 transition-all space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full ${m.color || "bg-accent"} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{m.name}</p>
                    <p className="text-[11px] text-accent font-medium truncate">{m.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/mentors/${m.id}`}
                    className="px-2.5 py-1 text-[11px] border border-border rounded-md text-muted hover:text-ink hover:border-ink transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href={`/book?mentor=${m.id}`}
                    className="px-2.5 py-1 text-[11px] bg-accent text-white rounded-md hover:opacity-90 font-semibold transition-opacity shadow-sm"
                  >
                    Book
                  </Link>
                </div>
              </div>

              {/* Tracks Badges */}
              <div className="flex flex-wrap items-center gap-1 pl-10">
                {mTracks.slice(0, 2).map((t) => (
                  <span
                    key={t.slug}
                    className="text-[9px] font-mono bg-surface2 text-muted border border-border/70 rounded px-1.5 py-0.2"
                  >
                    {t.name}
                  </span>
                ))}
                <span className="text-[9px] text-yellow-400 font-semibold ml-auto flex items-center gap-0.5">
                  ★ {m.rating} <span className="text-muted font-normal">({m.completedConsultations || 0} sessions)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
