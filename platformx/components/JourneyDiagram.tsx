"use client";

import { journey } from "@/lib/data";
import { motion } from "framer-motion";

export default function JourneyDiagram() {
  return (
    <ol className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
      {journey.map((j, idx) => (
        <motion.li 
          key={j.step} 
          className="relative rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
        >
          <span className="font-mono text-xs text-accent">{String(j.step).padStart(2, "0")}</span>
          <h3 className="mt-2 text-sm font-medium text-ink">{j.label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">{j.desc}</p>
        </motion.li>
      ))}
    </ol>
  );
}
