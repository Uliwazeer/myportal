import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-content px-6 py-24 text-center">
      <p className="font-mono text-xs text-accent">404</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">الصفحة مش موجودة</h1>
      <Link href="/" className="mt-6 inline-block text-sm text-accent hover:underline">
        ارجع للرئيسية
      </Link>
    </section>
  );
}
