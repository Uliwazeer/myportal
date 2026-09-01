import LabCard from "@/components/LabCard";
import { labs } from "@/lib/data";

export const metadata = { title: "Labs — PlatformX" };

export default function LabsPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Hands-on Labs</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        Each lab is built on a real-world scenario with clear acceptance criteria — no passive "watch and memorize".
      </p>
      <p className="mt-2 max-w-lg text-xs text-muted">
        This is a preview — automated execution and grading will be connected in a future release.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {labs.map((l) => (
          <LabCard key={l.id} lab={l} />
        ))}
      </div>
    </section>
  );
}

