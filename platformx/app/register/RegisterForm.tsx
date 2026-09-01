"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tracks } from "@/lib/data";

type Step = "form" | "otp";
type Status = "idle" | "loading" | "error";

const OTP_SECONDS = 60;

const mentors = [
  { id: "ali", name: "Ali Wazeer", track: "platform-engineer" },
  { id: "adnan", name: "Adnan", track: "backend-engineer" },
  { id: "yamen", name: "Yamen", track: "cyber-security" },
  { id: "sajid", name: "Sajid", track: "system-admin" },
];

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState({
    role: "Intern",
    mentor: mentors[0].id,
    name: "",
    email: "",
    phone: "",
    university: "",
    level: "Beginner",
    track: mentors[0].track,
    github: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    if (key === "role") {
      setForm((f) => ({ ...f, role: value }));
    } else if (key === "mentor") {
      const selectedMentor = mentors.find((m) => m.id === value);
      setForm((f) => ({ ...f, mentor: value, track: selectedMentor ? selectedMentor.track : f.track }));
    } else {
      setForm((f) => ({ ...f, [key]: value }));
    }
  }

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

  async function requestCode() {
    // Egyptian phone number validation
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(form.phone)) {
      setError("Please enter a valid Egyptian phone number (e.g. 01012345678)");
      return;
    }

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
        setError(data.error || "Failed to send OTP code.");
        setStatus("error");
        return;
      }

      if (data.debugCode) setDebugCode(data.debugCode);
      setOtpToken(data.token);
      setOtp("");
      setStep("otp");
      setStatus("idle");
      startCountdown();
    } catch {
      setError("Server connection failed.");
      setStatus("error");
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    await requestCode();
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const verifyRes = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: otp, token: otpToken }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.ok) {
        setError(verifyData.error || "Invalid code.");
        setStatus("error");
        return;
      }

      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ticket: verifyData.ticket }),
      });
      const registerData = await registerRes.json();

      if (!registerData.ok) {
        setError(registerData.error || "An error occurred during registration.");
        setStatus("error");
        return;
      }

      window.localStorage.setItem("px_registration", JSON.stringify(form));
      router.push("/dashboard");
    } catch {
      setError("Server connection failed.");
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-surface2 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent";

  if (step === "otp") {
    const mm = Math.floor(secondsLeft / 60);
    const ss = String(secondsLeft % 60).padStart(2, "0");

    return (
      <form onSubmit={handleOtpSubmit} className="space-y-5">
        <div>
          <p className="text-sm text-muted">
            Verification code sent to <span className="text-ink font-medium">{form.email}</span>
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            Valid for{" "}
            <span className={secondsLeft > 0 ? "text-accent" : "text-danger"}>
              {mm}:{ss}
            </span>
          </p>
        </div>

        {debugCode && (
          <div className="rounded-md border border-accent2/40 bg-surface2 p-3">
            <p className="text-xs text-accent2">
              Development mode — Code:{" "}
              <span className="font-mono text-sm text-ink">{debugCode}</span>
            </p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-muted">Verification Code</label>
          <input
            required
            inputMode="numeric"
            maxLength={6}
            className={`${inputClass} tracking-[0.5em] text-center font-mono`}
            placeholder="------"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading" || otp.length !== 6 || secondsLeft === 0}
          className="w-full rounded-md bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "Verifying..." : "Confirm & Complete"}
        </button>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="text-muted hover:text-ink"
          >
            Back to edit info
          </button>
          <button
            type="button"
            onClick={requestCode}
            disabled={secondsLeft > 0 || status === "loading"}
            className="text-accent disabled:cursor-not-allowed disabled:text-muted"
          >
            Resend Code
          </button>
        </div>
      </form>
    );
  }

  const submitButtonText = form.role === "Intern" ? "Register as Intern" : (form.role === "Consultation" ? "Book Consultation" : "Register Admin");

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-muted">Role</label>
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          >
            <option value="Intern">Intern</option>
            <option value="Consultation">Consultation</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {form.role === "Intern" && (
          <>
            <div>
              <label className="mb-1 block text-xs text-muted">Select Mentor</label>
              <select
                className={inputClass}
                value={form.mentor}
                onChange={(e) => update("mentor", e.target.value)}
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Assigned Track</label>
              <input
                disabled
                className={`${inputClass} opacity-70 cursor-not-allowed bg-surface`}
                value={form.track.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
              />
            </div>
          </>
        )}

        {form.role === "Consultation" && (
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-muted">Topic of Consultation</label>
            <input
              className={inputClass}
              placeholder="e.g., Career Advice, Code Review..."
              onChange={(e) => update("github", e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-muted">Full Name</label>
          <input
            required
            className={inputClass}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Email Address</label>
          <input
            required
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Phone Number (Egyptian)</label>
          <input
            required
            className={inputClass}
            placeholder="01012345678"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        
        {form.role === "Intern" && (
          <>
            <div>
              <label className="mb-1 block text-xs text-muted">University</label>
              <input
                className={inputClass}
                value={form.university}
                onChange={(e) => update("university", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Current Level</label>
              <select
                className={inputClass}
                value={form.level}
                onChange={(e) => update("level", e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Have Basics">I know the basics</option>
                <option value="Did Projects">Built projects before</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">GitHub Profile (Optional)</label>
              <input
                className={inputClass}
                placeholder="github.com/username"
                value={form.github}
                onChange={(e) => update("github", e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-accent font-medium bg-accent/10 p-3 rounded-md border border-accent/20">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-accent py-3 text-sm font-semibold text-white transition-all hover:bg-accent2 hover:shadow-[0_0_15px_rgba(230,0,0,0.5)] disabled:opacity-50"
      >
        {status === "loading" ? "Sending OTP..." : submitButtonText}
      </button>
    </form>
  );
}
