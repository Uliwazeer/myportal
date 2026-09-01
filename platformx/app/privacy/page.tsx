import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Mentorship Platform",
  description: "Privacy Policy and terms for Mentorship Platform.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg py-16 px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <Link
            href="/"
            className="text-xs text-muted hover:text-ink transition-colors mb-4 inline-block"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
          <p className="text-xs text-muted mt-1 font-mono">Last updated: September 2026 &middot; Mentorship Platform Inc. (Egypt)</p>
        </div>

        <div className="space-y-6 text-sm text-muted leading-relaxed border-t border-border pt-6">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">1. Information We Collect</h2>
            <p>
              When you register on Mentorship Platform as an Intern, Mentor, or for Consultations, we collect your name, email address, Egyptian phone number, and professional details necessary to facilitate mentorship sessions and assessments.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">2. How We Use Your Information</h2>
            <p>
              Your data is solely used to verify your account via OTP, schedule 1-on-1 sessions, calculate progress, and notify you regarding booking status and reviews. We never sell your personal information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">3. Cancellation &amp; Refund Policy</h2>
            <p>
              Interns may cancel any booked session with a 100% full refund up to 12 hours prior to the scheduled start time. Cancellations requested less than 12 hours before the session are non-refundable to protect the mentor&apos;s allocated time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">4. Contact &amp; Support</h2>
            <p>
              For privacy inquiries, dispute resolutions, or questions regarding your bookings in Egypt and the MENA region, contact our support team directly through your dashboard.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
