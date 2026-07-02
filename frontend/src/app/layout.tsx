import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
