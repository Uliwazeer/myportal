"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { assessmentQuestions } from "@/lib/data";
import { getAllMentors, getAllTracks, getSession, syncWithServer } from "@/lib/store";
import type { MentorData, Track, AssessmentQuestion } from "@/lib/data";

export default function AssessmentPage() {
  const [tracksList, setTracksList] = useState<Track[]>([]);
  const [mentorsList, setMentorsList] = useState<MentorData[]>([]);
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [currentStep, setCurrentStep] = useState<"intro" | "quiz" | "results">("intro");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [careerGoal, setCareerGoal] = useState("");
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);

  useEffect(() => {
    setTracksList(getAllTracks());
    setMentorsList(getAllMentors());
    setSession(getSession());

    syncWithServer().then(() => {
      setTracksList(getAllTracks());
      setMentorsList(getAllMentors());
      setSession(getSession());
    });
  }, []);

  const filteredQuestions: AssessmentQuestion[] = selectedTrack === "all"
    ? assessmentQuestions
    : assessmentQuestions.filter((q) => q.trackSlug === selectedTrack || q.trackSlug === "devops-engineer");

  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : assessmentQuestions;
  const currentQuestion = activeQuestions[currentQIndex] || activeQuestions[0];

  function handleSelectOption(points: number) {
    const nextAnswers = { ...answers, [currentQuestion.id]: points };
    setAnswers(nextAnswers);

    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setCurrentStep("results");
    }
  }

  // Calculate scores
  const totalPossiblePoints = activeQuestions.length * 25;
  const totalEarnedPoints = Object.values(answers).reduce((a, b) => a + b, 0);
  const overallScorePct = Math.min(100, Math.round((totalEarnedPoints / Math.max(1, totalPossiblePoints)) * 100));

  const assessedLevel =
    overallScorePct < 35
      ? "Beginner / Fresh"
      : overallScorePct < 65
      ? "Junior Engineer"
      : overallScorePct < 85
      ? "Mid-Level Specialist"
      : "Senior / Lead";

  // Calculate Mentor Compatibility Matches
  const mentorMatches = mentorsList.map((m) => {
    let compatibility = 70;
    if (selectedTrack !== "all" && m.tracks.includes(selectedTrack)) {
      compatibility += 18;
    }
    if (m.rating >= 4.9) compatibility += 6;
    if (m.responseRate >= 98) compatibility += 4;
    // Score affinity
    if (overallScorePct < 50 && m.level === "Senior") compatibility += 2;
    compatibility = Math.min(99, compatibility);

    return {
      mentor: m,
      matchPercentage: compatibility,
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <main className="min-h-screen bg-bg">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-accent opacity-[0.05] blur-[140px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-6 py-12 relative">
        {/* Step: Intro */}
        {currentStep === "intro" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <span className="text-xs font-mono text-accent border border-accent/40 rounded px-2.5 py-1">
                SKILL DIAGNOSTIC &amp; SMART MATCHING
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-ink mt-3 mb-3">
                Discover Your Skill Level &amp; Optimal Mentor Match
              </h1>
              <p className="text-muted text-base max-w-2xl leading-relaxed">
                Take an interactive diagnostic assessment across engineering disciplines (DevOps, Platform, Backend, Cyber Security, Frontend, Cloud). Get a quantified skill breakdown, customized roadmap, and intelligent mentor compatibility score.
              </p>
            </div>

            {/* Target Career Goal input */}
            <div className="bg-surface rounded-2xl border border-border p-6 space-y-3">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                🎯 What is your target career milestone?
              </label>
              <input
                type="text"
                placeholder="e.g. Become a Senior Platform Engineer in 3 months, or Pass CKA..."
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            {/* Track Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                Select Your Focus Track
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedTrack("all")}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedTrack === "all"
                      ? "border-accent bg-accent/10 text-accent font-semibold shadow-md shadow-accent/10"
                      : "border-border bg-surface text-muted hover:border-accent/40"
                  }`}
                >
                  <p className="font-semibold text-sm mb-0.5">🌐 All Disciplines</p>
                  <p className="text-[10px] text-muted">Full Diagnostic</p>
                </button>
                {tracksList.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setSelectedTrack(t.slug)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedTrack === t.slug
                        ? "border-accent bg-accent/10 text-accent font-semibold shadow-md shadow-accent/10"
                        : "border-border bg-surface text-muted hover:border-accent/40"
                    }`}
                  >
                    <p className="font-semibold text-sm mb-0.5 truncate">{t.name}</p>
                    <p className="text-[10px] text-muted">{t.level}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentQIndex(0);
                setAnswers({});
                setCurrentStep("quiz");
              }}
              className="w-full sm:w-auto bg-accent text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
            >
              <span>Start Assessment ({activeQuestions.length} Questions)</span>
              <span>→</span>
            </button>
          </motion.div>
        )}

        {/* Step: Quiz */}
        {currentStep === "quiz" && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {/* Progress header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-accent">
                QUESTION {currentQIndex + 1} OF {activeQuestions.length}
              </span>
              <span className="text-xs text-muted font-medium bg-surface2 px-2.5 py-1 rounded-lg border border-border">
                {currentQuestion.trackName} · {currentQuestion.category}
              </span>
            </div>

            <div className="h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / activeQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-ink leading-snug">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt.points)}
                    className="w-full text-left p-4 rounded-xl border border-border bg-surface2/60 hover:bg-surface2 hover:border-accent/60 transition-all flex items-start gap-3.5 group"
                  >
                    <span className="h-6 w-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-muted group-hover:border-accent group-hover:text-accent shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink group-hover:text-accent transition-colors leading-relaxed">
                        {opt.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-muted pt-2">
              <button
                onClick={() => {
                  if (currentQIndex > 0) setCurrentQIndex((prev) => prev - 1);
                  else setCurrentStep("intro");
                }}
                className="hover:text-ink transition-colors"
              >
                ← Back
              </button>
              <span>{Math.round(((currentQIndex + 1) / activeQuestions.length) * 100)}% Completed</span>
            </div>
          </motion.div>
        )}

        {/* Step: Results */}
        {currentStep === "results" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-block p-3 rounded-2xl bg-accent/10 border border-accent/30 text-3xl mb-1">
                🎯
              </div>
              <h1 className="text-3xl font-bold text-ink">Your Skill Profile &amp; Mentor Matches</h1>
              {careerGoal && (
                <p className="text-sm text-accent font-medium">Goal: &ldquo;{careerGoal}&rdquo;</p>
              )}
            </div>

            {/* Score & Level Card */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-surface rounded-2xl border border-border p-6 text-center flex flex-col justify-center items-center">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Overall Proficiency</p>
                <div className="text-5xl font-mono font-bold text-accent mb-1">{overallScorePct}%</div>
                <p className="text-xs text-muted">Based on real-world scenarios</p>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-6 text-center flex flex-col justify-center items-center">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Assessed Level</p>
                <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-semibold text-sm mb-2">
                  {assessedLevel}
                </span>
                <p className="text-xs text-muted">Ready for advanced hands-on track</p>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-6 text-center flex flex-col justify-center items-center">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Recommended Track</p>
                <p className="text-sm font-bold text-ink mb-1">
                  {selectedTrack === "all" ? "Platform & Cloud Architecture" : selectedTrack.toUpperCase().replace(/-/g, " ")}
                </p>
                <Link href="/roadmap" className="text-xs text-accent hover:underline font-medium">
                  View Custom Roadmap →
                </Link>
              </div>
            </div>

            {/* Smart Mentor Compatibility Matches */}
            <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                    <span>⚡</span> Top Matched Mentors
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Calculated by skill overlap, availability, response speed, and experience.
                  </p>
                </div>
                <span className="text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/30 rounded px-2 py-0.5">
                  Algorithmic Match
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {mentorMatches.slice(0, 4).map(({ mentor: m, matchPercentage }, idx) => (
                  <div
                    key={m.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      idx === 0
                        ? "border-accent/60 bg-accent/5 shadow-lg shadow-accent/5"
                        : "border-border bg-surface2/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-12 w-12 rounded-full ${m.color} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md`}
                          >
                            {m.initials}
                          </div>
                          <div>
                            <h3 className="font-bold text-ink text-sm leading-tight">{m.name}</h3>
                            <p className="text-xs text-muted truncate max-w-[170px]">{m.title}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-green-400 bg-green-950/50 border border-green-800 rounded px-2 py-0.5">
                            {matchPercentage}% Match
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-3">
                        {m.bio}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {m.skills.slice(0, 4).map((s) => (
                          <span key={s} className="text-[10px] bg-surface border border-border text-muted rounded px-1.5 py-0.5">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink">
                        {m.consultationPrice} EGP <span className="text-[10px] text-muted font-normal">/ session</span>
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/mentors/${m.id}`}
                          className="px-2.5 py-1.5 border border-border rounded-lg text-xs text-muted hover:text-ink transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/book?mentor=${m.id}`}
                          className="px-3.5 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-md shadow-accent/20"
                        >
                          Book Matched Mentor
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link
                href="/roadmap"
                className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
              >
                Go to Personalized Learning Roadmap →
              </Link>
              <button
                onClick={() => {
                  setCurrentStep("intro");
                  setCurrentQIndex(0);
                  setAnswers({});
                }}
                className="border border-border text-muted hover:text-ink px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Retake Assessment
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
