import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").trim();
  const code = String(body.code || "").trim();
  const token = String(body.token || "");

  if (!email || !code || !token) {
    return NextResponse.json({ ok: false, error: "Email, code, and token are required." }, { status: 400 });
  }

  const result = verifyOtp(token, email, code);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  }

  // الـ ticket ده لازم يترجع مع بيانات الفورم في خطوة التسجيل النهائية.
  return NextResponse.json({ ok: true, ticket: result.ticket });
}
