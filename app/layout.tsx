"use client"; // Added this to use hooks

import { usePathname } from "next/navigation"; // Added this
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InterviewBooking from "@/components/InterviewBooking";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get current path

  // Define which paths should NOT show the booking component
  const hideOnPaths = ["/test"];
  const shouldShowBooking = !hideOnPaths.includes(pathname);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        {shouldShowBooking && <InterviewBooking />}
      </body>
    </html>
  );
}