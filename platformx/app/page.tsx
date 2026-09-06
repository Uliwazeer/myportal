"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StatusPanel from "@/components/StatusPanel";
import JourneyDiagram from "@/components/JourneyDiagram";
import TrackCard from "@/components/TrackCard";
import LabCard from "@/components/LabCard";
import { tracks, labs } from "@/lib/data";
import { getAllMentors, getBookings, getUsers, syncWithServer } from "@/lib/store";
import type { MentorData, Booking, UserProfile } from "@/lib/data";

export default function HomePage() {
  const [mentorsList, setMentorsList] = useState<MentorData[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  useEffect(() => {
    setMentorsList(getAllMentors());
    setBookingsList(getBookings());
    setUsersList(getUsers());

    syncWithServer().then(() => {
      setMentorsList(getAllMentors());
      setBookingsList(getBookings());
      setUsersList(getUsers());
    });
  }, []);

  const recentBookings = bookingsList.slice(-3).reverse();
  const recentInterns = usersList.filter((u) => u.role === "intern").slice(-3).reverse();

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-content px-6 py-16 md:py-24 overflow-hidden">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-semibold leading-tight text-ink md:text-5xl">
              Learn. Build. Get Mentored. Grow Your Career.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              A practical mentorship platform connecting learners with industry experts, hands-on learning, real projects, and guidance to help you build job-ready skills.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-[0_0_15px_rgba(230,0,0,0.5)]"
              >
                Register Now
              </Link>
              <Link
                href="/mentors"
                className="rounded-md border border-border px-5 py-2.5 text-sm text-ink transition-colors hover:border-accent"
              >
                Browse Mentors
              </Link>
              <Link
                href="/consultations"
                className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm text-muted transition-colors hover:text-ink hover:border-border/80"
              >
                Consultations Registry
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatusPanel />
          </motion.div>
        </div>
      </section>

      {/* Live Consultations & Interns Registry Highlight */}
      <section className="border-t border-border bg-surface/30 py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Consultations Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <h3 className="font-bold text-ink text-lg">Recent Consultations</h3>
                  </div>
                  <Link href="/consultations" className="text-xs font-mono text-accent hover:underline">
                    View All ({bookingsList.length}) →
                  </Link>
                </div>
                <p className="text-xs text-muted mb-4">
                  Latest 1-on-1 technical sessions booked with senior experts across cloud, platform, and backend engineering.
                </p>

                <div className="space-y-3">
                  {recentBookings.map((b) => {
                    const client = usersList.find((u) => u.id === b.userId);
                    const mentor = mentorsList.find((m) => m.id === b.mentorId);
                    return (
                      <div key={b.id} className="p-3 rounded-xl bg-surface2 border border-border/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-ink">{client?.name || "Client"}</p>
                          <p className="text-muted text-[11px] truncate max-w-[200px]">
                            {b.topic || b.trackSlug}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-accent font-medium">{mentor?.name || b.mentorId}</p>
                          <p className="text-muted font-mono text-[10px]">📅 {b.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted">Need technical advice?</span>
                <Link
                  href="/book"
                  className="rounded-lg bg-accent/15 border border-accent/30 text-accent hover:bg-accent hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  Book a Consultation
                </Link>
              </div>
            </motion.div>

            {/* Interns Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <h3 className="font-bold text-ink text-lg">Enrolled Interns</h3>
                  </div>
                  <Link href="/interns" className="text-xs font-mono text-accent hover:underline">
                    View All ({usersList.filter((u) => u.role === "intern").length}) →
                  </Link>
                </div>
                <p className="text-xs text-muted mb-4">
                  Learners undergoing structured hands-on apprenticeships with assigned dedicated mentors.
                </p>

                <div className="space-y-3">
                  {recentInterns.map((intern) => {
                    const mentor = mentorsList.find((m) => m.id === intern.mentorId);
                    const trackObj = tracks.find((t) => t.slug === intern.trackSlug);
                    return (
                      <div key={intern.id} className="p-3 rounded-xl bg-surface2 border border-border/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-ink">{intern.name}</p>
                          <p className="text-muted text-[11px]">
                            🚀 {trackObj?.name || intern.trackSlug || "Track"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-accent font-medium">Mentor: {mentor?.name || "Assigned"}</p>
                          <p className="text-muted font-mono text-[10px]">Level: {intern.level || "Junior"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted">Want to level up your engineering skills?</span>
                <Link
                  href="/register?role=intern"
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Apply for Internship
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-content px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-ink">The Learner's Journey</h2>
            <p className="mt-1 text-sm text-muted">From registration to certification</p>
          </motion.div>
          <div className="mt-10">
            <JourneyDiagram />
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="mx-auto max-w-content px-6 py-16">
        <div className="flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-ink">Learning Tracks</h2>
            <p className="mt-1 text-sm text-muted">Each track is 8 weeks, from basics to a full final project</p>
          </motion.div>
          <Link href="/tracks" className="text-sm text-accent hover:underline mb-1">
            View All Tracks
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {tracks.map((t, index) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TrackCard track={t} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Labs preview */}
      <section className="border-t border-border bg-surface/40 pb-20">
        <div className="mx-auto max-w-content px-6 py-16">
          <div className="flex items-end justify-between">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-ink">Sample Labs</h2>
              <p className="mt-1 text-sm text-muted">Real-world scenarios, not theoretical exercises</p>
            </motion.div>
            <Link href="/labs" className="text-sm text-accent hover:underline mb-1">
              View All Labs
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {labs.slice(0, 2).map((l, index) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <LabCard lab={l} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
