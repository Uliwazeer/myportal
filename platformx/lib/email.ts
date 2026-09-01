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
    from: process.env.OTP_FROM_EMAIL || "Mentorship Platform <onboarding@resend.dev>",
    to: email,
    subject: "Your Mentorship Platform Verification Code",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0c0c; color: #ffffff; padding: 40px 20px; border-radius: 12px; max-width: 480px; margin: 0 auto; border: 1px solid #222;">
        <div style="margin-bottom: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Mentorship Platform</h2>
        </div>
        <p style="font-size: 15px; color: #a1a1aa; line-height: 1.5; margin-bottom: 20px;">Use the following verification code to complete your authentication:</p>
        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 20px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #e60000;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #71717a; margin-bottom: 0;">This code is valid for 1 minute. If you did not request this code, please ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
}
