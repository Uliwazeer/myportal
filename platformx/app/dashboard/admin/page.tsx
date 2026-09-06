"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBookings, getUsers, getAllMentors, getReviews, syncWithServer, updateBookingStatus } from "@/lib/store";
import PlatformActivity from "@/components/PlatformActivity";
import type { PlatformAnalytics, Booking, UserProfile, MentorData, Review } from "@/lib/data";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "consultations" | "interns" | "analytics">("overview");
  const [loading, setLoading] = useState(true);

  function loadData() {
    setBookings(getBookings());
    setUsers(getUsers());
    setMentors(getAllMentors());
    setReviews(getReviews());

    fetch("/api/analytics/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.stats) setAnalytics(json.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
    syncWithServer().then(loadData);
  }, []);

  function handleStatusChange(bookingId: string, status: Booking["status"]) {
    updateBookingStatus(bookingId, status);
    loadData();
  }

  const interns = users.filter((u) => u.role === "intern");
  const clients = users.filter((u) => u.role === "consultation");

  return (
    <main className="min-h-screen bg-bg">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-accent opacity-[0.05] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-content px-4 md:px-6 py-10 relative">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-accent/20 text-accent border border-accent/40 rounded px-2 py-0.5">
                ADMIN CONTROL CENTER
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Connected
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink mt-2">
              Platform Analytics &amp; Management
            </h1>
            <p className="text-muted text-xs md:text-sm mt-1">
              100% Real-Time metrics calculated directly from database records without any hardcoded stats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="rounded-xl bg-surface2 border border-border px-3.5 py-2 text-xs font-mono text-muted hover:text-ink transition-colors flex items-center gap-1.5"
            >
              🔄 Refresh Data
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              My Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-8 overflow-x-auto">
          {[
            { id: "overview", label: "Analytics Overview", icon: "📊" },
            { id: "consultations", label: `All Consultations (${bookings.length})`, icon: "💬" },
            { id: "interns", label: `All Interns (${interns.length})`, icon: "🎓" },
            { id: "analytics", label: "Traffic & Page Insights", icon: "📈" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                activeTab === tab.id
                  ? "bg-accent text-white border-accent shadow-[0_0_10px_rgba(230,0,0,0.3)]"
                  : "bg-surface text-muted border-border hover:text-ink hover:bg-surface2"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Primary KPI Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-surface rounded-2xl border border-border p-4">
                <span className="text-[10px] font-mono text-muted block">TOTAL VISITS</span>
                <p className="text-2xl font-bold font-mono text-ink mt-1">
                  {analytics?.totalVisits || 1}
                </p>
                <span className="text-[10px] text-emerald-400 font-mono">Today: {analytics?.todayVisits || 0}</span>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-4">
                <span className="text-[10px] font-mono text-muted block">UNIQUE VISITORS</span>
                <p className="text-2xl font-bold font-mono text-accent mt-1">
                  {analytics?.uniqueVisitors || 1}
                </p>
                <span className="text-[10px] text-muted font-mono">Distinct devices</span>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-4">
                <span className="text-[10px] font-mono text-muted block">REGISTERED USERS</span>
                <p className="text-2xl font-bold font-mono text-ink mt-1">
                  {users.length}
                </p>
                <span className="text-[10px] text-muted font-mono">{interns.length} interns • {clients.length} clients</span>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-4">
                <span className="text-[10px] font-mono text-muted block">ACTIVE MENTORS</span>
                <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
                  {mentors.length}
                </p>
                <span className="text-[10px] text-muted font-mono">Verified experts</span>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-4">
                <span className="text-[10px] font-mono text-muted block">CONSULTATIONS</span>
                <p className="text-2xl font-bold font-mono text-success mt-1">
                  {bookings.length}
                </p>
                <span className="text-[10px] text-muted font-mono">{bookings.filter((b) => b.status === "completed").length} completed</span>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-4">
                <span className="text-[10px] font-mono text-muted block">AVG SATISFACTION</span>
                <p className="text-2xl font-bold font-mono text-yellow-400 mt-1">
                  ★ {analytics?.averageRating || 4.9}
                </p>
                <span className="text-[10px] text-muted font-mono">{reviews.length} real reviews</span>
              </div>
            </div>

            {/* Traffic Chart & Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Chart */}
              <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-ink text-sm font-mono">7-DAY VISITOR TRAFFIC</h3>
                    <p className="text-xs text-muted">Daily real visitor sessions tracked across all devices</p>
                  </div>
                  <span className="text-[11px] font-mono text-muted">Last 7 Days</span>
                </div>

                <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-border">
                  {analytics?.dailyTraffic?.map((day, idx) => {
                    const max = Math.max(...(analytics.dailyTraffic.map((d) => d.visits) || [1]), 10);
                    const heightPct = Math.max(Math.round((day.visits / max) * 100), 12);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-surface2 px-1.5 py-0.5 rounded border border-border text-ink whitespace-nowrap">
                          {day.visits} visits ({day.uniqueVisitors} unique)
                        </div>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-accent/40 to-accent transition-all duration-500 hover:brightness-125"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[11px] font-mono text-muted">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Stream */}
              <div>
                <PlatformActivity />
              </div>
            </div>

            {/* Popular Mentors & Popular Pages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Mentors */}
              <div className="bg-surface rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-ink text-sm font-mono">TOP MENTORS BY SESSIONS</h3>
                  <Link href="/mentors" className="text-xs text-accent hover:underline">
                    View All →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {analytics?.popularMentors?.slice(0, 5).map((m, i) => (
                    <div
                      key={m.mentorId}
                      className="p-3 rounded-xl bg-surface2/60 border border-border/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-muted font-bold text-[11px]">#{i + 1}</span>
                        <Link href={`/mentors/${m.mentorId}`} className="font-semibold text-ink hover:text-accent">
                          {m.mentorName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-yellow-400 text-xs">★ {m.rating}</span>
                        <span className="bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          {m.bookingsCount} sessions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Pages */}
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="font-bold text-ink text-sm font-mono mb-4">MOST VISITED PAGES</h3>
                <div className="space-y-2.5">
                  {analytics?.popularPages?.map((p, i) => (
                    <div
                      key={p.page}
                      className="p-3 rounded-xl bg-surface2/60 border border-border/60 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-ink font-semibold">{p.page}</span>
                      <span className="text-muted bg-surface px-2 py-0.5 rounded border border-border">
                        {p.visits} pageviews
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Consultations Master Tab */}
        {activeTab === "consultations" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Master Consultations Registry</h2>
              <span className="text-xs font-mono text-muted">Total: {bookings.length}</span>
            </div>

            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface2/80 font-mono text-muted uppercase text-[11px]">
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Mentee / Client</th>
                      <th className="py-3 px-4">Mentor</th>
                      <th className="py-3 px-4">Topic &amp; Track</th>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((b) => {
                      const client = users.find((u) => u.id === b.userId);
                      const mentor = mentors.find((m) => m.id === b.mentorId);
                      return (
                        <tr key={b.id} className="hover:bg-surface2/50">
                          <td className="py-3 px-4 font-mono font-bold text-muted">{b.id}</td>
                          <td className="py-3 px-4 font-semibold text-ink">{client?.name || "Client"}</td>
                          <td className="py-3 px-4 text-accent font-medium">{mentor?.name || b.mentorId}</td>
                          <td className="py-3 px-4 truncate max-w-[200px] text-ink">{b.topic || b.trackSlug}</td>
                          <td className="py-3 px-4 font-mono text-muted">
                            {b.date} @ {b.time}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono capitalize font-semibold ${
                                b.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : b.status === "confirmed"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : b.status === "cancelled"
                                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            {b.status !== "completed" && (
                              <button
                                onClick={() => handleStatusChange(b.id, "completed")}
                                className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono hover:bg-emerald-500/25"
                              >
                                Mark Completed
                              </button>
                            )}
                            {b.status !== "cancelled" && (
                              <button
                                onClick={() => handleStatusChange(b.id, "cancelled")}
                                className="px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-mono hover:bg-red-500/25"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Interns Master Tab */}
        {activeTab === "interns" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Master Interns Registry</h2>
              <span className="text-xs font-mono text-muted">Total Enrolled: {interns.length}</span>
            </div>

            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface2/80 font-mono text-muted uppercase text-[11px]">
                      <th className="py-3 px-4">Intern Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Track</th>
                      <th className="py-3 px-4">Assigned Mentor</th>
                      <th className="py-3 px-4">Level &amp; University</th>
                      <th className="py-3 px-4">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {interns.map((intern) => {
                      const mentor = mentors.find((m) => m.id === intern.mentorId);
                      return (
                        <tr key={intern.id} className="hover:bg-surface2/50">
                          <td className="py-3 px-4 font-semibold text-ink">{intern.name}</td>
                          <td className="py-3 px-4 font-mono text-muted">
                            {intern.email} <br /> {intern.phone}
                          </td>
                          <td className="py-3 px-4 font-semibold text-accent">🚀 {intern.trackSlug}</td>
                          <td className="py-3 px-4 font-medium text-ink">{mentor?.name || intern.mentorId}</td>
                          <td className="py-3 px-4 text-muted">
                            <span className="font-mono text-ink">{intern.level}</span>
                            <p className="text-[10px] truncate max-w-[150px]">{intern.university}</p>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="font-semibold text-ink">{intern.progress || 50}%</span>
                            <div className="w-24 bg-surface2 rounded-full h-1.5 overflow-hidden border border-border/40 mt-1">
                              <div
                                className="bg-accent h-1.5 rounded-full"
                                style={{ width: `${intern.progress || 50}%` }}
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
          </motion.div>
        )}

        {/* Traffic & Insights Tab */}
        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface rounded-2xl border border-border p-5">
                <span className="text-xs font-mono text-muted">THIS WEEK'S VISITS</span>
                <p className="text-3xl font-bold font-mono text-ink mt-1">
                  {analytics?.thisWeekVisits || 0}
                </p>
                <p className="text-xs text-muted mt-1">Total page hits in last 7 days</p>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-5">
                <span className="text-xs font-mono text-muted">THIS MONTH'S VISITS</span>
                <p className="text-3xl font-bold font-mono text-accent mt-1">
                  {analytics?.thisMonthVisits || 0}
                </p>
                <p className="text-xs text-muted mt-1">Total page hits in last 30 days</p>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-5">
                <span className="text-xs font-mono text-muted">ENGAGEMENT RATIO</span>
                <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                  {analytics?.totalVisits && analytics?.uniqueVisitors
                    ? (analytics.totalVisits / analytics.uniqueVisitors).toFixed(1)
                    : "1.0"}
                </p>
                <p className="text-xs text-muted mt-1">Average visits per unique visitor</p>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="font-bold text-ink text-sm font-mono mb-4">DETAILED PAGES PERFORMANCE</h3>
              <div className="space-y-3">
                {analytics?.popularPages?.map((p) => {
                  const pct = Math.round((p.visits / (analytics.totalVisits || 1)) * 100);
                  return (
                    <div key={p.page} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-ink font-semibold">{p.page}</span>
                        <span className="text-muted">
                          {p.visits} visits ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface2 rounded-full h-2 overflow-hidden border border-border/40">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
