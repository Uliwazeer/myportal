"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSession, clearSession, getBookingsByMentor, getReviewsByMentor, getUnreadCount, markNotificationsRead, getNotifications, confirmBookingByMentor, declineBookingByMentor, completeBookingByMentor, cancelBookingByMentor, getUsers, syncWithServer, getSessionNotesByMentor, saveSessionNote, toggleHomework } from "@/lib/store";
import { tracks } from "@/lib/data";
import type { UserProfile, Booking, Review, Notification, SessionNote } from "@/lib/data";

const navItems = [
  { label: "Overview", id: "overview" },
  { label: "Bookings", id: "bookings" },
  { label: "Session Notes & Homework", id: "notes" },
  { label: "Reviews", id: "reviews" },
  { label: "Availability", id: "availability" },
  { label: "Notifications", id: "notifications" },
];

export default function MentorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Note creation form state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState("");
  const [noteTopics, setNoteTopics] = useState("");
  const [noteHw1, setNoteHw1] = useState("");
  const [noteHw2, setNoteHw2] = useState("");
  const [noteAdvice, setNoteAdvice] = useState("");
  const [noteNextFocus, setNoteNextFocus] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/login"); return; }
    if (s.role !== "mentor") { router.replace(`/dashboard/${s.role}`); return; }
    setSession(s);
    setBookings(getBookingsByMentor(s));
    setReviews(getReviewsByMentor(s.id));
    setSessionNotes(getSessionNotesByMentor(s.id));
    setUnread(getUnreadCount(s.id));
    setNotifications(getNotifications(s.id));

    syncWithServer().then(() => {
      const updatedS = getSession();
      if (updatedS) {
        setSession(updatedS);
        setBookings(getBookingsByMentor(updatedS));
        setReviews(getReviewsByMentor(updatedS.id));
        setSessionNotes(getSessionNotesByMentor(updatedS.id));
        setUnread(getUnreadCount(updatedS.id));
        setNotifications(getNotifications(updatedS.id));
      }
    });
  }, [router]);

  function handleLogout() { clearSession(); router.push("/"); }

  function showMessage(msg: string) {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  }

  function handleConfirm(bookingId: string) {
    confirmBookingByMentor(bookingId);
    if (session) setBookings(getBookingsByMentor(session));
    showMessage(`✅ Session [${bookingId}] has been successfully confirmed!`);
  }

  function handleDecline(bookingId: string) {
    if (confirm("Are you sure you want to decline / cancel this session booking?")) {
      declineBookingByMentor(bookingId);
      if (session) setBookings(getBookingsByMentor(session));
      showMessage(`⚠️ Session [${bookingId}] has been cancelled/declined.`);
    }
  }

  function handleComplete(bookingId: string) {
    completeBookingByMentor(bookingId);
    if (session) setBookings(getBookingsByMentor(session));
    showMessage(`🎓 Session [${bookingId}] marked as Completed!`);
  }

  function handleTabClick(id: string) {
    setActiveTab(id);
    if (id === "notifications" && session) {
      markNotificationsRead(session.id);
      setUnread(0);
    }
  }

  function handleToggleHw(noteId: string, hwId: string) {
    toggleHomework(noteId, hwId);
    if (session) {
      setSessionNotes(getSessionNotesByMentor(session.id));
    }
  }

  function handleOpenNoteEditorForBooking(bookingId: string) {
    setTargetBookingId(bookingId);
    setShowNoteForm(true);
    setActiveTab("notes");
  }

  function handleCreateNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !targetBookingId) return;

    const bk = bookings.find((b) => b.id === targetBookingId);
    const users = getUsers();
    const student = bk ? users.find((u) => u.id === bk.userId) : null;

    const topics = noteTopics
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const hwItems = [];
    if (noteHw1.trim()) {
      hwItems.push({ id: "hw-" + Date.now() + "-1", task: noteHw1.trim(), completed: false });
    }
    if (noteHw2.trim()) {
      hwItems.push({ id: "hw-" + Date.now() + "-2", task: noteHw2.trim(), completed: false });
    }

    saveSessionNote({
      bookingId: targetBookingId,
      mentorId: session.id,
      mentorName: session.name,
      userId: bk?.userId || "student-1",
      userName: student?.name || "Student",
      date: bk?.date || new Date().toISOString().split("T")[0],
      topicsDiscussed: topics.length > 0 ? topics : ["Architecture review & debugging session"],
      homework: hwItems,
      nextSessionFocus: noteNextFocus || "Advanced milestone implementation",
      mentorAdvice: noteAdvice || "Keep practicing hands-on problem solving and review fundamentals.",
      recommendedResources: [
        { title: "Platform Architecture Lab", url: "/labs", type: "Lab" },
      ],
    });

    setSessionNotes(getSessionNotesByMentor(session.id));
    setShowNoteForm(false);
    setTargetBookingId("");
    setNoteTopics("");
    setNoteHw1("");
    setNoteHw2("");
    setNoteAdvice("");
    setNoteNextFocus("");
    showMessage("📝 Session notes & action items published to student!");
  }

  if (!session) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const confirmedBookings = bookings.filter(b => b.status === "confirmed" || b.status === "upcoming");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const cancelledBookings = bookings.filter(b => b.status === "cancelled");

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    if (bookingFilter === "pending") return b.status === "pending";
    if (bookingFilter === "confirmed") return b.status === "confirmed" || b.status === "upcoming";
    if (bookingFilter === "completed") return b.status === "completed";
    if (bookingFilter === "cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-bg">
      {/* Action toast message */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-accent text-ink px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-sm font-semibold">{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-muted hover:text-ink text-xs">✕</button>
        </div>
      )}

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
                <span>{item.label}</span>
                {item.id === "bookings" && pendingBookings.length > 0 && (
                  <span className="bg-amber-500 text-black text-[10px] font-bold rounded-full h-4 px-1.5 flex items-center justify-center animate-pulse">
                    {pendingBookings.length}
                  </span>
                )}
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
                {item.label}
                {item.id === "bookings" && pendingBookings.length > 0 ? ` (${pendingBookings.length})` : ""}
                {item.id === "notifications" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink">Mentor Dashboard</h1>
                <p className="text-muted text-sm mt-1">Welcome back, {session.name.split(" ")[0]} 👋</p>
              </div>

              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Pending Confirmation", value: pendingBookings.length.toString(), highlight: pendingBookings.length > 0 },
                  { label: "Active Sessions", value: confirmedBookings.length.toString() },
                  { label: "Completed Sessions", value: completedBookings.length.toString() },
                  { label: "Avg Rating", value: `${avgRating} ★` },
                ].map((s, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${s.highlight ? "bg-amber-500/10 border-amber-500/40" : "bg-surface border-border"}`}>
                    <p className="text-muted text-xs mb-1">{s.label}</p>
                    <p className={`font-semibold text-base ${s.highlight ? "text-amber-400 font-bold" : "text-ink"}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Pending Requests Alert */}
              {pendingBookings.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <span>⚡</span> Pending Sessions Awaiting Confirmation ({pendingBookings.length})
                    </h3>
                    <button
                      onClick={() => { setActiveTab("bookings"); setBookingFilter("pending"); }}
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pendingBookings.map((b) => {
                      const t = tracks.find((tr) => tr.slug === b.trackSlug);
                      const student = getUsers().find((u) => u.id === b.userId);
                      return (
                        <div key={b.id} className="flex flex-wrap items-center justify-between p-3.5 bg-surface rounded-xl border border-border gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 border border-accent/30 rounded px-1.5 py-0.2">
                                {b.id}
                              </span>
                              <p className="text-sm font-semibold text-ink">{t?.name || b.trackSlug}</p>
                            </div>
                            <p className="text-xs text-muted">
                              Client: <strong className="text-ink">{student?.name || "Student"}</strong> · {b.date} at {b.time} ({b.duration} min)
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleConfirm(b.id)}
                              className="px-3.5 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all shadow-sm"
                            >
                              ✓ Confirm Session
                            </button>
                            <button
                              onClick={() => handleDecline(b.id)}
                              className="px-3 py-1.5 text-xs border border-border hover:border-red-500 hover:text-red-400 text-muted rounded-lg transition-colors"
                            >
                              ✕ Decline
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming Confirmed Sessions */}
              {confirmedBookings.length > 0 && (
                <div className="bg-surface rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-ink">Upcoming Confirmed Sessions ({confirmedBookings.length})</h3>
                    <button onClick={() => { setActiveTab("bookings"); setBookingFilter("confirmed"); }} className="text-xs text-accent hover:underline">
                      Manage →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {confirmedBookings.slice(0, 3).map((b) => {
                      const t = tracks.find((tr) => tr.slug === b.trackSlug);
                      const student = getUsers().find((u) => u.id === b.userId);
                      return (
                        <div key={b.id} className="flex flex-wrap items-center justify-between p-3 bg-surface2 rounded-xl border border-border gap-2">
                          <div>
                            <p className="text-sm font-medium text-ink">{t?.name || b.trackSlug} with {student?.name || "Student"}</p>
                            <p className="text-xs text-muted">{b.date} at {b.time} · {b.duration} min</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleComplete(b.id)}
                              className="px-2.5 py-1 text-xs font-medium bg-accent text-white rounded-md hover:opacity-90 transition-opacity"
                            >
                              🎓 Mark Done
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Reviews */}
              {reviews.length > 0 && (
                <div className="bg-surface rounded-2xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-ink mb-3">Recent Reviews</h3>
                  <div className="space-y-3">
                    {reviews.slice(0, 2).map((r) => (
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-ink">Bookings Management</h2>
                  <p className="text-sm text-muted">
                    Confirm incoming student requests, mark completed sessions, and manage your calendar.
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-surface rounded-xl border border-border">
                {[
                  { id: "all", label: `All (${bookings.length})` },
                  { id: "pending", label: `Pending (${pendingBookings.length})`, alert: pendingBookings.length > 0 },
                  { id: "confirmed", label: `Confirmed (${confirmedBookings.length})` },
                  { id: "completed", label: `Completed (${completedBookings.length})` },
                  { id: "cancelled", label: `Cancelled (${cancelledBookings.length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBookingFilter(f.id as typeof bookingFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      bookingFilter === f.id
                        ? "bg-accent text-white shadow-sm"
                        : "text-muted hover:text-ink hover:bg-surface2"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface/50 p-6 space-y-2">
                  <div className="text-3xl">📅</div>
                  <p className="text-base font-semibold text-ink">No bookings found in this filter</p>
                  <p className="text-xs text-muted">Select "All" to view your complete mentorship history.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((b) => {
                    const t = tracks.find((tr) => tr.slug === b.trackSlug);
                    const student = getUsers().find((u) => u.id === b.userId);
                    return (
                      <div key={b.id} className="bg-surface rounded-2xl border border-border p-5 md:p-6 space-y-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono text-xs text-accent font-bold bg-accent/10 border border-accent/30 rounded px-2 py-0.5">
                                {b.id}
                              </span>
                              <h4 className="font-bold text-base text-ink">{t?.name || b.trackSlug}</h4>
                            </div>
                            <p className="text-sm text-ink font-medium">
                              Client: <strong className="text-ink">{student ? student.name : "Student / Intern"}</strong>
                              {student && (
                                <span className="text-xs font-mono bg-surface2 text-muted border border-border px-2 py-0.5 rounded ml-2">
                                  {student.role === "intern" ? "Enrolled Intern" : "Consultation Client"}
                                </span>
                              )}
                              {student?.email && <span className="text-muted text-xs ml-2 font-mono">&lt;{student.email}&gt;</span>}
                            </p>
                            <p className="text-xs text-muted mt-1">
                              📅 <strong>{b.date}</strong> at <strong>{b.time}</strong> · {b.duration} min duration
                            </p>
                            {b.topic && (
                              <p className="text-xs text-muted mt-1 bg-surface2/60 border border-border p-2 rounded-lg">
                                <strong>Topic / Question:</strong> {b.topic}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold rounded-full px-2.5 py-1 ${
                              b.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                              b.status === "confirmed" || b.status === "upcoming" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                              b.status === "cancelled" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                            }`}>
                              ● {b.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons Bar */}
                        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                          {b.status === "pending" && (
                            <div className="flex flex-wrap items-center justify-between w-full gap-2 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                              <p className="text-xs text-amber-400 font-medium">
                                ⚡ New booking request — please accept or decline:
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleConfirm(b.id)}
                                  className="px-4 py-2 text-xs font-bold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all shadow-md flex items-center gap-1.5"
                                >
                                  <span>✓</span> Confirm Session
                                </button>
                                <button
                                  onClick={() => handleDecline(b.id)}
                                  className="px-3.5 py-2 text-xs border border-border hover:border-red-500 hover:text-red-400 text-muted rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <span>✕</span> Decline
                                </button>
                              </div>
                            </div>
                          )}

                          {(b.status === "confirmed" || b.status === "upcoming") && (
                            <div className="flex flex-wrap items-center justify-between w-full gap-2 bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl">
                              <p className="text-xs text-blue-400 font-medium">
                                🚀 Confirmed session — mark done when finished or publish notes:
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleComplete(b.id)}
                                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-sm flex items-center gap-1"
                                >
                                  <span>🎓</span> Mark as Completed
                                </button>
                                <button
                                  onClick={() => handleOpenNoteEditorForBooking(b.id)}
                                  className="px-3 py-1.5 text-xs bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <span>📝</span> Write Session Notes
                                </button>
                                <button
                                  onClick={() => handleDecline(b.id)}
                                  className="px-3 py-1.5 text-xs border border-border hover:border-red-500 hover:text-red-400 text-muted rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {b.status === "completed" && (
                            <div className="flex flex-wrap items-center justify-between w-full gap-2 text-xs">
                              <span className="text-emerald-400 font-medium flex items-center gap-1">
                                ✓ Session Completed successfully
                              </span>
                              <button
                                onClick={() => handleOpenNoteEditorForBooking(b.id)}
                                className="px-3 py-1.5 bg-surface2 border border-border hover:border-accent text-ink rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <span>📝</span> Publish / Update Session Notes
                              </button>
                            </div>
                          )}

                          {b.status === "cancelled" && (
                            <div className="w-full text-xs text-muted italic">
                              This booking has been cancelled and refunded.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Session Notes & Homework Tab */}
          {activeTab === "notes" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-ink">Session Notes & Action Items</h2>
                  <p className="text-sm text-muted">
                    Publish architectural takeaways, assign homework, and track your students' action items.
                  </p>
                </div>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="inline-flex items-center gap-2 bg-accent text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity self-start"
                >
                  {showNoteForm ? "✕ Close Editor" : "➕ Write New Session Note"}
                </button>
              </div>

              {/* Note Creator Form */}
              {showNoteForm && (
                <form onSubmit={handleCreateNoteSubmit} className="bg-surface rounded-2xl border border-accent/40 p-5 md:p-6 space-y-4 shadow-lg">
                  <h3 className="text-base font-bold text-ink">Publish Session Note & Assign Homework</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1">
                        Select Mentorship / Consultation Session
                      </label>
                      <select
                        required
                        value={targetBookingId}
                        onChange={(e) => setTargetBookingId(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      >
                        <option value="">-- Choose Completed or Active Booking --</option>
                        {bookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            [{b.id}] {b.date} · {b.topic || b.trackSlug} ({b.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1">
                        Next Session Focus / Milestone
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Distributed Caching & Kafka Producer Partitioning"
                        value={noteNextFocus}
                        onChange={(e) => setNoteNextFocus(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1">
                      Key Topics Discussed (One per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g.&#10;Kubernetes Ingress & Multi-Cluster Traffic Routing&#10;Prometheus Metric Cardinality & Grafana Alert Rules&#10;CI/CD Pipeline Security Scanning with Trivy"
                      value={noteTopics}
                      onChange={(e) => setNoteTopics(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1">
                        Action Item / Homework 1
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Implement Cilium NetworkPolicy to isolate DB namespace"
                        value={noteHw1}
                        onChange={(e) => setNoteHw1(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1">
                        Action Item / Homework 2 (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Run load test with k6 and capture p99 latency grafana dashboard"
                        value={noteHw2}
                        onChange={(e) => setNoteHw2(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1">
                      Mentor's Final Advice & Engineering Recommendations
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Great job on the core concepts! Make sure to write declarative Terraform rather than manual console changes."
                      value={noteAdvice}
                      onChange={(e) => setNoteAdvice(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="px-4 py-2 border border-border rounded-lg text-xs text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-accent text-white font-medium rounded-lg text-xs hover:opacity-90 transition-opacity shadow-md"
                    >
                      Publish Note to Student
                    </button>
                  </div>
                </form>
              )}

              {/* Published Notes List */}
              {sessionNotes.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-surface/50 p-6 space-y-3">
                  <div className="text-3xl">📝</div>
                  <h3 className="text-base font-semibold text-ink">No Session Notes Published Yet</h3>
                  <p className="text-sm text-muted max-w-md mx-auto">
                    Click "Write New Session Note" above to publish notes, assign homework tasks, and recommend documentation to your mentees.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sessionNotes.map((note) => {
                    const completedHwCount = note.homework.filter((h) => h.completed).length;
                    const hwProgress = Math.round((completedHwCount / (note.homework.length || 1)) * 100);

                    return (
                      <div key={note.id} className="bg-surface rounded-2xl border border-border p-5 md:p-6 space-y-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                          <div>
                            <h3 className="text-base font-bold text-ink flex items-center gap-2">
                              Student: {note.userName}
                              <span className="text-[10px] font-mono bg-surface2 text-muted border border-border px-2 py-0.5 rounded">
                                {note.bookingId}
                              </span>
                            </h3>
                            <p className="text-xs text-muted">Session Date: {note.date}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted">Student Homework Progress:</span>
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              hwProgress === 100 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-accent/10 text-accent border border-accent/30"
                            }`}>
                              {completedHwCount} / {note.homework.length} Done ({hwProgress}%)
                            </span>
                          </div>
                        </div>

                        {/* Topics */}
                        <div>
                          <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-2">
                            Topics Covered
                          </h4>
                          <ul className="space-y-1">
                            {note.topicsDiscussed.map((topic, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                                <span className="text-accent font-bold mt-0.5">•</span>
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Assigned Homework */}
                        {note.homework.length > 0 && (
                          <div className="bg-surface2/60 rounded-xl p-4 border border-border">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold mb-2">
                              Assigned Tasks Checklist
                            </h4>
                            <div className="space-y-2">
                              {note.homework.map((hw) => (
                                <label
                                  key={hw.id}
                                  onClick={() => handleToggleHw(note.id, hw.id)}
                                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                    hw.completed
                                      ? "bg-emerald-500/5 border-emerald-500/30 text-muted line-through"
                                      : "bg-surface border-border hover:border-accent text-ink"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={hw.completed}
                                    onChange={() => {}}
                                    className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
                                  />
                                  <span className="text-sm">{hw.task}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Advice & Next Focus */}
                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                          <p className="text-xs font-mono text-accent font-bold uppercase mb-1">
                            Advice Given:
                          </p>
                          <p className="text-sm text-ink italic leading-relaxed">
                            "{note.mentorAdvice}"
                          </p>
                          {note.nextSessionFocus && (
                            <p className="text-xs text-muted mt-2 pt-2 border-t border-accent/20">
                              <strong>Next Target:</strong> {note.nextSessionFocus}
                            </p>
                          )}
                        </div>
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
