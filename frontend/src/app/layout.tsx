import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const title = "ResumeIQ — AI Resume Screening";
const description =
  "Upload a job description and a stack of resumes. Get back a ranked, explainable shortlist in seconds.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["resume screening", "HR automation", "AI recruiting", "candidate ranking"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title,
    description,
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakarta.variable} relative min-h-screen font-sans antialiased`}
      >
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-300/25 blur-[100px]" />
          <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-200/20 blur-[100px]" />
        </div>
        <Header />
        {children}
      </body>
    </html>
  );
}
