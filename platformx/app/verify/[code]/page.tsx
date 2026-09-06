"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sampleCertificates, type VerifiedCertificate } from "@/lib/data";

export default function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const rawCode = decodeURIComponent(resolvedParams.code || "").trim();

  const [searchCode, setSearchCode] = useState(rawCode);
  const [cert, setCert] = useState<VerifiedCertificate | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!rawCode) return;
    const found = sampleCertificates.find(
      (c) => c.code.toLowerCase() === rawCode.toLowerCase()
    );
    setCert(found || null);
  }, [rawCode]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchCode.trim()) return;
    router.push(`/verify/${searchCode.trim().toUpperCase()}`);
  }

  function handleCopy() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-xs text-accent uppercase tracking-widest font-semibold">
                Official Credential Verification System
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Mentorship Credential Registry
            </h1>
          </div>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
            <input
              type="text"
              placeholder="e.g. MP-CERT-2026-AW01"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none w-full md:w-64 font-mono uppercase"
            />
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shrink-0"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Certificate Display or Not Found */}
        {cert ? (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 md:p-6 flex items-center justify-between flex-wrap gap-4 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  ✓
                </div>
                <div>
                  <h2 className="text-emerald-400 font-bold text-base md:text-lg flex items-center gap-2">
                    Officially Verified Credential
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      VALID
                    </span>
                  </h2>
                  <p className="text-xs text-muted">
                    This certificate is authentic and registered in the public Mentorship Platform Trust Ledger.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface2 transition-colors flex items-center gap-1.5"
                >
                  {copied ? "✓ Copied!" : "📋 Copy Verification Link"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-lg bg-accent/20 border border-accent/40 text-accent px-3 py-1.5 text-xs font-medium hover:bg-accent/30 transition-colors"
                >
                  🖨️ Print / Save PDF
                </button>
              </div>
            </div>

            {/* Official Certificate Card / Diploma Frame */}
            <div className="relative rounded-3xl border-2 border-border bg-gradient-to-b from-surface to-surface2 p-6 md:p-12 shadow-2xl overflow-hidden">
              {/* Background Watermark / Accent Glow */}
              <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -top-16 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-8">
                {/* Certificate Top Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/80 pb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-white font-mono font-black text-xl shadow-[0_0_15px_rgba(230,0,0,0.4)]">
                      MP
                    </div>
                    <div>
                      <h3 className="font-mono text-sm tracking-widest text-accent font-bold uppercase">
                        Mentorship Platform
                      </h3>
                      <p className="text-xs text-muted">Executive Engineering Mastery Certificate</p>
                    </div>
                  </div>

                  <div className="text-left md:text-right font-mono">
                    <span className="text-[11px] text-muted block">Certificate ID</span>
                    <span className="text-base font-bold text-accent tracking-wider">{cert.code}</span>
                  </div>
                </div>

                {/* Main Body Statement */}
                <div className="text-center space-y-4 py-4">
                  <p className="text-xs md:text-sm font-mono tracking-widest text-muted uppercase">
                    This is to certify that
                  </p>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-ink">
                    {cert.studentName}
                  </h2>
                  <p className="text-sm md:text-base text-muted max-w-xl mx-auto leading-relaxed">
                    has successfully completed the intensive hands-on deep mentorship program in{" "}
                    <strong className="text-accent font-semibold">{cert.trackName}</strong> with an outstanding performance score of{" "}
                    <strong className="text-emerald-400 font-bold">{cert.score}%</strong>.
                  </p>
                </div>

                {/* Final Capstone & Competencies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="bg-surface/80 rounded-xl border border-border p-4">
                    <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-2">
                      Capstone Project & Deliverable
                    </h4>
                    <p className="text-sm font-semibold text-ink leading-snug">
                      {cert.finalProjectTitle}
                    </p>
                  </div>

                  <div className="bg-surface/80 rounded-xl border border-border p-4">
                    <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-2">
                      Demonstrated Skills & Mastery
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skillsMastered.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-mono bg-surface2 border border-border text-ink px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Signatures & Seal */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border gap-6">
                  <div className="text-center md:text-left space-y-1">
                    <p className="font-serif italic text-lg text-ink">{cert.mentorName}</p>
                    <p className="text-xs text-muted font-medium">{cert.mentorTitle}</p>
                    <p className="text-[10px] font-mono text-accent">Lead Mentor & Evaluator</p>
                  </div>

                  {/* Digital Tamper-proof Seal */}
                  <div className="h-24 w-24 rounded-full border-2 border-dashed border-accent/60 flex flex-col items-center justify-center p-2 text-center bg-accent/5">
                    <span className="text-[9px] font-mono text-accent font-bold uppercase tracking-tighter">
                      VERIFIED
                    </span>
                    <span className="text-xl">🛡️</span>
                    <span className="text-[8px] font-mono text-muted">{cert.issueDate}</span>
                  </div>

                  <div className="text-center md:text-right space-y-1">
                    <p className="text-xs font-mono text-muted uppercase tracking-wider">Date of Issuance</p>
                    <p className="text-sm font-semibold text-ink">{cert.issueDate}</p>
                    <p className="text-[10px] font-mono text-emerald-400">Cryptographically Recorded</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Not Found / Code Missing Screen */
          <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
              🔍
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-ink">Certificate Code Not Found</h2>
              <p className="text-sm text-muted">
                No certificate matches code <code className="text-accent font-mono font-bold">{rawCode || "NONE"}</code>.
                Please check for typographical errors or test with one of the sample verified credentials below.
              </p>
            </div>

            {/* Test Sample Certificates */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted mb-4">
                Available Verified Sample Credentials for Testing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {sampleCertificates.map((c) => (
                  <Link
                    key={c.code}
                    href={`/verify/${c.code}`}
                    className="p-3 bg-surface2 border border-border hover:border-accent rounded-xl text-left transition-all hover:scale-105"
                  >
                    <span className="text-[10px] font-mono font-bold text-accent block">{c.code}</span>
                    <p className="text-sm font-semibold text-ink mt-0.5">{c.studentName}</p>
                    <p className="text-xs text-muted truncate">{c.trackName}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="flex justify-between items-center text-xs text-muted pt-4">
          <Link href="/" className="hover:text-accent transition-colors">
            ← Back to Homepage
          </Link>
          <Link href="/assessment" className="hover:text-accent transition-colors">
            Take Multi-Track Skill Assessment →
          </Link>
        </div>
      </div>
    </div>
  );
}
