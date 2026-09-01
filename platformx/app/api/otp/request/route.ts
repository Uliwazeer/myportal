import { NextResponse } from "next/server";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "البريد الإلكتروني مش صحيح" }, { status: 400 });
  }

  const { code, token } = createOtp(email);
  const { sent } = await sendOtpEmail(email, code);

  return NextResponse.json({
    ok: true,
    // الـ token ده لازم يترجع مع الكود في خطوة التحقق — من غيره التحقق هيفشل.
    token,
    // الكود بيرجع في الرد فقط لو مفيش خدمة إيميل حقيقية مربوطة (وضع تجربة).
    ...(sent ? {} : { debugCode: code }),
  });
}
