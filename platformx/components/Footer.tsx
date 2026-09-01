import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-bg">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted">
        <p className="whitespace-nowrap">
          Copyright &copy; 2026 Mentorship Platform Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
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
