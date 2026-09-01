"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllMentors, getAllTracks } from "@/lib/store";
import type { MentorData, Track } from "@/lib/data";

export default function RegisterMentorsList() {
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    setMentors(getAllMentors());
    setTracks(getAllTracks());
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

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
        {mentors.map((m) => {
          const mTracks = tracks.filter((t) => m.tracks?.includes(t.slug));
          const primaryTrack = mTracks.length > 0 ? mTracks[0].name : m.title;

          return (
            <div
              key={m.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-surface/80 hover:border-accent/50 transition-colors gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full ${m.color || "bg-accent"} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}
                >
                  {m.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{m.name}</p>
                  <p className="text-[10px] text-muted truncate">{primaryTrack}</p>
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
                  className="px-2.5 py-1 text-[11px] bg-accent text-white rounded-md hover:opacity-90 font-medium transition-opacity"
                >
                  Book
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
