import { NextResponse } from "next/server";
import { dbGetActivities } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activities = dbGetActivities();
    return NextResponse.json({ ok: true, activities });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
