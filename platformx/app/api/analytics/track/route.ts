import { NextResponse } from "next/server";
import { dbRecordVisit } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.visitorId) {
      return NextResponse.json({ ok: false, error: "Missing visitorId" }, { status: 400 });
    }

    const recorded = dbRecordVisit({
      visitorId: body.visitorId,
      sessionId: body.sessionId,
      userId: body.userId,
      page: body.page || "/",
      referrer: body.referrer,
      device: body.device || "Desktop",
      browser: body.browser || "Browser",
    });

    return NextResponse.json({ ok: true, event: recorded });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
