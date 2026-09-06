"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAllTracks, getAllMentors, getSession, syncWithServer } from "@/lib/store";
import type { Track, MentorData, UserProfile } from "@/lib/data";
import toast, { Toaster } from "react-hot-toast";

type Milestone = {
  id: string;
  week: number;
  title: string;
  desc: string;
  completed: boolean;
  skills: string[];
};

export default function RoadmapPage() {
  const [tracksList, setTracksList] = useState<Track[]>([]);
  const [mentorsList, setMentorsList] = useState<MentorData[]>([]);
  const [selectedTrackSlug, setSelectedTrackSlug] = useState("platform-engineer");
  const [goalText, setGoalText] = useState("Become a Senior Platform Engineer in 3 months");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [session, setSession] = useState<UserProfile | null>(null);

  const [milestones, setMilestones] = useState<Record<string, boolean>>({
    "m-1": true,
    "m-2": true,
    "m-3": false,
    "m-4": false,
    "m-5": false,
    "m-6": false,
    "m-7": false,
    "m-8": false,
  });

  useEffect(() => {
    setTracksList(getAllTracks());
    setMentorsList(getAllMentors());
    const s = getSession();
    setSession(s);
    if (s?.trackSlug) {
      setSelectedTrackSlug(s.trackSlug);
    }

    syncWithServer().then(() => {
      setTracksList(getAllTracks());
      setMentorsList(getAllMentors());
    });
  }, []);

  const currentTrack = tracksList.find((t) => t.slug === selectedTrackSlug) || tracksList[0];
  const trackMentors = mentorsList.filter((m) => m.tracks.includes(selectedTrackSlug));

  const totalSteps = currentTrack?.modules.length || 8;
  const completedCount = Object.values(milestones).filter(Boolean).length;
  const progressPct = Math.min(100, Math.round((completedCount / totalSteps) * 100));

  function toggleMilestone(id: string) {
    setMilestones((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      toast.success(updated[id] ? "Milestone marked completed! 🚀" : "Milestone updated.");
      return updated;
    });
  }

  return (
    <main className="min-h-screen bg-bg">
      <Toaster position="top-center" />

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-accent opacity-[0.04] blur-[140px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-6 py-12 relative space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-accent border border-accent/40 rounded px-2.5 py-1">
              PERSONALIZED ROADMAP &amp; MILESTONES
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-ink mt-3">
              Your Engineering Learning Roadmap
            </h1>
            <p className="text-muted text-sm mt-1">
              Structured milestone tracking with 1-on-1 mentor guidance and verified lab checkpoints.
            </p>
          </div>

          {/* Track Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted">Track:</span>
            <select
              value={selectedTrackSlug}
              onChange={(e) => setSelectedTrackSlug(e.target.value)}
              className="bg-surface border border-border text-ink text-xs rounded-xl px-3 py-2 focus:border-accent focus:outline-none"
            >
              {tracksList.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Goal Card & Before/After Progress Banner */}
        <div className="grid md:grid-cols-12 gap-4">
          {/* Target Goal */}
          <div className="md:col-span-7 bg-surface rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-1.5">
                <span>🎯</span> TARGET CAREER GOAL
              </span>
              <button
                type="button"
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-xs text-muted hover:text-ink underline"
              >
                {isEditingGoal ? "Done" : "Edit Goal"}
              </button>
            </div>

            {isEditingGoal ? (
              <input
                type="text"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            ) : (
              <p className="text-lg font-bold text-ink leading-snug">&ldquo;{goalText}&rdquo;</p>
            )}

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Roadmap Progression</span>
                <span className="font-mono font-bold text-accent">{progressPct}% Complete</span>
              </div>
              <div className="h-2 w-full bg-surface2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>

          {/* Before / After Metrics */}
          <div className="md:col-span-5 bg-surface rounded-2xl border border-border p-6 space-y-3 flex flex-col justify-between">
            <span className="text-xs font-mono text-blue-400 font-semibold flex items-center gap-1.5">
              <span>📊</span> BEFORE / AFTER PROGRESSION
            </span>

            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div className="p-2 bg-surface2 rounded-xl border border-border">
                <p className="text-xs text-muted">Baseline</p>
                <p className="text-base font-bold font-mono text-ink mt-0.5">28%</p>
              </div>
              <div className="p-2 bg-accent/10 rounded-xl border border-accent/30">
                <p className="text-xs text-accent">Current</p>
                <p className="text-base font-bold font-mono text-accent mt-0.5">{progressPct}%</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/30">
                <p className="text-xs text-green-400">Target</p>
                <p className="text-base font-bold font-mono text-green-400 mt-0.5">100%</p>
              </div>
            </div>

            <p className="text-[11px] text-muted">
              + {progressPct > 28 ? progressPct - 28 : 0}% verified skill jump since initial diagnostic.
            </p>
          </div>
        </div>

        {/* Weekly Milestones Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Curriculum Milestones ({currentTrack?.name})</h2>
            <Link href="/assessment" className="text-xs text-accent hover:underline">
              Retake Skill Assessment →
            </Link>
          </div>

          <div className="space-y-3">
            {currentTrack?.modules.map((mod, idx) => {
              const mId = `m-${mod.week}`;
              const isDone = Boolean(milestones[mId]);

              return (
                <motion.div
                  key={mod.week}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDone
                      ? "border-green-800/60 bg-green-950/10"
                      : "border-border bg-surface hover:border-accent/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        onClick={() => toggleMilestone(mId)}
                        className={`mt-0.5 h-6 w-6 rounded-lg border flex items-center justify-center text-xs font-bold transition-colors ${
                          isDone
                            ? "border-green-500 bg-green-500 text-black shadow-md shadow-green-500/30"
                            : "border-border bg-surface2 text-muted hover:border-accent"
                        }`}
                      >
                        {isDone ? "✓" : ""}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/30 rounded px-1.5 py-0.2">
                            WEEK {String(mod.week).padStart(2, "0")}
                          </span>
                          <h3 className={`text-sm font-bold ${isDone ? "text-ink line-through opacity-80" : "text-ink"}`}>
                            {mod.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {mod.topics.map((t) => (
                            <span key={t} className="text-[11px] bg-surface2 border border-border text-muted rounded-md px-2 py-0.5">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-9 sm:pl-0 shrink-0">
                      <Link
                        href={`/book?track=${currentTrack.slug}`}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-ink transition-colors"
                      >
                        Discuss in Session
                      </Link>
                      <Link
                        href="/labs"
                        className="px-3 py-1.5 rounded-lg bg-surface2 hover:bg-accent hover:text-white text-xs font-medium text-ink transition-colors"
                      >
                        Practice Lab →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mentors Teaching this Track */}
        {trackMentors.length > 0 && (
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h3 className="text-base font-bold text-ink">Mentors Supporting this Roadmap</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {trackMentors.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-surface2/60 border border-border/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {m.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{m.name}</p>
                      <p className="text-[10px] text-muted truncate">{m.title}</p>
                    </div>
                  </div>
                  <Link
                    href={`/book?mentor=${m.id}`}
                    className="px-2.5 py-1 text-xs bg-accent text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
