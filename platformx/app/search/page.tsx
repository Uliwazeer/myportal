"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { tracks, mentors, labs } from "@/lib/data";

type ResultType = "Track" | "Mentor" | "Lab";
type Result = { type: ResultType; label: string; sub: string; href: string };

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const q = query.toLowerCase().trim();

  const results: Result[] = q
    ? [
        ...tracks
          .filter(
            (t) =>
              t.name.toLowerCase().includes(q) ||
              t.tagline.toLowerCase().includes(q)
          )
          .map((t) => ({
            type: "Track" as ResultType,
            label: t.name,
            sub: t.tagline,
            href: `/tracks/${t.slug}`,
          })),
        ...mentors
          .filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.title.toLowerCase().includes(q) ||
              m.skills.some((s) => s.toLowerCase().includes(q))
          )
          .map((m) => ({
            type: "Mentor" as ResultType,
            label: m.name,
            sub: m.title,
            href: `/mentors/${m.id}`,
          })),
        ...labs
          .filter(
            (l) =>
              l.title.toLowerCase().includes(q) ||
              l.track.toLowerCase().includes(q) ||
              l.scenario.toLowerCase().includes(q)
          )
          .map((l) => ({
            type: "Lab" as ResultType,
            label: l.title,
            sub: l.track,
            href: `/labs`,
          })),
      ]
    : [];

  const typeColors: Record<ResultType, string> = {
    Track: "text-accent border-accent/40",
    Mentor: "text-blue-400 border-blue-400/40",
    Lab: "text-green-400 border-green-400/40",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-ink mb-4">Search</h1>
          <input
            type="text"
            autoFocus
            placeholder="Search mentors, tracks, labs, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        {q && (
          <p className="text-sm text-muted">
            {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
            <span className="text-ink font-medium">&quot;{query}&quot;</span>
          </p>
        )}

        {results.length === 0 && q && (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-ink font-medium mb-1">No results found</p>
            <p className="text-muted text-sm">
              Try searching for tracks, mentors, or skills.
            </p>
          </div>
        )}

        {!q && (
          <div className="space-y-4">
            <p className="text-xs text-muted uppercase tracking-wider">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {["Kubernetes", "DevOps", "Python", "Ali Wazeer", "Security", "Docker", "React"].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-3 py-1.5 rounded-full border border-border text-sm text-muted hover:border-accent hover:text-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={r.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:border-accent/50 hover:bg-surface2 transition-all"
              >
                <span
                  className={`text-[10px] font-mono border rounded px-1.5 py-0.5 shrink-0 ${typeColors[r.type]}`}
                >
                  {r.type.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{r.label}</p>
                  <p className="text-xs text-muted truncate">{r.sub}</p>
                </div>
                <svg
                  className="w-4 h-4 text-muted shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-bg">
      <Suspense
        fallback={
          <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
