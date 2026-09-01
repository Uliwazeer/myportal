import { NextResponse } from "next/server";
import { verifyTicket } from "@/lib/otp";

export async function POST(req: Request) {
  const body = await req.json();

  // Validate role
  const validRoles = ["intern", "mentor", "consultation"];
  if (!body.role || !validRoles.includes(body.role)) {
    return NextResponse.json(
      { ok: false, error: "Invalid role. Must be intern, mentor, or consultation." },
      { status: 400 }
    );
  }

  // Required fields per role
  const baseRequired = ["name", "email", "phone", "role"];
  const roleRequired: Record<string, string[]> = {
    intern: [...baseRequired, "trackSlug", "level"],
    mentor: [...baseRequired, "title"],
    consultation: [...baseRequired],
  };

  const required = roleRequired[body.role] || baseRequired;
  const missing = required.filter((f) => !body[f]);

  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // Verify OTP ticket
  if (!verifyTicket(body.ticket, body.email)) {
    return NextResponse.json(
      { ok: false, error: "OTP verification required. Please verify your email first." },
      { status: 403 }
    );
  }

  // NOTE: Users are saved to localStorage by the client after this API responds OK.
  // In a production setup, you would save to a database here.

  return NextResponse.json({ ok: true });
}
