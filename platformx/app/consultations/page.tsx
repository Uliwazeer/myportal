"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBookings, getUsers, getAllMentors, getReviews, syncWithServer } from "@/lib/store";
import { tracks } from "@/lib/data";
import PlatformActivity from "@/components/PlatformActivity";
import type { Booking, UserProfile, MentorData, Review } from "@/lib/data";

export default function ConsultationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [filterMentor, setFilterMentor] = useState("all");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  function loadData() {
    setBookings(getBookings());
    setUsers(getUsers());
    setMentors(getAllMentors());
    setReviews(getReviews());
  }

  useEffect(() => {
    loadData();
    syncWithServer().then(loadData);
  }, []);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const user = users.find((u) => u.id === b.userId);
    const mentor = mentors.find((m) => m.id === b.mentorId);
    const userName = user?.name || "Client";
    const mentorName = mentor?.name || b.mentorId;
    const topic = b.topic || "";

    const matchesSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      userName.toLowerCase().includes(q) ||
      mentorName.toLowerCase().includes(q) ||
      topic.toLowerCase().includes(q);

    const matchesMentor = filterMentor === "all" || b.mentorId === filterMentor;
    const matchesTrack = filterTrack === "all" || b.trackSlug === filterTrack;
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;

    return matchesSearch && matchesMentor && matchesTrack && matchesStatus;
  });

  const totalCompleted = bookings.filter((b) => b.status === "completed").length;
  const totalUpcoming = bookings.filter((b) => ["confirmed", "upcoming", "pending"].includes(b.status)).length;
  const uniqueClients = Array.from(new Set(bookings.map((b) => b.userId))).length;

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
                DATABASE & REGISTRY
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-ink mt-3 mb-2">
                Consultations Registry
              </h1>
              <p className="text-muted max-w-2xl text-sm md:text-base">
                Centralized transparent record of technical 1-on-1 consultations, system architecture reviews, and mentorship sessions held on Mentorship Platform.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/book"
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(230,0,0,0.4)] hover:opacity-90 transition-opacity"
              >
                + Book a Consultation
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted font-mono">Total Bookings</p>
            <p className="text-2xl font-bold text-ink mt-1">{bookings.length}</p>
            <p className="text-[11px] text-muted mt-0.5">Across all tracks</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted font-mono">Completed Sessions</p>
            <p className="text-2xl font-bold text-success mt-1">{totalCompleted}</p>
            <p className="text-[11px] text-muted mt-0.5">Successfully held</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted font-mono">Upcoming / Confirmed</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{totalUpcoming}</p>
            <p className="text-[11px] text-muted mt-0.5">Scheduled sessions</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted font-mono">Unique Clients</p>
            <p className="text-2xl font-bold text-accent mt-1">{uniqueClients}</p>
            <p className="text-[11px] text-muted mt-0.5">Learners & Engineers</p>
          </div>
        </div>

        {/* Live Activity Stream & Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Filters */}
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
                    placeholder="Search by mentee, mentor, topic, or ID..."
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

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-muted mr-1 font-mono">Status:</span>
                {["all", "upcoming", "confirmed", "completed", "pending", "cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-full text-xs font-mono capitalize transition-all border ${
                      filterStatus === st
                        ? "bg-accent/20 border-accent text-accent font-semibold"
                        : "bg-surface2 border-border/60 text-muted hover:text-ink"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Mentor & Track Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                <select
                  value={filterMentor}
                  onChange={(e) => setFilterMentor(e.target.value)}
                  className="px-3 py-2 bg-surface2 border border-border text-ink rounded-lg text-xs focus:border-accent focus:outline-none"
                >
                  <option value="all">All Mentors</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.title})
                    </option>
                  ))}
                </select>

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
              </div>
            </div>
          </div>

          <div>
            <PlatformActivity />
          </div>
        </div>

        {/* Consultations Table / Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl">
            <p className="text-lg font-medium text-ink mb-1">No consultations found</p>
            <p className="text-sm text-muted mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearch("");
                setFilterMentor("all");
                setFilterTrack("all");
                setFilterStatus("all");
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
                    <th className="py-3 px-4">Mentee / Client</th>
                    <th className="py-3 px-4">Mentor</th>
                    <th className="py-3 px-4">Topic & Track</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Review & Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((b) => {
                    const client = users.find((u) => u.id === b.userId);
                    const mentor = mentors.find((m) => m.id === b.mentorId);
                    const clientName = client?.name || "Client";
                    const mentorName = mentor?.name || b.mentorId;
                    const trackObj = tracks.find((t) => t.slug === b.trackSlug);
                    const trackName = trackObj?.name || b.trackSlug;
                    const review = reviews.find((r) => r.bookingId === b.id || (r.userId === b.userId && r.mentorId === b.mentorId));

                    const statusColor =
                      b.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : b.status === "confirmed"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : b.status === "rescheduled"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : b.status === "cancelled"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/30";

                    return (
                      <tr key={b.id} className="hover:bg-surface2/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-accent/20 border border-accent/40 text-[10px] font-bold text-accent flex items-center justify-center shrink-0">
                              {clientName[0]?.toUpperCase()}
                            </span>
                            <div>
                              <p className="font-semibold text-ink">{clientName}</p>
                              <span className="font-mono text-[10px] text-muted">{b.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Link
                            href={`/mentors/${mentor?.id || b.mentorId}`}
                            className="font-semibold text-accent hover:underline flex items-center gap-1.5"
                          >
                            <span className="h-5 w-5 rounded-full bg-surface2 border border-border text-[9px] font-bold text-ink flex items-center justify-center shrink-0">
                              {mentor?.initials || mentorName[0]?.toUpperCase()}
                            </span>
                            {mentorName}
                          </Link>
                          <p className="text-[10px] text-muted mt-0.5">{mentor?.title || "Specialist"}</p>
                        </td>

                        <td className="py-3.5 px-4 max-w-[220px]">
                          <p className="text-ink font-medium truncate">{b.topic || trackName}</p>
                          <span className="text-[10px] text-muted font-mono">🚀 {trackName}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <p className="text-ink font-medium">📅 {b.date}</p>
                          <p className="text-muted text-[11px]">⏰ {b.time} ({b.duration}m)</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-mono capitalize font-medium ${statusColor}`}>
                            {b.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-[240px]">
                          {review ? (
                            <div>
                              <div className="text-yellow-400 font-bold text-xs tracking-wider">
                                {"★".repeat(review.rating)}
                                <span className="text-muted font-normal text-[11px] ml-1">({review.rating}.0)</span>
                              </div>
                              <p className="text-muted text-[11px] italic truncate mt-0.5" title={review.comment}>
                                "{review.comment}"
                              </p>
                            </div>
                          ) : b.status === "completed" ? (
                            <span className="text-muted text-[11px] italic">Verified completion</span>
                          ) : (
                            <span className="text-muted text-[11px] font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => {
              const client = users.find((u) => u.id === b.userId);
              const mentor = mentors.find((m) => m.id === b.mentorId);
              const clientName = client?.name || "Client";
              const mentorName = mentor?.name || b.mentorId;
              const trackObj = tracks.find((t) => t.slug === b.trackSlug);
              const trackName = trackObj?.name || b.trackSlug;
              const review = reviews.find((r) => r.bookingId === b.id || (r.userId === b.userId && r.mentorId === b.mentorId));

              const statusColor =
                b.status === "completed"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : b.status === "confirmed"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : b.status === "rescheduled"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : b.status === "cancelled"
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : "bg-purple-500/10 text-purple-400 border-purple-500/30";

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-surface hover:border-border/80 transition-all p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted font-bold">
                        {b.id}
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${statusColor} capitalize font-medium`}>
                        {b.status}
                      </span>
                      {b.sessionType && (
                        <span className="text-[11px] font-mono bg-surface2 border border-border text-muted px-2 py-0.5 rounded-md">
                          {b.sessionType}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      <div>
                        <p className="text-xs text-muted">Learner / Client</p>
                        <p className="text-sm font-semibold text-ink flex items-center gap-1.5 mt-0.5">
                          <span className="h-5 w-5 rounded-full bg-surface2 border border-border text-[10px] font-bold text-accent flex items-center justify-center">
                            {clientName[0]?.toUpperCase()}
                          </span>
                          {clientName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted">Assigned Mentor</p>
                        <Link
                          href={`/mentors/${mentor?.id || b.mentorId}`}
                          className="text-sm font-semibold text-accent hover:underline flex items-center gap-1.5 mt-0.5"
                        >
                          <span className="h-5 w-5 rounded-full bg-accent/20 border border-accent/40 text-[10px] font-bold text-accent flex items-center justify-center">
                            {mentor?.initials || mentorName[0]?.toUpperCase()}
                          </span>
                          {mentorName}
                          <span className="text-[10px] text-muted">({mentor?.title || "Mentor"})</span>
                        </Link>
                      </div>
                    </div>

                    <div className="pt-1">
                      <p className="text-xs text-muted">Topic & Track</p>
                      <p className="text-sm text-ink font-medium">
                        {b.topic || `${trackName} technical consultation`}
                        <span className="ml-2 text-xs text-muted font-normal">
                          • {trackName}
                        </span>
                      </p>
                    </div>

                    {review && (
                      <div className="mt-2 p-2.5 rounded-lg bg-surface2/60 border border-border text-xs">
                        <div className="text-yellow-400 font-bold text-xs">
                          {"★".repeat(review.rating)} <span className="text-muted font-normal ml-1">Verified Review</span>
                        </div>
                        <p className="text-muted italic mt-0.5">"{review.comment}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-6 shrink-0 gap-2">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-muted">Date & Time</p>
                      <p className="text-sm font-mono font-medium text-ink">
                        📅 {b.date}
                      </p>
                      <p className="text-xs font-mono text-muted">
                        ⏰ {b.time} ({b.duration} mins)
                      </p>
                    </div>

                    <Link
                      href={`/book?mentor=${mentor?.id || b.mentorId}&track=${b.trackSlug}`}
                      className="rounded-lg border border-border hover:border-accent hover:text-accent bg-surface2 px-3 py-1.5 text-xs text-ink transition-colors font-medium"
                    >
                      Book Session →
                    </Link>
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
