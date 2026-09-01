"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { tracks as staticTracks, mentors as staticMentors, levels, sessionTypes } from "@/lib/data";
import { getSession, saveBooking, addNotification, getAllMentors, getAllTracks } from "@/lib/store";
import type { Level, Track, MentorData, SessionType } from "@/lib/data";
import toast, { Toaster } from "react-hot-toast";

const STEPS = ["Track", "Mentor", "Session & Time", "Confirm"];

function getAvailableDates(count = 14) {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const timeSlots = [
  "09:00", "10:00", "11:00", "14:00",
  "15:00", "16:00", "18:00", "19:00", "20:00", "21:00",
];

function BookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<Level>("Beginner / Fresh");
  const [selectedMentor, setSelectedMentor] = useState(searchParams.get("mentor") || "");
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType>("Consultation");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<40 | 60>(40);
  const [topic, setTopic] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [booked, setBooked] = useState(false);

  const [allMentors, setAllMentors] = useState<MentorData[]>(staticMentors);
  const [allTracks, setAllTracks] = useState<Track[]>(staticTracks);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push("/login"); return; }
    setSession(s);
    const mList = getAllMentors();
    const tList = getAllTracks();
    setAllMentors(mList);
    setAllTracks(tList);

    const mentorParam = searchParams.get("mentor");
    if (mentorParam) {
      setSelectedMentor(mentorParam);
      const targetMentor = mList.find((m) => m.id === mentorParam);
      if (targetMentor && targetMentor.tracks.length > 0) {
        setSelectedTrack(targetMentor.tracks[0]);
      }
    }
  }, [router, searchParams]);

  const filteredMentors = selectedTrack
    ? allMentors.filter((m) => m.tracks.includes(selectedTrack))
    : allMentors;

  const mentor = allMentors.find((m) => m.id === selectedMentor);
  const track = allTracks.find((t) => t.slug === selectedTrack);
  const dates = getAvailableDates();

  const [bookedBookingId, setBookedBookingId] = useState("");

  async function handleConfirm() {
    if (!session || !selectedTrack || !selectedMentor || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!agreePolicy) {
      toast.error("Please agree to the Cancellation Policy before confirming.");
      return;
    }

    setSubmitting(true);
    try {
      const newBooking = saveBooking({
        userId: session.id,
        mentorId: selectedMentor,
        trackSlug: selectedTrack,
        sessionType: selectedSessionType,
        topic,
        date: selectedDate,
        time: selectedTime,
        duration: selectedDuration,
      });
      setBookedBookingId(newBooking.id);

      // Notification to Intern
      addNotification({
        userId: session.id,
        message: `[${newBooking.id}] Your ${selectedSessionType} session request with ${mentor?.name} on ${selectedDate} at ${selectedTime} is pending mentor confirmation.`,
      });

      // Notification / Email simulation to Mentor
      addNotification({
        userId: selectedMentor,
        message: `📩 [${newBooking.id}] New ${selectedSessionType} request from ${session.name} for ${selectedDate} at ${selectedTime} (${selectedDuration} min). Please confirm or decline.`,
      });

      setBooked(true);
      toast.success("Session booked successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to book session.");
    } finally {
      setSubmitting(false);
    }
  }

  if (booked) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <Toaster />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-surface rounded-2xl border border-border p-8 max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">🎉</div>
          <span className="font-mono text-xs text-accent font-semibold bg-accent/10 border border-accent/30 rounded px-2.5 py-1 inline-block mb-3">
            Booking ID: {bookedBookingId}
          </span>
          <h2 className="text-2xl font-bold text-ink mb-2">Session Requested!</h2>
          <p className="text-muted text-sm mb-4">
            Your request has been sent to <span className="text-ink font-medium">{mentor?.name}</span> for{" "}
            <span className="text-ink font-medium">{selectedDate}</span> at{" "}
            <span className="text-ink font-medium">{selectedTime}</span>{" "}
            ({selectedDuration} min).
          </p>
          <div className="bg-surface2 border border-border/70 rounded-xl p-3 mb-6 text-left text-xs space-y-1.5">
            <p className="text-ink font-semibold">What happens next?</p>
            <p className="text-muted">1. The mentor receives your request and confirms the session.</p>
            <p className="text-muted">2. You will receive an instant notification &amp; confirmation email.</p>
            <p className="text-muted">3. Free cancellation with 100% refund up to 12 hours before the session.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href={session?.role === "intern" ? "/dashboard/intern" : "/dashboard/consultation"}
              className="bg-accent text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => { setBooked(false); setStep(0); }}
              className="text-muted border border-border rounded-xl px-5 py-2.5 text-sm hover:text-ink transition-colors"
            >
              Book Another
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <Toaster />

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-accent opacity-[0.04] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 relative">
        {/* Header */}
        <div className="mb-8">
          <Link href="/mentors" className="flex items-center gap-1.5 text-muted hover:text-ink text-sm mb-4 transition-colors w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Mentors
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-ink">Book a Session</h1>
          <p className="text-muted text-sm mt-1">
            Schedule a 40 or 60-minute consultation with an expert mentor.
          </p>
        </div>

        {/* Step progress */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i < step
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : i === step
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border text-muted"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <div className="text-[10px] text-muted ml-1.5 hidden sm:block">{s}</div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 transition-colors ${
                    i < step ? "bg-green-500/40" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Track */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Choose a Track</h2>
                {mentor && (
                  <span className="text-xs text-muted">
                    Showing tracks offered by <span className="text-accent font-semibold">{mentor.name}</span>
                  </span>
                )}
              </div>
              <div className="grid gap-3">
                {(mentor ? allTracks.filter((t) => mentor.tracks.includes(t.slug)) : allTracks).map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => setSelectedTrack(t.slug)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedTrack === t.slug
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-ink">{t.name}</p>
                        <p className="text-xs text-muted mt-0.5">{t.tagline}</p>
                      </div>
                      <span
                        className={`text-[10px] border rounded px-1.5 py-0.5 shrink-0 ${
                          selectedTrack === t.slug
                            ? "border-accent text-accent"
                            : "border-border text-muted"
                        }`}
                      >
                        {t.level}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Your Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {levels.map((l) => (
                    <button
                      key={l}
                      onClick={() => setSelectedLevel(l)}
                      className={`p-2.5 rounded-lg border text-sm transition-colors ${
                        selectedLevel === l
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted hover:border-accent/50"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!selectedTrack) { toast.error("Please select a track."); return; }
                  setStep(1);
                }}
                className="w-full bg-accent text-white rounded-xl py-3 font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
              >
                Next: Choose Mentor →
              </button>
            </motion.div>
          )}

          {/* Step 1: Mentor */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Choose a Mentor</h2>
                {track && (
                  <span className="text-xs text-muted bg-surface2 border border-border rounded px-2 py-0.5">
                    {track.name}
                  </span>
                )}
              </div>

              {filteredMentors.length === 0 ? (
                <p className="text-muted text-sm py-8 text-center">
                  No mentors available for this track yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredMentors.map((m) => {
                    const mTracks = allTracks.filter((t) => m.tracks.includes(t.slug));
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMentor(m.id);
                          if (m.tracks.length > 0 && !m.tracks.includes(selectedTrack)) {
                            setSelectedTrack(m.tracks[0]);
                          }
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedMentor === m.id
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-full ${m.color} flex items-center justify-center text-white font-bold shrink-0`}
                          >
                            {m.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-ink">{m.name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted">
                                <span className="text-yellow-400">★</span> {m.rating}
                              </div>
                            </div>
                            <p className="text-xs text-muted">{m.title}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {mTracks.map((t) => (
                                <span
                                  key={t.slug}
                                  className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/30 rounded px-1.5 py-0.5"
                                >
                                  {t.name}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-accent font-semibold mt-2">
                              From {m.consultationPrice} EGP / session
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="py-3 border border-border rounded-xl text-sm text-muted hover:text-ink transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedMentor) { toast.error("Please select a mentor."); return; }
                    setStep(2);
                  }}
                  className="py-3 bg-accent text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Next: Date &amp; Time
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Session Type, Date & Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-semibold text-ink">Session Type &amp; Schedule</h2>

              {/* Session Type Selection */}
              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Select Session Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sessionTypes.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedSessionType(st.id);
                        setSelectedDuration(st.defaultDuration);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        selectedSessionType === st.id
                          ? "border-accent bg-accent/10"
                          : "border-border bg-surface hover:border-accent/40"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-ink">{st.label}</p>
                        <span className="text-[10px] font-mono text-muted">{st.defaultDuration} min</span>
                      </div>
                      <p className="text-xs text-muted mt-1 leading-snug">{st.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Select Date</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {dates.map((d) => {
                    const dt = new Date(d + "T00:00:00");
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`p-2 rounded-lg border text-center transition-colors ${
                          selectedDate === d
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <p className="text-[10px] uppercase text-muted">
                          {dt.toLocaleString("en", { weekday: "short" })}
                        </p>
                        <p className="text-sm font-medium text-ink">{dt.getDate()}</p>
                        <p className="text-[10px] text-muted">
                          {dt.toLocaleString("en", { month: "short" })}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Select Time Slot</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-lg border text-sm transition-colors ${
                        selectedTime === t
                          ? "border-accent bg-accent/10 text-accent font-semibold"
                          : "border-border text-muted hover:border-accent/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Session Duration</label>
                <div className="grid grid-cols-2 gap-3">
                  {([40, 60] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDuration(d)}
                      className={`p-4 rounded-xl border transition-colors ${
                        selectedDuration === d
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <p className="font-semibold text-ink">{d} min</p>
                      <p className="text-xs text-muted mt-1">
                        {mentor ? (d === 40 ? mentor.consultationPrice : Math.round(mentor.consultationPrice * 1.4)) : "—"} EGP
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Topic / Questions</label>
                <textarea
                  rows={2}
                  placeholder="What specific challenge or topic do you want to cover in this session?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="py-3 border border-border rounded-xl text-sm text-muted hover:text-ink transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedDate || !selectedTime) {
                      toast.error("Please select date and time.");
                      return;
                    }
                    setStep(3);
                  }}
                  className="py-3 bg-accent text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Review &amp; Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-semibold text-ink">Confirm Booking &amp; Policy</h2>

              <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
                {[
                  { label: "Track", value: track?.name },
                  { label: "Session Type", value: selectedSessionType },
                  { label: "Level", value: selectedLevel },
                  { label: "Mentor", value: `${mentor?.name} — ${mentor?.title}` },
                  {
                    label: "Date",
                    value: new Date(selectedDate + "T00:00:00").toLocaleDateString("en", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                  { label: "Time", value: selectedTime },
                  { label: "Duration", value: `${selectedDuration} minutes` },
                  {
                    label: "Price",
                    value: `${
                      mentor
                        ? selectedDuration === 40
                          ? mentor.consultationPrice
                          : Math.round(mentor.consultationPrice * 1.4)
                        : "—"
                    } EGP`,
                  },
                  ...(topic ? [{ label: "Topic", value: topic }] : []),
                ].map((r) => (
                  <div key={r.label} className="flex items-start gap-4 px-5 py-3.5">
                    <span className="text-xs text-muted w-24 shrink-0 pt-0.5">{r.label}</span>
                    <span className="text-sm text-ink">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Cancellation Policy Box */}
              <div className="rounded-xl border border-border bg-surface2 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <span>🛡️ Cancellation &amp; Rescheduling Policy</span>
                </div>
                <div className="text-xs text-muted space-y-1.5 leading-relaxed">
                  <p>• You can cancel or reschedule your session at any time before the session starts.</p>
                  <p>• Cancellations made <strong>at least 12 hours before</strong> the scheduled start time receive a 100% full refund.</p>
                  <p>• Late cancellations (&lt; 12 hours) or no-shows are non-refundable and recorded on attendance reliability.</p>
                </div>
                <label className="flex items-start gap-2.5 pt-2 border-t border-border cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreePolicy}
                    onChange={(e) => setAgreePolicy(e.target.checked)}
                    className="mt-0.5 accent-accent h-4 w-4 rounded border-border"
                  />
                  <span className="text-xs text-ink font-medium">
                    I have read and agree to the Cancellation &amp; Rescheduling Policy.
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="py-3 border border-border rounded-xl text-sm text-muted hover:text-ink transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting || !agreePolicy}
                  className="py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(230,0,0,0.3)] transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Booking...
                    </span>
                  ) : "Confirm Booking"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <BookContent />
    </Suspense>
  );
}