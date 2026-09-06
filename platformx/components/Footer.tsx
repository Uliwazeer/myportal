import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-bg">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted">
        <p className="whitespace-nowrap">
          Copyright &copy; 2026 Mentorship Platform Inc. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <Link href="/tracks" className="hover:text-ink transition-colors">Tracks</Link>
          <Link href="/mentors" className="hover:text-ink transition-colors">Mentors</Link>
          <Link href="/interns" className="hover:text-ink transition-colors">Interns</Link>
          <Link href="/consultations" className="hover:text-ink transition-colors">Consultations</Link>
          <Link href="/labs" className="hover:text-ink transition-colors">Labs</Link>
          <Link
            href="/privacy"
            className="hover:text-ink transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5 text-ink font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
            Egypt
          </span>
        </div>
      </div>
    </footer>
  );
}
