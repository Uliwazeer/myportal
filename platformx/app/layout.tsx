import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MentorSite — Learn. Mentor. Consult.",
  description:
    "The complete IT mentorship and consultation platform. Learn with expert mentors, complete hands-on labs, and book 1-on-1 sessions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans bg-bg text-ink">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#ffffff",
              border: "1px solid #333333",
            },
            success: { iconTheme: { primary: "#E60000", secondary: "#fff" } },
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
