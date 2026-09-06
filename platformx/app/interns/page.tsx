"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getUsers, getAllMentors, syncWithServer } from "@/lib/store";
import { tracks, levels } from "@/lib/data";
import PlatformActivity from "@/components/PlatformActivity";
import type { UserProfile, MentorData } from "@/lib/data";

export default function InternsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterMentor, setFilterMentor] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  function loadData() {
    setUsers(getUsers());
    setMentors(getAllMentors());
  }

  useEffect(() => {
    loadData();
    syncWithServer().then(loadData);
  }, []);

  const interns = users.filter((u) => u.role === "intern");

  const filtered = interns.filter((intern) => {
    const q = search.toLowerCase();
    const mentor = mentors.find((m) => m.id === intern.mentorId);
    const mentorName = mentor?.name || intern.mentorId || "";
    const trackObj = tracks.find((t) => t.slug === intern.trackSlug);
    const trackName = trackObj?.name || intern.trackSlug || "";

    const matchesSearch =
      !q ||
      intern.name.toLowerCase().includes(q) ||
      (intern.university && intern.university.toLowerCase().includes(q)) ||
      mentorName.toLowerCase().includes(q) ||
      trackName.toLowerCase().includes(q);

    const matchesTrack = filterTrack === "all" || intern.trackSlug === filterTrack;
    const matchesMentor = filterMentor === "all" || intern.mentorId === filterMentor;
    const matchesLevel = filterLevel === "all" || intern.level === filterLevel;

    return matchesSearch && matchesTrack && matchesMentor && matchesLevel;
  });

  const uniqueTracksCount = Array.from(new Set(interns.map((i) => i.trackSlug).filter(Boolean))).length;
  const uniqueMentorsCount = Array.from(new Set(interns.map((i) => i.mentorId).filter(Boolean))).length;

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
          className="mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-accent border border-accent/30 rounded px-2 py-0.5">
                INTERNSHIP TRACKING & REGISTRY
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-ink mt-3 mb-2">
                Enrolled Interns
              </h1>
              <p className="text-muted max-w-2xl text-sm md:text-base">
                Public registry of learners, apprentices, and students undergoing structured engineering mentorship programs with dedicated industry mentors.
              </p>
            </div>
            <Link
              href="/register?role=intern"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(230,0,0,0.4)] hover:opacity-90 transition-opacity"
            >
              + Join as an Intern
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted font-mono">Enrolled Interns</p>
            <p className="text-2xl font-bold text-ink mt-1">{interns.length}</p>
            <p className="text-[11px] text-muted mt-0.5">Active apprenticeships</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted font-mono">Active Tracks</p>
            <p className="text-2xl font-bold text-accent mt-1">{uniqueTracksCount || tracks.length}</p>
            <p className="text-[11px] text-muted mt-0.5">Engineering specializations</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted font-mono">Guiding Mentors</p>
            <p className="text-2xl font-bold text-success mt-1">{uniqueMentorsCount || mentors.length}</p>
            <p className="text-[11px] text-muted mt-0.5">Dedicated experts</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted font-mono">Success Rate</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">98%</p>
            <p className="text-[11px] text-muted mt-0.5">Track completion</p>
          </div>
        </div>

        {/* Live Activity & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
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
                    placeholder="Search by intern, mentor, track, or university..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface2 border border-border text-ink placeholder:text-muted rounded-xl text-sm focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${
                      viewMode === "table" ? "bg-accent text-white border-accent" : "bg-surface2 text-muted border-border hover:text-ink"
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${
                      viewMode === "cards" ? "bg-accent text-white border-accent" : "bg-surface2 text-muted border-border hover:text-ink"
                    }`}
                  >
                    Cards View
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                <select
                  value={filterTrack}
                  onChange={(e) => setFilterTrack(e.target.value)}
                  className="px-3 py-2 bg-surface2 border border-border text-ink rounded-lg text-xs focus:border-accent focus:outline-none"
                >
                  <option value="all">All Tracks</option>
                  {tracks.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterMentor}
                  onChange={(e) => setFilterMentor(e.target.value)}
                  className="px-3 py-2 bg-surface2 border border-border text-ink rounded-lg text-xs focus:border-accent focus:outline-none"
                >
                  <option value="all">All Mentors</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 bg-surface2 border border-border text-ink rounded-lg text-xs focus:border-accent focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  {levels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <PlatformActivity />
          </div>
        </div>

        {/* Interns Table / Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl">
            <p className="text-lg font-medium text-ink mb-1">No interns found</p>
            <p className="text-sm text-muted mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearch("");
                setFilterTrack("all");
                setFilterMentor("all");
                setFilterLevel("all");
              }}
              className="text-xs text-accent hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface2/80 font-mono text-muted uppercase text-[11px]">
                    <th className="py-3 px-4">Intern / Apprentice</th>
                    <th className="py-3 px-4">Dedicated Mentor</th>
                    <th className="py-3 px-4">Engineering Track</th>
                    <th className="py-3 px-4">Level & University</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">Status & Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((intern) => {
                    const mentor = mentors.find((m) => m.id === intern.mentorId);
                    const trackObj = tracks.find((t) => t.slug === intern.trackSlug);
                    const trackName = trackObj?.name || intern.trackSlug || "General Track";
                    const progress = intern.progress || 50;

                    return (
                      <tr key={intern.id} className="hover:bg-surface2/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="h-7 w-7 rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                              {intern.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                            <div>
                              <p className="font-semibold text-ink text-sm leading-tight">{intern.name}</p>
                              <span className="text-[10px] text-muted">{intern.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {mentor ? (
                            <Link
                              href={`/mentors/${mentor.id}`}
                              className="font-semibold text-accent hover:underline flex items-center gap-1.5"
                            >
                              <span className="h-5 w-5 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                {mentor.initials}
                              </span>
                              {mentor.name}
                            </Link>
                          ) : (
                            <span className="text-muted font-mono">Assigned Mentor</span>
                          )}
                          <p className="text-[10px] text-muted mt-0.5">{mentor?.title || "Specialist"}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="text-ink font-semibold flex items-center gap-1">
                            🚀 {trackName}
                          </p>
                          <span className="text-[10px] text-muted font-mono">8-week curriculum</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full border border-border bg-surface2 text-[10px] font-mono text-ink font-medium">
                            {intern.level || "Junior"}
                          </span>
                          <p className="text-[10px] text-muted truncate max-w-[160px] mt-0.5">
                            {intern.university || "Engineering"}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-muted">
                          📅 {new Date(intern.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                        </td>

                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-success font-mono font-medium flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                              Active
                            </span>
                            <span className="font-mono text-ink font-semibold">{progress}%</span>
                          </div>
                          <div className="w-full bg-surface2 rounded-full h-1.5 overflow-hidden border border-border/40">
                            <div
                              className="bg-accent h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((intern, idx) => {
              const mentor = mentors.find((m) => m.id === intern.mentorId);
              const trackObj = tracks.find((t) => t.slug === intern.trackSlug);
              const trackName = trackObj?.name || intern.trackSlug || "General Track";
              const progress = intern.progress || 50;

              return (
                <motion.div
                  key={intern.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-border bg-surface hover:border-accent/50 transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-sm flex items-center justify-center shrink-0">
                          {intern.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <div>
                          <h3 className="font-semibold text-ink text-base leading-tight">
                            {intern.name}
                          </h3>
                          <p className="text-xs text-muted truncate max-w-[180px]">
                            {intern.university || "Engineering Student"}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border bg-surface2 text-ink">
                        {intern.level || "Junior"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/60 space-y-2">
                      <div>
                        <span className="text-[11px] text-muted block">Enrolled Track</span>
                        <span className="text-xs font-semibold text-ink">
                          🚀 {trackName}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted block">Assigned Mentor</span>
                        {mentor ? (
                          <Link
                            href={`/mentors/${mentor.id}`}
                            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1.5 mt-0.5"
                          >
                            <span className="h-4 w-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                              {mentor.initials}
                            </span>
                            {mentor.name}
                            <span className="text-[10px] text-muted">({mentor.title})</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted">Dedicated Mentor</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-muted">Track Progress</span>
                          <span className="font-mono text-ink font-semibold">{progress}%</span>
                        </div>
                        <div className="w-full bg-surface2 rounded-full h-1.5 overflow-hidden border border-border/40">
                          <div
                            className="bg-accent h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted">
                    <span>
                      📅 Enrolled: {new Date(intern.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" })}
                    </span>
                    <span className="text-success font-mono flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      Active
                    </span>
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
