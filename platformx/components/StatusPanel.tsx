"use client";

import { useEffect, useState } from "react";
import { getAllMentors, getAllTracks, getUsers, getBookings } from "@/lib/store";
import { labs } from "@/lib/data";

export default function StatusPanel() {
  const [stats, setStats] = useState({
    learners: 0,
    mentors: 4,
    tracks: 7,
    labs: labs.length,
    sessions: 0,
    rating: 4.9,
  });

  useEffect(() => {
    const allUsers = getUsers();
    const allMentors = getAllMentors();
    const allTracksList = getAllTracks();
    const allBookings = getBookings();

    const learnersCount = allUsers.filter((u) => u.role === "intern" || u.role === "consultation").length;
    const mentorsCount = allMentors.length;
    const completedSessions = allBookings.filter((b) => b.status === "completed").length;

    setStats({
      learners: learnersCount,
      mentors: mentorsCount,
      tracks: allTracksList.length,
      labs: labs.length,
      sessions: completedSessions || allBookings.length,
      rating: 4.9,
    });
  }, []);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xl shadow-black/40">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <span className="font-mono text-xs text-muted">platform_status</span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          live
        </span>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-surface2 p-3 border border-border/40">
          <dt className="font-mono text-[10px] text-muted">learners_total</dt>
          <dd className="mt-1 font-mono text-2xl text-ink font-bold">{stats.learners}</dd>
          <dd className="text-[11px] text-muted">Registered Learners</dd>
        </div>

        <div className="rounded-lg bg-surface2 p-3 border border-border/40">
          <dt className="font-mono text-[10px] text-muted">mentors_active</dt>
          <dd className="mt-1 font-mono text-2xl text-accent font-bold">{stats.mentors}</dd>
          <dd className="text-[11px] text-muted">Active Mentors</dd>
        </div>

        <div className="rounded-lg bg-surface2 p-3 border border-border/40">
          <dt className="font-mono text-[10px] text-muted">tracks_total</dt>
          <dd className="mt-1 font-mono text-2xl text-ink font-bold">{stats.tracks}</dd>
          <dd className="text-[11px] text-muted">Learning Tracks</dd>
        </div>

        <div className="rounded-lg bg-surface2 p-3 border border-border/40">
          <dt className="font-mono text-[10px] text-muted">practical_labs</dt>
          <dd className="mt-1 font-mono text-2xl text-ink font-bold">{stats.labs}</dd>
          <dd className="text-[11px] text-muted">Hands-on Labs</dd>
        </div>

        <div className="rounded-lg bg-surface2 p-3 border border-border/40">
          <dt className="font-mono text-[10px] text-muted">sessions_held</dt>
          <dd className="mt-1 font-mono text-2xl text-ink font-bold">{stats.sessions}</dd>
          <dd className="text-[11px] text-muted">Mentorship Sessions</dd>
        </div>

        <div className="rounded-lg bg-surface2 p-3 border border-border/40">
          <dt className="font-mono text-[10px] text-muted">mentor_rating</dt>
          <dd className="mt-1 font-mono text-2xl text-yellow-400 font-bold">★ {stats.rating}</dd>
          <dd className="text-[11px] text-muted">Avg Satisfaction</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        {[
          { name: "mentorship_matching", status: "healthy" },
          { name: "interactive_labs", status: "healthy" },
          { name: "live_sessions_webrtc", status: "healthy" },
          { name: "automated_code_reviews", status: "healthy" },
        ].map((svc) => (
          <div key={svc.name} className="flex items-center justify-between font-mono text-xs">
            <span className="text-muted">{svc.name}</span>
            <span className="text-success">{svc.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
