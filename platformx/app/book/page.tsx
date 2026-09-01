"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { tracks, mentors, levels } from "@/lib/data";
import { getSession, saveBooking, addNotification } from "@/lib/store";
import type { Level } from "@/lib/data";
import toast, { Toaster } from "react-hot-toast";

const STEPS = ["Track", "Mentor", "Date & Time", "Confirm"];

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
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<40 | 60>(40);
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push("/login"); return; }
    setSession(s);
    if (s.trackSlug) setSelectedTrack(s.trackSlug);
    if (s.mentorId) setSelectedMentor(s.mentorId);
    const mentorParam = searchParams.get("mentor");
    if (mentorParam) setSelectedMentor(mentorParam);
  }, [router, searchParams]);

  const filteredMentors = selectedTrack
    ? mentors.filter((m) => m.tracks.includes(selectedTrack))
    : mentors;

  const mentor = mentors.find((m) => m.id === selectedMentor);
  const track = tracks.find((t) => t.slug === selectedTrack);
  const dates = getAvailableDates();

  async function handleConfirm() {
    if (!session || !selectedTrack || !selectedMentor || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    saveBooking({
      userId: session.id,
      mentorId: selectedMentor,
      trackSlug: selectedTrack,
      topic,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
    });
    addNotification({
      userId: session.id,
      message: `Your session with ${mentor?.name} on ${selectedDate} at ${selectedTime} is now pending confirmation.`,
    });
    setBooked(true);
    setSubmitting(false);
    toast.success("Session booked successfully!");
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
          <h2 className="text-2xl font-bold text-ink mb-2">Session Booked!</h2>
          <p className="text-muted text-sm mb-6">
            Your session with <span className="text-ink font-medium">{mentor?.name}</span> on{" "}
            <span className="text-ink font-medium">{selectedDate}</span> at{" "}
            <span className="text-ink font-medium">{selectedTime}</span>{" "}
            ({selectedDuration} min) is pending confirmation.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={session?.role === "intern" ? "/dashboard/intern" : "/dashboard/consultation"}
              className="bg-accent text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
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
              <h2 className="text-lg font-semibold text-ink">Choose a Track</h2>
              <div className="grid gap-3">
                {tracks.map((t) => (
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
                  {filteredMentors.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMentor(m.id)}
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
                          <p className="text-xs text-accent mt-1">
                            From {m.consultationPrice} EGP / session
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
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

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-semibold text-ink">Pick Date &amp; Time</h2>

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
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Select Time</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-lg border text-sm transition-colors ${
                        selectedTime === t
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted hover:border-accent/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Duration</label>
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
                        {mentor?.consultationPrice ?? "—"} EGP
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Topic / Question (optional)</label>
                <textarea
                  rows={2}
                  placeholder="What do you want to cover in this session?"
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
              <h2 className="text-lg font-semibold text-ink">Confirm Booking</h2>

              <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
                {[
                  { label: "Track", value: track?.name },
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
                  { label: "Price", value: `${mentor?.consultationPrice ?? "—"} EGP` },
                  ...(topic ? [{ label: "Topic", value: topic }] : []),
                ].map((r) => (
                  <div key={r.label} className="flex items-start gap-4 px-5 py-3.5">
                    <span className="text-xs text-muted w-20 shrink-0 pt-0.5">{r.label}</span>
                    <span className="text-sm text-ink">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                <p className="text-xs text-yellow-300">
                  ⚡ Your booking will be confirmed once the mentor accepts your request.
                </p>
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
                  disabled={submitting}
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