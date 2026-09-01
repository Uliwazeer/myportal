"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSession, clearSession, getBookingsByUser, getNotifications, markNotificationsRead, getUnreadCount, getUsers, cancelBookingByIntern, getAllMentors } from "@/lib/store";
import { mentors as staticMentors, tracks } from "@/lib/data";
import type { UserProfile, Booking, MentorData } from "@/lib/data";

const navItems = [
  { label: "Overview", id: "overview" },
  { label: "My Track", id: "track" },
  { label: "Labs", id: "labs" },
  { label: "Consultations", id: "consultations" },
  { label: "Notifications", id: "notifications" },
];

export default function InternDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [mentors, setMentors] = useState<MentorData[]>(staticMentors);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unread, setUnread] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/login"); return; }
    if (s.role !== "intern") { router.replace(`/dashboard/${s.role}`); return; }
    setSession(s);
    setMentors(getAllMentors());
    setBookings(getBookingsByUser(s.id));
    setUnread(getUnreadCount(s.id));
  }, [router]);

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  function handleTabClick(id: string) {
    setActiveTab(id);
    setMobileNavOpen(false);
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

  const mentor = session.mentorId ? mentors.find(m => m.id === session.mentorId) : null;
  const track = session.trackSlug ? tracks.find(t => t.slug === session.trackSlug) : null;
  const upcomingBookings = bookings.filter(b => b.status === "confirmed" || b.status === "upcoming" || b.status === "pending");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const notifications = session ? getNotifications(session.id) : [];

  const progress = track ? Math.min(Math.round((completedBookings.length / 5) * 100), 100) : 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Sidebar + main layout */}
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-border bg-surface sticky top-16 h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent font-bold text-sm">
                {session.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-ink truncate max-w-[100px]">{session.name}</p>
                <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/30 rounded px-1.5 py-0.5">INTERN</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  activeTab === item.id ? "bg-accent text-white" : "text-muted hover:text-ink hover:bg-surface2"
                }`}
              >
                {item.label}
                {item.id === "notifications" && unread > 0 && (
                  <span className="bg-accent text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{unread}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-sm text-muted hover:text-accent transition-colors">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 max-w-4xl">
          {/* Mobile tab bar */}
          <div className="md:hidden flex gap-1 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTab === item.id ? "bg-accent text-white" : "bg-surface text-muted border border-border"
                }`}
              >
                {item.label}{item.id === "notifications" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink">Welcome back, {session.name.split(" ")[0]} 👋</h1>
                <p className="text-muted text-sm mt-1">Here is your learning progress at a glance.</p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Your Level", value: session.level || "—" },
                  { label: "Track", value: track?.name || "Not set" },
                  { label: "Bookings", value: bookings.length.toString() },
                  { label: "Completed", value: completedBookings.length.toString() },
                ].map((stat, i) => (
                  <div key={i} className="bg-surface rounded-xl border border-border p-4">
                    <p className="text-muted text-xs mb-1">{stat.label}</p>
                    <p className="text-ink font-semibold text-sm truncate">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-ink">Learning Progress</h3>
                  <span className="text-accent font-mono text-sm font-bold">{progress}%</span>
                </div>
                <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-accent rounded-full"
                  />
                </div>
                <p className="text-muted text-xs mt-2">{completedBookings.length} sessions completed</p>
              </div>

              {/* Mentor card */}
              {mentor && (
                <div className="bg-surface rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-ink mb-3">Your Mentor</h3>
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-full ${mentor.color} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md`}>
                      {mentor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink">{mentor.name}</p>
                      <p className="text-sm text-muted">{mentor.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm text-ink font-medium">{mentor.rating}</span>
                        <span className="text-xs text-muted">({mentor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mentor.skills.slice(0, 4).map(s => (
                          <span key={s} className="text-[10px] bg-surface2 border border-border text-muted rounded px-1.5 py-0.5">{s}</span>
                        ))}
                      </div>
                    </div>
                    <Link href={`/mentors/${mentor.id}`} className="text-xs text-accent hover:underline shrink-0">View Profile →</Link>
                  </div>
                </div>
              )}

              {/* Upcoming bookings */}
              {upcomingBookings.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-ink mb-3">Upcoming Sessions</h3>
                  <div className="space-y-3">
                    {upcomingBookings.slice(0, 3).map(b => {
                      const bMentor = mentors.find(m => m.id === b.mentorId);
                      const bTrack = tracks.find(t => t.slug === b.trackSlug);
                      return (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-surface2 rounded-lg border border-border">
                          <div>
                            <p className="text-sm font-medium text-ink">{bTrack?.name} with {bMentor?.name}</p>
                            <p className="text-xs text-muted">{b.date} at {b.time} · {b.duration} min</p>
                          </div>
                          <span className={`text-[10px] font-mono rounded px-2 py-0.5 ${
                            b.status === "confirmed" ? "bg-green-900/30 text-green-400 border border-green-800" :
                            "bg-accent/10 text-accent border border-accent/30"
                          }`}>{b.status.toUpperCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/book" className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-xl hover:bg-accent/20 transition-colors">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-medium text-ink text-sm">Book a Session</p>
                    <p className="text-xs text-muted">Schedule a 40 or 60 min consultation</p>
                  </div>
                </Link>
                <Link href="/mentors" className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-surface2 transition-colors">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="font-medium text-ink text-sm">Find a Mentor</p>
                    <p className="text-xs text-muted">Browse all available mentors</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Track tab */}
          {activeTab === "track" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-ink">My Track</h2>
              {track ? (
                <div className="space-y-4">
                  <div className="bg-surface rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-ink">{track.name}</h3>
                        <p className="text-muted text-sm mt-1">{track.tagline}</p>
                        <div className="flex gap-2 mt-3">
                          <span className="text-xs bg-accent/10 text-accent border border-accent/30 rounded px-2 py-0.5">{track.level}</span>
                          <span className="text-xs bg-surface2 text-muted border border-border rounded px-2 py-0.5">{track.durationWeeks} weeks</span>
                        </div>
                      </div>
                      <Link href={`/tracks/${track.slug}`} className="text-sm text-accent hover:underline">View full curriculum →</Link>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {track.modules.map(mod => (
                      <div key={mod.week} className="bg-surface rounded-xl border border-border p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-mono text-accent border border-accent/40 rounded px-1.5 py-0.5">WEEK {mod.week}</span>
                          <h4 className="text-sm font-semibold text-ink">{mod.title}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {mod.topics.map(t => (
                            <span key={t} className="text-xs bg-surface2 text-muted rounded px-2 py-0.5 border border-border">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted">No track assigned yet.</p>
                  <Link href="/tracks" className="text-accent text-sm hover:underline mt-2 block">Browse Tracks →</Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Labs tab */}
          {activeTab === "labs" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-ink">Labs</h2>
              <Link href="/labs" className="inline-block rounded-md bg-accent px-4 py-2 text-sm text-white hover:opacity-90">Browse All Labs →</Link>
            </motion.div>
          )}

          {/* Consultations tab */}
          {activeTab === "consultations" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink">My Consultations</h2>
                <Link href="/book" className="text-sm bg-accent text-white px-4 py-2 rounded-md hover:opacity-90">Book Session</Link>
              </div>
              {bookings.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-xl">
                  <p className="text-muted mb-3">No sessions booked yet.</p>
                  <Link href="/book" className="text-accent text-sm hover:underline">Book your first session →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => {
                    const bMentor = mentors.find(m => m.id === b.mentorId);
                    const bTrack = tracks.find(t => t.slug === b.trackSlug);
                    return (
                      <div key={b.id} className="bg-surface rounded-xl border border-border p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-accent font-semibold bg-accent/10 border border-accent/30 rounded px-1.5 py-0.5">
                                {b.id}
                              </span>
                              <h4 className="font-semibold text-ink">{bTrack?.name || b.trackSlug}</h4>
                            </div>
                            <p className="text-sm text-muted">with {bMentor?.name}</p>
                            <p className="text-xs text-muted mt-1">{b.date} · {b.time} · {b.duration} min</p>
                            {b.topic && <p className="text-xs text-muted mt-0.5">Topic: {b.topic}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono rounded px-2 py-0.5 ${
                              b.status === "completed" ? "bg-green-900/30 text-green-400 border border-green-800" :
                              b.status === "confirmed" || b.status === "upcoming" ? "bg-blue-900/30 text-blue-400 border border-blue-800" :
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

          {/* Notifications tab */}
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
