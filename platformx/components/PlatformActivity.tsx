"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Activity } from "@/lib/data";

const fallbackActivities: Activity[] = [
  {
    id: "act-1",
    type: "consultation_booked",
    userName: "Hassan Bakr",
    mentorName: "Ahmed Gamal",
    details: "Linux Systems Patching & Ansible Automation",
    timestamp: "10 minutes ago",
  },
  {
    id: "act-2",
    type: "review_added",
    userName: "Kareem Fahmy",
    mentorName: "Ahmed Moustafa",
    details: "Rated 5.0 ★ 'Transformed our engineering velocity'",
    timestamp: "1 hour ago",
  },
  {
    id: "act-3",
    type: "internship_started",
    userName: "Hany Mansour",
    mentorName: "Waleed Gharieb",
    details: "Started 8-week Platform Engineering apprenticeship",
    timestamp: "3 hours ago",
  },
  {
    id: "act-4",
    type: "consultation_completed",
    userName: "Tarek Abdelrahman",
    mentorName: "Waleed Gharieb",
    details: "Completed 60-min Infrastructure Automation session",
    timestamp: "Yesterday",
  },
];

export default function PlatformActivity() {
  const [activities, setActivities] = useState<Activity[]>(fallbackActivities);

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.activities && json.activities.length > 0) {
          setActivities(json.activities);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-ink text-sm font-mono tracking-tight uppercase">Live Platform Activity</h3>
        </div>
        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          Real-time
        </span>
      </div>

      <div className="space-y-3">
        {activities.slice(0, 5).map((act, index) => {
          let badge = { icon: "🟢", color: "text-emerald-400", title: "Consultation Booked" };
          if (act.type === "review_added") {
            badge = { icon: "⭐", color: "text-yellow-400", title: "Review Submitted" };
          } else if (act.type === "internship_started") {
            badge = { icon: "🚀", color: "text-blue-400", title: "Internship Started" };
          } else if (act.type === "consultation_completed") {
            badge = { icon: "✓", color: "text-teal-400", title: "Session Completed" };
          }

          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-surface2/60 border border-border/40 hover:border-border transition-colors text-xs"
            >
              <span className="text-base select-none mt-0.5 shrink-0">{badge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ink font-medium leading-snug">
                  <span className="font-semibold text-ink">{act.userName}</span>{" "}
                  {act.type === "consultation_booked" && "booked a consultation with"}{" "}
                  {act.type === "review_added" && "reviewed"}{" "}
                  {act.type === "internship_started" && "started an apprenticeship with"}{" "}
                  {act.type === "consultation_completed" && "completed a session with"}{" "}
                  <span className="text-accent font-semibold">{act.mentorName}</span>
                </p>
                <p className="text-[11px] text-muted truncate mt-0.5">{act.details}</p>
              </div>
              <span className="text-[10px] font-mono text-muted shrink-0 mt-0.5">{act.timestamp}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
