"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSession } from "@/lib/store";

function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let vId = localStorage.getItem("px_visitor_id");
  if (!vId) {
    vId = "vis_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem("px_visitor_id", vId);
  }
  return vId;
}

function detectDevice(): string {
  if (typeof window === "undefined") return "Desktop";
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectBrowser(): string {
  if (typeof window === "undefined") return "Browser";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  return "Browser";
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const vId = getVisitorId();
    const session = getSession();

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: vId,
        userId: session?.id,
        page: pathname || "/",
        referrer: typeof document !== "undefined" ? document.referrer : "",
        device: detectDevice(),
        browser: detectBrowser(),
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
