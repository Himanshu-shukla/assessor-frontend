import { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import JsonLd from "@/components/SEO/JsonLd";

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
  metadataBase: new URL("https://masterynexus.com"),
  title: {
    default: "Skill Rank | Professional Resume Ranking & Analysis",
    template: "%s | Skill Rank",
  },
  description: "Rank your resume, analyze your skills, and get professional feedback to land your dream job. Use Skill Rank's AI-powered assessment tool today.",
  verification: {
    google: [
      "TsnXXwEoCqOXmCh4OZabYtjU0cV9B8trJPo1rHk0-Yc",
      "googled50787fd1293d642"
    ],
  },
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
        alt: "Skill Rank | AI-Powered Resume Analysis",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
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
  alternates: {
    canonical: "https://masterynexus.com",
    languages: {
      "en-US": "https://masterynexus.com/en-US",
    },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <JsonLd />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}