"use client";

import { usePathname } from "next/navigation";
import InterviewBooking from "@/components/InterviewBooking";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Define which paths should NOT show the booking component
    const hideOnPaths = ["/test"];
    const shouldShowBooking = !hideOnPaths.includes(pathname);

    return (
        <>
            {children}
            {shouldShowBooking && <InterviewBooking />}
        </>
    );
}
