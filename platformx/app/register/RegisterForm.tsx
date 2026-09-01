"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { tracks, mentors as staticMentors, levels } from "@/lib/data";
import {
  getUserByEmail,
  getUserByPhone,
  saveUser,
  setSession,
  getAllMentors,
} from "@/lib/store";
import type { MentorData } from "@/lib/data";

type Role = "intern" | "mentor" | "consultation";
type Step = "role" | "form" | "otp" | "success";
type Status = "idle" | "loading" | "error";

const OTP_SECONDS = 60;

const roleInfo = {
  intern: {
    label: "Intern",
    icon: "🎓",
    desc: "Join a structured learning program with a dedicated mentor",
    color: "border-blue-500/50 bg-blue-500/5 hover:border-blue-500",
  },
  mentor: {
    label: "Mentor",
    icon: "🧑‍💼",
    desc: "Share your expertise and guide the next generation of engineers",
    color: "border-accent/50 bg-accent/5 hover:border-accent",
  },
  consultation: {
    label: "Consultation",
    icon: "💬",
    desc: "Book expert sessions to solve specific technical challenges",
    color: "border-green-500/50 bg-green-500/5 hover:border-green-500",
  },
};

export default function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<Step>("role");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpToken, setOtpToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [mentorList, setMentorList] = useState<MentorData[]>(staticMentors);

  useEffect(() => {
    const list = getAllMentors();
    setMentorList(list);
    if (list.length > 0) {
      setForm((f) => ({
        ...f,
        mentorId: f.mentorId || list[0].id,
        trackSlug: f.trackSlug || (list[0].tracks && list[0].tracks[0]) || "platform-engineer",
      }));
    }
  }, []);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Shared
    name: "",
    email: "",
    phone: "",
    // Intern
    university: "",
    level: levels[0],
    mentorId: staticMentors[0].id,
    trackSlug: staticMentors[0].tracks[0],
    github: "",
    // Mentor
    title: "",
    bio: "",
    skills: "",
    yearsExperience: "",
    consultationPrice: "",
    mentorTracks: [] as string[],
    mentorLevels: [] as string[],
    // Consultation
    topic: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string | string[]) {
    if (key === "mentorId") {
      const m = mentorList.find((m) => m.id === value);
      setForm((f) => ({
        ...f,
        mentorId: value as string,
        trackSlug: m && m.tracks.length > 0 ? m.tracks[0] : f.trackSlug,
      }));
    } else {
      setForm((f) => ({ ...f, [key]: value }));
    }
  }

  function toggleMentorTrack(slug: string) {
    setForm((f) => ({
      ...f,
      mentorTracks: f.mentorTracks.includes(slug)
        ? f.mentorTracks.filter((t) => t !== slug)
        : [...f.mentorTracks, slug],
    }));
  }

  function toggleMentorLevel(lvl: string) {
    setForm((f) => ({
      ...f,
      mentorLevels: f.mentorLevels.includes(lvl)
        ? f.mentorLevels.filter((l) => l !== lvl)
        : [...f.mentorLevels, lvl],
    }));
  }

  // ── OTP countdown ──────────────────────────────────────────────────────────
  function startCountdown() {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(OTP_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  function validateForm(): boolean {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!form.name.trim()) { setError("Full name is required."); return false; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!phoneRegex.test(form.phone)) {
      setError("Please enter a valid Egyptian phone number (e.g. 01012345678)");
      return false;
    }

    // Duplicate check (client-side localStorage)
    const existingEmail = getUserByEmail(form.email);
    if (existingEmail) {
      setError("This email is already registered. Please sign in instead.");
      return false;
    }
    const existingPhone = getUserByPhone(form.phone);
    if (existingPhone) {
      setError("This phone number is already registered. Please sign in instead.");
      return false;
    }

    if (role === "mentor" && !form.title.trim()) {
      setError("Professional title is required.");
      return false;
    }

    return true;
  }

  // ── Request OTP ────────────────────────────────────────────────────────────
  async function requestOtp() {
    if (!validateForm()) return;
    setStatus("loading");
    setError("");
    setDebugCode(null);

    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Failed to send verification code.");
        setStatus("error");
        return;
      }

      if (data.debugCode) setDebugCode(data.debugCode);
      setOtpToken(data.token || "");
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
      setStatus("idle");
      startCountdown();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Server connection failed. Please try again.");
      setStatus("error");
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    await requestOtp();
  }

  // ── Verify OTP & Register ──────────────────────────────────────────────────
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter all 6 digits."); return; }

    setStatus("loading");
    setError("");

    try {
      const verifyRes = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code, token: otpToken }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.ok) {
        setError(verifyData.error || "Invalid verification code.");
        setStatus("error");
        return;
      }

      // Build user object for API
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role,
        ticket: verifyData.ticket,
      };

      if (role === "intern") {
        Object.assign(payload, {
          university: form.university,
          level: form.level,
          trackSlug: form.trackSlug,
          mentorId: form.mentorId,
          github: form.github,
        });
      } else if (role === "mentor") {
        Object.assign(payload, {
          title: form.title,
          bio: form.bio,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          tracks: form.mentorTracks,
          yearsExperience: Number(form.yearsExperience) || 0,
          consultationPrice: Number(form.consultationPrice) || 0,
        });
      } else if (role === "consultation") {
        Object.assign(payload, { topic: form.topic });
      }

      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const registerData = await registerRes.json();

      if (!registerData.ok) {
        setError(registerData.error || "An error occurred during registration.");
        setStatus("error");
        return;
      }

      // Save to localStorage & session
      const savedUser = saveUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: role!,
        ...(role === "intern" && {
          university: form.university,
          level: form.level as import("@/lib/data").Level,
          trackSlug: form.trackSlug,
          mentorId: form.mentorId,
          github: form.github,
          progress: 0,
        }),
        ...(role === "mentor" && {
          title: form.title,
          bio: form.bio,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          tracks: form.mentorTracks,
          yearsExperience: Number(form.yearsExperience) || 0,
          consultationPrice: Number(form.consultationPrice) || 0,
        }),
        ...(role === "consultation" && { topic: form.topic }),
      });

      setSession(savedUser);
      setStatus("idle");
      setStep("success");

      setTimeout(() => {
        router.push(`/dashboard/${role}`);
      }, 1500);
    } catch {
      setError("Server connection failed. Please try again.");
      setStatus("error");
    }
  }

  // ── OTP input handlers ─────────────────────────────────────────────────────
  function handleOtpChange(idx: number, val: string) {
    const char = val.replace(/\D/, "");
    const next = [...otp];
    next[idx] = char;
    setOtp(next);
    if (char && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputClass =
    "w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all";

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // ─── Step: Role selection ──────────────────────────────────────────────────
  if (step === "role") {
    return (
      <div className="space-y-6">
        <Toaster position="top-center" />
        <div>
          <h2 className="text-xl font-bold text-ink mb-1">Choose your role</h2>
          <p className="text-sm text-muted">Select how you want to join the platform</p>
        </div>
        <div className="space-y-3">
          {(Object.entries(roleInfo) as [Role, typeof roleInfo.intern][]).map(([key, info]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setRole(key); setStep("form"); }}
              className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all ${info.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <p className="font-semibold text-ink">{info.label}</p>
                  <p className="text-xs text-muted mt-0.5">{info.desc}</p>
                </div>
                <svg className="ml-auto w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    );
  }

  // ─── Step: OTP verification ────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <Toaster position="top-center" />
        <button
          type="button"
          onClick={() => { setStep("form"); setOtp(["", "", "", "", "", ""]); setError(""); }}
          className="flex items-center gap-1.5 text-muted hover:text-ink text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div>
          <h2 className="text-xl font-bold text-ink mb-1">Check your inbox</h2>
          <p className="text-sm text-muted">
            A 6-digit code was sent to{" "}
            <span className="text-ink font-medium">{form.email}</span>
          </p>
          <p className="mt-1 text-xs font-mono">
            Code expires in{" "}
            <span className={secondsLeft > 0 ? "text-accent" : "text-red-400"}>
              {mm}:{ss}
            </span>
          </p>
        </div>

        {debugCode && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
            <p className="text-xs text-yellow-300">
              Dev mode — Code: <span className="font-mono font-bold tracking-widest">{debugCode}</span>
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              className="w-12 h-14 text-center text-2xl font-bold bg-surface2 border border-border text-ink rounded-xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
            />
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
            <p className="text-sm text-accent">{error}</p>
            {(error.includes("already registered") || error.includes("already registered")) && (
              <Link href="/login" className="mt-1 text-xs text-accent underline block">Sign In instead →</Link>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={status === "loading" || otp.join("").length < 6 || secondsLeft === 0}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-all hover:bg-red-600 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account…
            </>
          ) : "Verify & Complete Registration"}
        </motion.button>

        <div className="text-center">
          <button
            type="button"
            onClick={requestOtp}
            disabled={secondsLeft > 0 || status === "loading"}
            className="text-sm text-muted hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend Code"}
          </button>
        </div>
      </form>
    );
  }

  // ─── Step: Success ─────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-8"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-ink">Welcome, {form.name}! 🎉</h2>
        <p className="text-muted text-sm">Your account has been created. Redirecting to your dashboard…</p>
        <div className="h-1 w-full bg-surface2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4 }}
          />
        </div>
      </motion.div>
    );
  }

  // ─── Step: Form ────────────────────────────────────────────────────────────
  const selectedMentor = mentorList.find((m) => m.id === form.mentorId);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <Toaster position="top-center" />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { setStep("role"); setRole(null); setError(""); }}
          className="text-muted hover:text-ink transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-base font-bold text-ink">
            {roleInfo[role!].icon} Register as {roleInfo[role!].label}
          </h2>
        </div>
      </div>

      {/* ── Shared fields ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Full Name *</label>
          <input
            required
            className={inputClass}
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Email Address *</label>
          <input
            required
            type="email"
            className={inputClass}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Phone Number *</label>
          <input
            required
            className={inputClass}
            placeholder="01012345678"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <p className="text-[11px] text-muted mt-1">Egyptian number (01x) required</p>
        </div>
      </div>

      {/* ── Intern-specific fields ── */}
      {role === "intern" && (
        <div className="space-y-4">
          <div className="h-px bg-border" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Select Mentor *</label>
              <select
                className={inputClass}
                value={form.mentorId}
                onChange={(e) => update("mentorId", e.target.value)}
              >
                {mentorList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Assigned Track</label>
              <input
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
                value={selectedMentor ? tracks.find(t => t.slug === form.trackSlug)?.name ?? form.trackSlug : ""}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Current Level *</label>
              <select
                className={inputClass}
                value={form.level}
                onChange={(e) => update("level", e.target.value)}
              >
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">University</label>
              <input
                className={inputClass}
                placeholder="Your university (optional)"
                value={form.university}
                onChange={(e) => update("university", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">GitHub Profile (Optional)</label>
              <input
                className={inputClass}
                placeholder="github.com/username"
                value={form.github}
                onChange={(e) => update("github", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Mentor-specific fields ── */}
      {role === "mentor" && (
        <div className="space-y-4">
          <div className="h-px bg-border" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Professional Title *</label>
              <input
                required
                className={inputClass}
                placeholder="e.g., Senior DevOps Engineer"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Bio</label>
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Tell us about your experience and what you can teach..."
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Skills (comma-separated)</label>
              <input
                className={inputClass}
                placeholder="Kubernetes, Docker, Terraform..."
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                className={inputClass}
                placeholder="e.g., 5"
                value={form.yearsExperience}
                onChange={(e) => update("yearsExperience", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Session Price (EGP)</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                placeholder="e.g., 250"
                value={form.consultationPrice}
                onChange={(e) => update("consultationPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Track selection */}
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Tracks You Teach</label>
            <div className="grid grid-cols-2 gap-2">
              {tracks.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => toggleMentorTrack(t.slug)}
                  className={`text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                    form.mentorTracks.includes(t.slug)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Level selection */}
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Levels You Mentor</label>
            <div className="flex flex-wrap gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleMentorLevel(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    form.mentorLevels.includes(l)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Consultation-specific fields ── */}
      {role === "consultation" && (
        <div className="space-y-4">
          <div className="h-px bg-border" />
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">What do you need help with?</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="e.g., Career guidance, code review, system design, debugging..."
              value={form.topic}
              onChange={(e) => update("topic", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
          <p className="text-sm text-accent">{error}</p>
          {(error.includes("already registered")) && (
            <Link href="/login" className="mt-1 text-xs text-accent underline block">
              Sign in instead →
            </Link>
          )}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-all hover:bg-red-600 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending Code…
          </>
        ) : (
          `Continue as ${roleInfo[role!].label} →`
        )}
      </motion.button>
    </form>
  );
}
