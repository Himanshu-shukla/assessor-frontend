import type { Metadata } from 'next'

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const id = params.id;

    // Use VERCEL_URL or NEXT_PUBLIC_APP_URL if defined, otherwise default to localhost or hardcoded URL
    // NOTE: In production, you'll want NEXT_PUBLIC_APP_URL to be exactly your domain like https://skillrank.ai
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    return {
        title: 'SkillRank AI - Resume Analysis',
        description: 'Check out my resume analysis score and ATS readiness on SkillRank AI!',
        openGraph: {
            images: [
                {
                    url: `${baseUrl}/api/og/${id}`,
                    width: 1200,
                    height: 630,
                    alt: 'SkillRank AI Resume Analysis Score',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            images: [`${baseUrl}/api/og/${id}`],
        }
    }
}

export default function AnalysisLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
