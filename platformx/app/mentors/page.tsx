"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { mentors as staticMentors, tracks, levels } from "@/lib/data";
import { getAllMentors } from "@/lib/store";
import type { MentorData } from "@/lib/data";

export default function MentorsPage() {
  const [mentorList, setMentorList] = useState<MentorData[]>(staticMentors);
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [selectedModalMentor, setSelectedModalMentor] = useState<MentorData | null>(null);

  useEffect(() => {
    setMentorList(getAllMentors());
  }, []);

  const filtered = mentorList.filter((m) => {
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
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, title, or skill (e.g. Kubernetes, React)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-ink placeholder:text-muted rounded-xl text-sm focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="px-3.5 py-2.5 bg-surface border border-border text-ink rounded-xl text-sm focus:border-accent focus:outline-none transition-colors"
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
            className="px-3.5 py-2.5 bg-surface border border-border text-ink rounded-xl text-sm focus:border-accent focus:outline-none transition-colors"
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
              const actualConsultations = m.completedConsultations || 0;
              const actualMentees = m.menteesCount || (m.mentoredPeople?.length || 0);

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
                      
                      {/* Stats Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-mono border border-border text-muted rounded px-1.5 py-0.5">
                          {m.level}
                        </span>
                        <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/30 rounded px-2 py-0.5 font-semibold flex items-center gap-1">
                          <span>💬</span> {actualConsultations} Consultations
                        </span>
                        <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded px-2 py-0.5 font-semibold flex items-center gap-1">
                          <span>🎓</span> {actualMentees} Interns Mentored
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">
                    {m.bio}
                  </p>

                  {/* Interactive Button to View Mentored People & Consultations */}
                  <div className="p-3 bg-surface2/60 border border-border/80 rounded-xl flex items-center justify-between">
                    <div className="text-xs text-ink font-medium flex items-center gap-1.5">
                      <span className="text-accent font-bold">●</span>
                      <span>Verified Track Record:</span>
                      <span className="text-muted">{m.mentoredPeople?.length || 0} students recorded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedModalMentor(m)}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      View Student List ({m.mentoredPeople?.length || 0}) →
                    </button>
                  </div>

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

        {/* Modal: People Mentored & Consultations List */}
        {selectedModalMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full ${selectedModalMentor.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {selectedModalMentor.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">{selectedModalMentor.name}</h3>
                    <p className="text-xs text-muted">
                      {selectedModalMentor.completedConsultations} Consultations &middot; {selectedModalMentor.menteesCount || (selectedModalMentor.mentoredPeople?.length || 0)} Interns
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModalMentor(null)}
                  className="p-1.5 text-muted hover:text-ink rounded-lg bg-surface2 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {(!selectedModalMentor.mentoredPeople || selectedModalMentor.mentoredPeople.length === 0) ? (
                  <div className="text-center py-10">
                    <p className="text-muted text-sm">New mentor profile. No public session logs recorded yet.</p>
                    <Link
                      href={`/book?mentor=${selectedModalMentor.id}`}
                      className="mt-3 inline-block text-xs bg-accent text-white rounded-lg px-4 py-2 font-medium"
                    >
                      Be the first to book a session →
                    </Link>
                  </div>
                ) : (
                  selectedModalMentor.mentoredPeople.map((person, idx) => (
                    <div key={idx} className="p-4 bg-surface2 rounded-xl border border-border/70 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-bold text-accent">
                            {person.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink leading-tight">{person.name}</p>
                            <p className="text-xs text-muted">{person.topicOrTrack}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono rounded px-2 py-0.5 border ${
                              person.type === "Internship"
                                ? "bg-blue-950/40 text-blue-400 border-blue-800"
                                : "bg-green-950/40 text-green-400 border-green-800"
                            }`}
                          >
                            {person.type}
                          </span>
                          <span className="text-xs text-yellow-400">★ {person.rating}</span>
                          <span className="text-[11px] text-muted">{person.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted italic pl-10">&ldquo;{person.feedback}&rdquo;</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <Link
                  href={`/mentors/${selectedModalMentor.id}`}
                  className="text-xs text-muted hover:text-ink transition-colors"
                >
                  Go to Full Profile →
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedModalMentor(null)}
                    className="px-4 py-2 text-xs border border-border text-muted hover:text-ink rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    href={`/book?mentor=${selectedModalMentor.id}`}
                    className="px-4 py-2 text-xs bg-accent text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Book Session
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
