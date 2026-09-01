"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSession, clearSession, getBookingsByUser, getUnreadCount, markNotificationsRead, getNotifications, cancelBookingByIntern } from "@/lib/store";
import { mentors, tracks } from "@/lib/data";
import type { UserProfile, Booking, Notification } from "@/lib/data";

const navItems = [
  { label: "Overview", id: "overview" },
  { label: "Find a Mentor", id: "find" },
  { label: "My Sessions", id: "sessions" },
  { label: "Notifications", id: "notifications" },
];

export default function ConsultationDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/login"); return; }
    if (s.role !== "consultation") { router.replace(`/dashboard/${s.role}`); return; }
    setSession(s);
    setBookings(getBookingsByUser(s.id));
    setUnread(getUnreadCount(s.id));
    setNotifications(getNotifications(s.id));
  }, [router]);

  function handleLogout() { clearSession(); router.push("/"); }

  function handleTabClick(id: string) {
    setActiveTab(id);
    if (id === "notifications" && session) {
      markNotificationsRead(session.id);
      setUnread(0);
    }
  }

  if (!session) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );

  const upcomingBookings = bookings.filter(b => ["pending","confirmed","upcoming"].includes(b.status));
  const pastBookings = bookings.filter(b => ["completed","cancelled"].includes(b.status));

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-border bg-surface sticky top-16 h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent font-bold text-sm">
                {session.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-ink truncate max-w-[100px]">{session.name}</p>
                <span className="text-[10px] font-mono bg-purple-900/30 text-purple-400 border border-purple-800 rounded px-1.5 py-0.5">CONSULT</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => handleTabClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  activeTab === item.id ? "bg-accent text-white" : "text-muted hover:text-ink hover:bg-surface2"
                }`}>
                {item.label}
                {item.id === "notifications" && unread > 0 && (
                  <span className="bg-accent text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{unread}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-sm text-muted hover:text-accent">Sign Out</button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8 max-w-4xl">
          {/* Mobile tabs */}
          <div className="md:hidden flex gap-1 overflow-x-auto pb-3 mb-6">
            {navItems.map(item => (
              <button key={item.id} onClick={() => handleTabClick(item.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                  activeTab === item.id ? "bg-accent text-white" : "bg-surface text-muted border border-border"
                }`}>
                {item.label}{item.id === "notifications" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink">Welcome, {session.name.split(" ")[0]} 👋</h1>
                <p className="text-muted text-sm mt-1">Get expert help for your IT questions and challenges.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Total Sessions", value: bookings.length.toString() },
                  { label: "Upcoming", value: upcomingBookings.length.toString() },
                  { label: "Completed", value: pastBookings.filter(b => b.status === "completed").length.toString() },
                ].map((s, i) => (
                  <div key={i} className="bg-surface rounded-xl border border-border p-4">
                    <p className="text-muted text-xs mb-1">{s.label}</p>
                    <p className="text-ink font-semibold text-sm">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/book" className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-xl hover:bg-accent/20 transition-colors">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-medium text-ink text-sm">Book a Consultation</p>
                    <p className="text-xs text-muted">40 or 60-minute expert sessions</p>
                  </div>
                </Link>
                <Link href="/mentors" className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-surface2 transition-colors">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="font-medium text-ink text-sm">Browse Mentors</p>
                    <p className="text-xs text-muted">Find the right expert for your needs</p>
                  </div>
                </Link>
              </div>
              {upcomingBookings.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-ink mb-3">Upcoming Sessions</h3>
                  <div className="space-y-2">
                    {upcomingBookings.map(b => {
                      const mentor = mentors.find(m => m.id === b.mentorId);
                      const track = tracks.find(t => t.slug === b.trackSlug);
                      return (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border">
                          <div>
                            <p className="text-sm font-medium text-ink">{track?.name} with {mentor?.name}</p>
                            <p className="text-xs text-muted">{b.date} · {b.time} · {b.duration} min</p>
                          </div>
                          <span className="text-[10px] text-accent border border-accent/30 rounded px-2 py-0.5">{b.status.toUpperCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "find" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-ink">Find a Mentor</h2>
              <div className="grid gap-4">
                {mentors.map(m => {
                  const mentorTracks = tracks.filter(t => m.tracks.includes(t.slug));
                  return (
                    <div key={m.id} className="bg-surface rounded-xl border border-border p-5 flex flex-col md:flex-row md:items-start gap-4">
                      <div className={`h-14 w-14 rounded-full ${m.color} flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md`}>
                        {m.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-ink">{m.name}</h3>
                            <p className="text-sm text-muted">{m.title}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-medium text-ink">{m.rating}</span>
                            <span className="text-xs text-muted">({m.reviewCount})</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/30 rounded px-1.5 py-0.5 font-semibold">
                            {m.completedConsultations} Consultations
                          </span>
                          <span className="text-[10px] text-muted">
                            {m.yearsExperience}+ yrs exp &middot; {m.responseRate}% response
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.skills.slice(0, 4).map(s => (
                            <span key={s} className="text-[10px] bg-surface2 border border-border text-muted rounded px-1.5 py-0.5">{s}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs text-muted">From {m.consultationPrice} EGP / session</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/mentors/${m.id}`} className="text-sm text-muted border border-border rounded-md px-3 py-1.5 hover:text-ink hover:border-ink transition-colors">Profile</Link>
                        <Link href={`/book?mentor=${m.id}`} className="text-sm bg-accent text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity">Book</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "sessions" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink">My Sessions</h2>
                <Link href="/book" className="text-sm bg-accent text-white px-4 py-2 rounded-md hover:opacity-90">Book New</Link>
              </div>
              {bookings.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-xl">
                  <p className="text-muted mb-3">No sessions booked yet.</p>
                  <Link href="/book" className="text-accent text-sm hover:underline">Book your first session →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => {
                    const mentor = mentors.find(m => m.id === b.mentorId);
                    const track = tracks.find(t => t.slug === b.trackSlug);
                    return (
                      <div key={b.id} className="bg-surface rounded-xl border border-border p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-accent font-semibold bg-accent/10 border border-accent/30 rounded px-1.5 py-0.5">
                                {b.id}
                              </span>
                              <h4 className="font-semibold text-ink">{track?.name || b.trackSlug}</h4>
                            </div>
                            <p className="text-sm text-muted">with {mentor?.name}</p>
                            <p className="text-xs text-muted mt-1">{b.date} · {b.time} · {b.duration} min</p>
                            {b.topic && <p className="text-xs text-muted mt-0.5">Topic: {b.topic}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono rounded px-2 py-0.5 ${
                              b.status === "completed" ? "bg-green-900/30 text-green-400 border border-green-800" :
                              b.status === "confirmed" ? "bg-blue-900/30 text-blue-400 border border-blue-800" :
                              b.status === "cancelled" ? "bg-red-900/30 text-red-400 border border-red-800" :
                              "bg-accent/10 text-accent border border-accent/30"
                            }`}>{b.status.toUpperCase()}</span>
                          </div>
                        </div>

                        {(b.status === "pending" || b.status === "confirmed") && (
                          <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-muted">
                              💡 <strong className="text-ink">Cancellation policy:</strong> Full refund if cancelled 12+ hours before session.
                            </span>
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to cancel this booking?")) {
                                  cancelBookingByIntern(b.id);
                                  if (session) setBookings(getBookingsByUser(session.id));
                                }
                              }}
                              className="px-3 py-1 border border-border hover:border-red-500 hover:text-red-400 text-muted rounded-md transition-colors"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-ink">Notifications</h2>
              {notifications.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-xl">
                  <p className="text-muted">No notifications yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl border ${n.read ? "border-border bg-surface" : "border-accent/30 bg-accent/5"}`}>
                      <p className="text-sm text-ink">{n.message}</p>
                      <p className="text-xs text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
