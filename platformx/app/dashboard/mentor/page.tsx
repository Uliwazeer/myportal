"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSession, clearSession, getBookingsByMentor, getReviewsByMentor, getUnreadCount, markNotificationsRead, getNotifications, confirmBookingByMentor, declineBookingByMentor } from "@/lib/store";
import { tracks } from "@/lib/data";
import type { UserProfile, Booking, Review, Notification } from "@/lib/data";

const navItems = [
  { label: "Overview", id: "overview" },
  { label: "Bookings", id: "bookings" },
  { label: "Reviews", id: "reviews" },
  { label: "Availability", id: "availability" },
  { label: "Notifications", id: "notifications" },
];

export default function MentorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/login"); return; }
    if (s.role !== "mentor") { router.replace(`/dashboard/${s.role}`); return; }
    setSession(s);
    setBookings(getBookingsByMentor(s.id));
    setReviews(getReviewsByMentor(s.id));
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

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const pendingBookings = bookings.filter(b => b.status === "pending" || b.status === "confirmed" || b.status === "upcoming");
  const completedBookings = bookings.filter(b => b.status === "completed");

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
                <span className="text-[10px] font-mono bg-blue-900/30 text-blue-400 border border-blue-800 rounded px-1.5 py-0.5">MENTOR</span>
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
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-sm text-muted hover:text-accent transition-colors">Sign Out</button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8 max-w-4xl">
          {/* Mobile tab bar */}
          <div className="md:hidden flex gap-1 overflow-x-auto pb-3 mb-6">
            {navItems.map(item => (
              <button key={item.id} onClick={() => handleTabClick(item.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTab === item.id ? "bg-accent text-white" : "bg-surface text-muted border border-border"
                }`}>
                {item.label}{item.id === "notifications" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink">Mentor Dashboard</h1>
                <p className="text-muted text-sm mt-1">Welcome back, {session.name.split(" ")[0]} 👋</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Bookings", value: bookings.length.toString() },
                  { label: "Completed", value: completedBookings.length.toString() },
                  { label: "Avg Rating", value: `${avgRating} ★` },
                  { label: "Reviews", value: reviews.length.toString() },
                ].map((s, i) => (
                  <div key={i} className="bg-surface rounded-xl border border-border p-4">
                    <p className="text-muted text-xs mb-1">{s.label}</p>
                    <p className="text-ink font-semibold text-sm">{s.value}</p>
                  </div>
                ))}
              </div>
              {pendingBookings.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-ink mb-3">Upcoming Sessions ({pendingBookings.length})</h3>
                  <div className="space-y-2">
                    {pendingBookings.slice(0, 3).map(b => {
                      const t = tracks.find(tr => tr.slug === b.trackSlug);
                      return (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border">
                          <div>
                            <p className="text-sm font-medium text-ink">{t?.name || b.trackSlug}</p>
                            <p className="text-xs text-muted">{b.date} · {b.time} · {b.duration} min</p>
                          </div>
                          <span className="text-[10px] text-accent border border-accent/30 rounded px-2 py-0.5">{b.status.toUpperCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {reviews.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-ink mb-3">Recent Reviews</h3>
                  <div className="space-y-3">
                    {reviews.slice(0, 2).map(r => (
                      <div key={r.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                          <span className="text-xs text-muted">{r.userName}</span>
                        </div>
                        <p className="text-sm text-muted">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "bookings" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-ink">Bookings Management</h2>
              {bookings.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-xl">
                  <p className="text-muted">No bookings yet. Students will book sessions with you once your profile is visible.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => {
                    const t = tracks.find(tr => tr.slug === b.trackSlug);
                    return (
                      <div key={b.id} className="bg-surface rounded-xl border border-border p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-accent font-semibold bg-accent/10 border border-accent/30 rounded px-1.5 py-0.5">
                                {b.id}
                              </span>
                              <h4 className="font-semibold text-ink">{t?.name || b.trackSlug}</h4>
                            </div>
                            <p className="text-sm text-muted">{b.date} · {b.time} · {b.duration} min</p>
                            {b.topic && <p className="text-xs text-muted mt-1">Topic: {b.topic}</p>}
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

                        {b.status === "pending" && (
                          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                            <p className="text-xs text-yellow-400">⚡ Awaiting your confirmation</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  confirmBookingByMentor(b.id);
                                  if (session) setBookings(getBookingsByMentor(session.id));
                                }}
                                className="px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                              >
                                Confirm Session
                              </button>
                              <button
                                onClick={() => {
                                  declineBookingByMentor(b.id);
                                  if (session) setBookings(getBookingsByMentor(session.id));
                                }}
                                className="px-3 py-1.5 text-xs border border-border hover:border-red-500 hover:text-red-400 text-muted rounded-lg transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-ink">Reviews</h2>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="text-ink font-bold">{avgRating}</span>
                  <span className="text-muted text-xs">({reviews.length} reviews)</span>
                </div>
              </div>
              {reviews.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-xl">
                  <p className="text-muted">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-surface rounded-xl border border-border p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-yellow-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                            <span className="text-sm font-medium text-ink">{r.userName}</span>
                          </div>
                          <p className="text-sm text-muted">{r.comment}</p>
                        </div>
                        <span className="text-xs text-muted shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "availability" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-ink">Availability</h2>
              <div className="bg-surface rounded-xl border border-border p-5">
                <p className="text-muted text-sm">Your availability settings are configured in your mentor profile. Contact admin to update your schedule.</p>
                <div className="mt-4 space-y-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                    <div key={day} className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border">
                      <span className="text-sm text-ink">{day}</span>
                      <span className="text-xs text-muted">Not set</span>
                    </div>
                  ))}
                </div>
              </div>
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
