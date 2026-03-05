import { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Skill Rank | Professional Resume Ranking & Analysis",
    template: "%s | Skill Rank",
  },
  description: "Rank your resume, analyze your skills, and get professional feedback to land your dream job. Use Skill Rank's AI-powered assessment tool today.",
  keywords: ["rank your resume", "resume analysis", "skill assessment", "career growth", "job search", "AI resume checker", "Skill Rank", "Mastery Nexus"],
  authors: [{ name: "Mastery Nexus" }],
  creator: "Mastery Nexus",
  publisher: "Mastery Nexus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Skill Rank | Professional Resume Ranking & Analysis",
    description: "Rank your resume and get AI-powered feedback instantly.",
    url: "https://masterynexus.com",
    siteName: "Skill Rank | Mastery Nexus",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Skill Rank branding",
      },
    ],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Rank | Professional Resume Ranking & Analysis",
    description: "Rank your resume and get AI-powered feedback instantly.",
    creator: "@masterynexus",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}