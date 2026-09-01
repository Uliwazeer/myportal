"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tracks } from "@/lib/data";

type Registration = {
  name: string;
  email: string;
  level: string;
  track: string;
  role?: string;
  mentor?: string;
};

const mentorNames: Record<string, string> = {
  ali: "Ali Wazeer",
  adnan: "Adnan",
  yamen: "Yamen",
  sajid: "Sajid",
};

const skillProgress = [
  { skill: "Linux", value: 70 },
  { skill: "Git", value: 55 },
  { skill: "Docker", value: 35 },
  { skill: "Kubernetes", value: 15 },
];

export default function DashboardPage() {
  const [reg, setReg] = useState<Registration | null | undefined>(undefined);

  useEffect(() => {
    const raw = window.localStorage.getItem("px_registration");
    setReg(raw ? JSON.parse(raw) : null);
  }, []);

  if (reg === undefined) {
    return <section className="mx-auto max-w-content px-6 py-16 text-sm text-muted">Loading...</section>;
  }

  if (reg === null) {
    return (
      <section className="mx-auto max-w-content px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-ink">No Account Found</h1>
        <p className="mt-2 text-sm text-muted">Register first to view your progress dashboard.</p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(230,0,0,0.4)]"
        >
          Register Now
        </Link>
      </section>
    );
  }

  const track = tracks.find((t) => t.slug === reg.track) ?? tracks[0];
  const mentorName = reg.mentor ? (mentorNames[reg.mentor] ?? reg.mentor) : null;

  return (
    <section className="mx-auto max-w-content px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Welcome, {reg.name} 👋</h1>
          <p className="mt-1 text-sm text-muted">
            Track: <span className="text-accent">{track.name}</span>
            {mentorName && (
              <> &nbsp;·&nbsp; Mentor: <span className="text-ink font-medium">{mentorName}</span></>
            )}
          </p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          {reg.role ?? "Intern"} · Local demo data
        </span>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5 md:col-span-2">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider">Skill Progress</h2>
          <div className="mt-4 space-y-4">
            {skillProgress.map((s) => (
              <div key={s.skill}>
                <div className="mb-1 flex items-center justify-between font-mono text-xs">
                  <span className="text-ink">{s.skill}</span>
                  <span className="text-muted">{s.value}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface2">
                  <div
                    className="h-1.5 rounded-full bg-accent transition-all duration-700"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider">Weekly Plan</h2>
          <ol className="mt-4 space-y-2">
            {track.modules.slice(0, 4).map((m) => (
              <li key={m.week} className="flex items-center gap-2 font-mono text-xs">
                <span className="text-accent">W{m.week}</span>
                <span className="text-ink">{m.title}</span>
              </li>
            ))}
          </ol>
          <Link href={`/tracks/${track.slug}`} className="mt-4 inline-block text-xs text-accent hover:underline">
            View full plan →
          </Link>
        </div>
      </div>
    </section>
  );
}

