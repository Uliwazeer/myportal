import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOtpEmail(email: string, code: string): Promise<{ sent: boolean }> {
  // من غير RESEND_API_KEY، الكود بيتطبع في الـ logs بس عشان تقدر تجرب المشروع
  // من غير ما تعمل حساب بريد فعلي. لازم تضيف المتغير ده قبل الإطلاق الحقيقي.
  if (!resend) {
    console.log(`[PlatformX][dev] كود التحقق لـ ${email}: ${code}`);
    return { sent: false };
  }

  await resend.emails.send({
    from: process.env.OTP_FROM_EMAIL || "PlatformX <onboarding@resend.dev>",
    to: email,
    subject: "كود التحقق من PlatformX",
    html: `
      <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;max-width:420px">
        <p style="font-size:15px;color:#111">كود التحقق بتاعك لإكمال التسجيل في PlatformX:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#111">${code}</p>
        <p style="font-size:13px;color:#666">الكود صالح لمدة دقيقة واحدة فقط من وقت إرساله.</p>
      </div>
    `,
  });

  return { sent: true };
}
