import RegisterForm from "./RegisterForm";
import RegisterMentorsList from "./RegisterMentorsList";

export const metadata = { title: "Register & Book — Mentorship Platform" };

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-content px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 rounded-lg border border-border bg-surface p-6 shadow-xl shadow-bg/50">
          <h1 className="text-2xl font-semibold text-ink">Register or Book</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted mb-8 border-b border-border pb-6">
            We will send a 1-minute verification code to your email. After verification, you can book your consultation or proceed with your intern assessment.
          </p>
          <RegisterForm />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Live Platform Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-surface2 p-4 border border-border/50 text-center">
                <p className="text-3xl font-mono text-accent mb-1">1,248</p>
                <p className="text-xs text-muted">Registered Interns</p>
              </div>
              <div className="rounded-md bg-surface2 p-4 border border-border/50 text-center">
                <p className="text-3xl font-mono text-success mb-1">312</p>
                <p className="text-xs text-muted">Booked Consultations</p>
              </div>
              <div className="rounded-md bg-surface2 p-4 border border-border/50 text-center">
                <p className="text-3xl font-mono text-accent2 mb-1">24/7</p>
                <p className="text-xs text-muted">Support Availability</p>
              </div>
              <div className="rounded-md bg-surface2 p-4 border border-border/50 text-center">
                <p className="text-3xl font-mono text-yellow-400 mb-1">★ 4.9</p>
                <p className="text-xs text-muted">Avg Mentor Rating</p>
              </div>
            </div>
          </div>
          
          <RegisterMentorsList />
        </div>
      </div>
    </section>
  );
}
