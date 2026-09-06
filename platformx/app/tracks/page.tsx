"use client";

import { useEffect, useState } from "react";
import TrackCard from "@/components/TrackCard";
import { getAllTracks, syncWithServer } from "@/lib/store";
import type { Track } from "@/lib/data";

export default function TracksPage() {
  const [tracksList, setTracksList] = useState<Track[]>([]);

  useEffect(() => {
    setTracksList(getAllTracks());
    syncWithServer().then(() => {
      setTracksList(getAllTracks());
    });
  }, []);

  return (
    <section className="mx-auto max-w-content px-6 py-16">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-ink">Learning Tracks</h1>
        <span className="text-xs font-mono text-accent border border-accent/40 rounded px-2 py-0.5">
          {tracksList.length} Tracks Available
        </span>
      </div>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Each track is 8 weeks, ending with a real deployed final project and 1-on-1 mentor guidance.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {tracksList.map((t) => (
          <TrackCard key={t.slug} track={t} />
        ))}
      </div>
    </section>
  );
}

