"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { tracks, mentors } from "@/lib/data";
import { getSession, getUnreadCount } from "@/lib/store";
import type { UserProfile } from "@/lib/data";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<UserProfile | null>(null);
  const [unread, setUnread] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s) setUnread(getUnreadCount(s.id));
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const results = query.trim().length > 0
    ? [
        ...tracks
          .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
          .map((t) => ({ type: "Track", label: t.name, href: `/tracks/${t.slug}` })),
        ...mentors
          .filter(
            (m) =>
              m.name.toLowerCase().includes(query.toLowerCase()) ||
              m.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
          )
          .map((m) => ({ type: "Mentor", label: `${m.name} — ${m.title}`, href: `/mentors/${m.id}` })),
      ]
    : [];

  const dashboardHref =
    session?.role === "intern"
      ? "/dashboard/intern"
      : session?.role === "mentor"
      ? "/dashboard/mentor"
      : session?.role === "consultation"
      ? "/dashboard/consultation"
      : "/dashboard";

  return (
    <header className="border-b border-border sticky top-0 bg-bg/90 backdrop-blur-md z-50">
      <div className="mx-auto flex max-w-content items-center justify-between px-4 md:px-6 py-3 gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse group-hover:scale-150 transition-transform" />
          <span className="font-mono text-base md:text-lg font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
            Mentorship Platform
          </span>
        </Link>

        {/* Search bar (desktop) */}
        <div className="relative hidden md:flex flex-1 max-w-sm">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search mentors, tracks, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
            >
              ✕
            </button>
          )}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-border bg-surface shadow-lg z-50 max-h-64 overflow-y-auto">
              {results.map((r, i) => (
                <Link
                  key={i}
                  href={r.href}
                  onClick={() => setQuery("")}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface2 border-b border-border last:border-0"
                >
                  <span className="text-[10px] font-mono text-accent border border-accent/40 rounded px-1.5 py-0.5 shrink-0">
                    {r.type}
                  </span>
                  <span className="text-sm text-ink truncate">{r.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/tracks" className="text-sm text-muted hover:text-accent transition-colors">Tracks</Link>
          <Link href="/mentors" className="text-sm text-muted hover:text-accent transition-colors">Mentors</Link>
          <Link href="/labs" className="text-sm text-muted hover:text-accent transition-colors">Labs</Link>
          {session && (
            <Link href={dashboardHref} className="relative text-sm text-muted hover:text-accent transition-colors">
              Dashboard
              {unread > 0 && (
                <span className="absolute -top-1 -right-3 bg-accent text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden text-muted hover:text-ink p-1.5 rounded"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* Notification Bell Dropdown */}
          {session && (
            <Link
              href={`${dashboardHref}?tab=notifications`}
              className="relative p-1.5 text-muted hover:text-ink transition-colors rounded-lg hover:bg-surface2"
              title="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unread > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-white font-mono text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {unread}
                </span>
              )}
            </Link>
          )}

          {session ? (
            <Link href={dashboardHref} className="flex items-center gap-2 text-sm text-ink pl-1">
              <span className="h-7 w-7 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-xs font-bold text-accent">
                {session.name[0].toUpperCase()}
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:block text-sm text-muted hover:text-ink transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-[0_0_10px_rgba(230,0,0,0.3)] hidden md:block"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-muted hover:text-ink p-1.5 rounded"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 relative">
          <input
            type="text"
            placeholder="Search mentors, tracks, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            autoFocus
          />
          {results.length > 0 && (
            <div className="absolute left-4 right-4 top-full rounded-md border border-border bg-surface shadow-lg z-50 max-h-56 overflow-y-auto">
              {results.map((r, i) => (
                <Link
                  key={i}
                  href={r.href}
                  onClick={() => { setQuery(""); setSearchOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface2 border-b border-border last:border-0"
                >
                  <span className="text-[10px] font-mono text-accent border border-accent/40 rounded px-1.5 py-0.5">
                    {r.type}
                  </span>
                  <span className="text-sm text-ink truncate">{r.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-bg px-4 py-4 space-y-3">
          <Link onClick={() => setMenuOpen(false)} href="/tracks" className="block text-sm text-muted hover:text-accent transition-colors py-1">Tracks</Link>
          <Link onClick={() => setMenuOpen(false)} href="/mentors" className="block text-sm text-muted hover:text-accent transition-colors py-1">Mentors</Link>
          <Link onClick={() => setMenuOpen(false)} href="/labs" className="block text-sm text-muted hover:text-accent transition-colors py-1">Labs</Link>
          {session ? (
            <Link onClick={() => setMenuOpen(false)} href={dashboardHref} className="block text-sm text-ink hover:text-accent py-1">
              Dashboard {unread > 0 && <span className="ml-1 bg-accent text-white text-xs rounded-full px-1.5">{unread}</span>}
            </Link>
          ) : (
            <>
              <Link onClick={() => setMenuOpen(false)} href="/login" className="block text-sm text-muted hover:text-ink py-1">Sign In</Link>
              <Link onClick={() => setMenuOpen(false)} href="/register" className="block w-full text-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
