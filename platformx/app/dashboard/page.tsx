"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/store";

export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/login"); return; }
    router.replace(`/dashboard/${s.role}`);
  }, [router]);
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}
