"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { mentors, tracks, levels } from "@/lib/data";

export default function MentorsPage() {
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const filtered = mentors.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q));
    const matchesTrack =
      filterTrack === "all" || m.tracks.includes(filterTrack);
    const matchesLevel = filterLevel === "all" || m.level === filterLevel;
    return matchesSearch && matchesTrack && matchesLevel;
  });

  return (
    <main className="min-h-screen bg-bg">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-accent opacity-[0.04] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-content px-4 md:px-6 py-12 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="text-xs font-mono text-accent border border-accent/30 rounded px-2 py-0.5">
            OUR MENTORS
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-ink mt-3 mb-2">
            Expert Mentors
          </h1>
          <p className="text-muted max-w-xl">
            Learn from senior engineers and specialists. Book 1-on-1 sessions
            tailored to your needs.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search mentors, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
          />
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          >
            <option value="all">All Tracks</option>
            {tracks.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          >
            <option value="all">All Levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {search || filterTrack !== "all" || filterLevel !== "all" ? (
          <p className="text-sm text-muted mb-5">
            {filtered.length} mentor{filtered.length !== 1 ? "s" : ""} found
          </p>
        ) : null}

        {/* Mentor cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-border bg-surface">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-ink font-medium mb-1">No mentors found</p>
            <p className="text-muted text-sm">
              Try adjusting your filters or search term.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((m, i) => {
              const mentorTracks = tracks.filter((t) =>
                m.tracks.includes(t.slug)
              );
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-4 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all"
                >
                  {/* Top */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-14 w-14 rounded-full ${m.color} flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg`}
                    >
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-ink text-lg leading-tight">
                            {m.name}
                          </h3>
                          <p className="text-sm text-muted">{m.title}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-sm font-bold text-ink">
                            {m.rating}
                          </span>
                          <span className="text-xs text-muted">
                            ({m.reviewCount})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-mono border border-border text-muted rounded px-1.5 py-0.5">
                          {m.level}
                        </span>
                        <span className="text-[10px] text-muted">
                          {m.yearsExperience}+ yrs exp
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">
                    {m.bio}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {m.skills.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-surface2 border border-border text-muted rounded px-2 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                    {m.skills.length > 5 && (
                      <span className="text-[10px] text-muted">
                        +{m.skills.length - 5} more
                      </span>
                    )}
                  </div>

                  {/* Tracks */}
                  <div className="flex flex-wrap gap-1.5">
                    {mentorTracks.map((t) => (
                      <span
                        key={t.slug}
                        className="text-[10px] bg-accent/10 text-accent border border-accent/30 rounded px-2 py-0.5"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <span className="text-xs text-muted">From </span>
                      <span className="text-sm font-bold text-ink">
                        {m.consultationPrice} EGP
                      </span>
                      <span className="text-xs text-muted"> / session</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/mentors/${m.id}`}
                        className="text-xs text-muted border border-border rounded-lg px-3 py-1.5 hover:text-ink hover:border-ink transition-colors"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/book?mentor=${m.id}`}
                        className="text-xs bg-accent text-white rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity shadow-[0_0_10px_rgba(230,0,0,0.3)]"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
