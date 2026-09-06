import { NextResponse } from "next/server";
import { dbGetAnalytics } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = dbGetAnalytics();
    return NextResponse.json({ ok: true, stats });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
