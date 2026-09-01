import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-bg/80 backdrop-blur-md z-50">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse group-hover:scale-150 transition-transform" />
          <span className="font-mono text-lg font-bold tracking-tight text-ink group-hover:text-accent transition-colors">PlatformX</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/tracks" className="text-sm text-muted transition-colors hover:text-accent">
            Tracks
          </Link>
          <Link href="/labs" className="text-sm text-muted transition-colors hover:text-accent">
            Labs
          </Link>
          <Link href="/dashboard" className="text-sm text-muted transition-colors hover:text-accent">
            Dashboard
          </Link>
        </nav>

        <Link
          href="/register"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-[0_0_10px_rgba(230,0,0,0.4)] hover:shadow-[0_0_20px_rgba(230,0,0,0.6)]"
        >
          Register Now
        </Link>
      </div>
    </header>
  );
}
