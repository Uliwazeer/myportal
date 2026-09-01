'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUserByEmail, setSession } from '@/lib/store';
import type { UserProfile } from '@/lib/data';

/* ─── helpers ─────────────────────────────────────────────────── */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, Math.min(3, local.length));
  const stars = '*'.repeat(Math.max(local.length - 3, 3));
  return `${visible}${stars}@${domain}`;
}

type Step = 'email' | 'otp';

/* ─── page ────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();

  /* state */
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const [loadingContinue, setLoadingContinue] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isDev = process.env.NODE_ENV === 'development';

  /* countdown ticker */
  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdown]);

  /* ── step 1: check email ──────────────────────────────────────── */
  async function handleContinue() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoadingContinue(true);
    try {
      const user = getUserByEmail(trimmed);
      if (!user) {
        toast.error('No account found. Please register first.');
        return;
      }
      setFoundUser(user);

      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to send OTP. Try again.');
        return;
      }

      if (isDev && json.code) setDebugCode(json.code);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoadingContinue(false);
    }
  }

  /* ── step 2: verify OTP ──────────────────────────────────────── */
  async function handleVerify() {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Enter all 6 digits.');
      return;
    }

    setLoadingVerify(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Invalid code. Please try again.');
        return;
      }

      /* refresh user from store in case data changed */
      const user = getUserByEmail(email.trim().toLowerCase()) ?? foundUser!;
      setSession(user);

      toast.success('Logged in successfully!');

      const roleRoutes: Record<string, string> = {
        intern: '/dashboard/intern',
        mentor: '/dashboard/mentor',
        consultation: '/dashboard/consultation',
      };
      router.push(roleRoutes[user.role] ?? '/dashboard/intern');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoadingVerify(false);
    }
  }

  /* ── resend ──────────────────────────────────────────────────── */
  async function handleResend() {
    if (countdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setDebugCode(null);
    try {
      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (isDev && json.code) setDebugCode(json.code);
      setCountdown(60);
      toast.success('A new code has been sent.');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      toast.error('Failed to resend. Try again.');
    }
  }

  /* ── OTP box key handler ─────────────────────────────────────── */
  function handleOtpChange(idx: number, val: string) {
    const char = val.replace(/\D/, '');
    const next = [...otp];
    next[idx] = char;
    setOtp(next);
    if (char && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  }

  /* ─── animations ─────────────────────────────────────────────── */
  const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
  };

  /* ─── render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent opacity-[0.06] blur-[120px]" />
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/30 group-hover:shadow-accent/50 transition-shadow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </span>
            <span className="text-xl font-bold text-ink tracking-tight">PlatformX</span>
          </Link>
        </div>

        {/* card */}
        <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* top accent line */}
          <div className="h-[3px] bg-gradient-to-r from-accent via-red-400 to-accent" />

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* ───── EMAIL STEP ───── */}
              {step === 'email' && (
                <motion.div
                  key="email"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <h1 className="text-2xl font-bold text-ink mb-1">Welcome back</h1>
                  <p className="text-muted text-sm mb-8">Enter your email to receive a sign-in code</p>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleContinue()}
                        placeholder="you@example.com"
                        className="w-full bg-surface2 border border-border text-ink placeholder-[#555] rounded-xl px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-all"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      disabled={loadingContinue}
                      className="w-full bg-accent hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                    >
                      {loadingContinue ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Checking…
                        </>
                      ) : 'Continue'}
                    </motion.button>

                    <p className="text-center text-muted text-sm">
                      No account?{' '}
                      <Link href="/register" className="text-accent hover:text-red-400 font-medium transition-colors">
                        Register instead
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ───── OTP STEP ───── */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {/* back button */}
                  <button
                    onClick={() => { setStep('email'); setOtp(['','','','','','']); setDebugCode(null); }}
                    className="flex items-center gap-1.5 text-muted hover:text-ink text-sm mb-6 transition-colors group"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back
                  </button>

                  <h2 className="text-2xl font-bold text-ink mb-1">Check your inbox</h2>
                  <p className="text-muted text-sm mb-2">
                    We found your account.{' '}
                    <span className="text-ink font-medium">A 6-digit code was sent to</span>
                  </p>
                  <p className="text-accent font-semibold text-sm mb-8 break-all">{maskEmail(email)}</p>

                  {/* dev debug */}
                  {isDev && debugCode && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
                      <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      </svg>
                      <span className="text-yellow-300 text-xs font-mono">
                        DEV — OTP code: <span className="font-bold tracking-widest">{debugCode}</span>
                      </span>
                    </div>
                  )}

                  {/* OTP inputs */}
                  <div className="flex gap-2.5 justify-center mb-8" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-surface2 border border-border text-ink rounded-xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all caret-accent"
                      />
                    ))}
                  </div>

                  {/* verify button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerify}
                    disabled={loadingVerify || otp.join('').length < 6}
                    className="w-full bg-accent hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent/20 mb-4"
                  >
                    {loadingVerify ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        Verify & Sign In
                      </>
                    )}
                  </motion.button>

                  {/* resend */}
                  <div className="text-center">
                    <button
                      onClick={handleResend}
                      disabled={countdown > 0}
                      className="text-sm text-muted hover:text-accent disabled:hover:text-muted disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {countdown > 0
                        ? `Resend code in ${countdown}s`
                        : 'Resend Code'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* footer */}
        <p className="text-center text-[#555] text-xs mt-6">
          By continuing you agree to our{' '}
          <Link href="/terms" className="hover:text-muted transition-colors">Terms</Link>
          {' & '}
          <Link href="/privacy" className="hover:text-muted transition-colors">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
