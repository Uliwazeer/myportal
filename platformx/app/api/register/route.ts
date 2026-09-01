import { NextResponse } from "next/server";
import { verifyTicket } from "@/lib/otp";

// هذا الـ route شكل مبدئي فقط: بيتحقق من البيانات ويرجع نجاح، من غير تخزين فعلي.
// لما تضيف قاعدة بيانات حقيقية (زي Vercel Postgres أو Supabase)، هنا هو المكان
// اللي هتحط فيه كود الحفظ (insert) بدل الـ TODO تحت.
export async function POST(req: Request) {
  const body = await req.json();
  const required = ["name", "email", "track"];
  const missing = required.filter((f) => !body[f]);

  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `الحقول دي ناقصة: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (!verifyTicket(body.ticket, body.email)) {
    return NextResponse.json(
      { ok: false, error: "لازم تتحقق من بريدك الإلكتروني بالكود الأول" },
      { status: 403 }
    );
  }

  // TODO: احفظ body في قاعدة البيانات هنا.

  return NextResponse.json({ ok: true });
}
