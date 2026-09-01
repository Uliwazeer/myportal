"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import StatusPanel from "@/components/StatusPanel";
import JourneyDiagram from "@/components/JourneyDiagram";
import TrackCard from "@/components/TrackCard";
import LabCard from "@/components/LabCard";
import { tracks, labs } from "@/lib/data";

export default function HomePage() {
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
                href="/tracks"
                className="rounded-md border border-border px-5 py-2.5 text-sm text-ink transition-colors hover:border-accent"
              >
                Browse Tracks
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
