import { Metadata } from 'next';
import AnalysisClient from './AnalysisClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Resume Analysis for User ${id} | Skill Rank`,
        description: "View the AI-powered resume analysis, detailed ATS readiness score, and overall profile ranking.",
        openGraph: {
            title: "My AI Resume Analysis | Skill Rank",
            description: "Check out my AI-powered ATS resume analysis and skill ranking!",
            url: `https://masterynexus.com/analysis/${id}`,
            images: [
                {
                    url: '/opengraph-image.png',
                    width: 1200,
                    height: 630,
                    alt: "Skill Rank | Professional Resume Ranking & Analysis"
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: "My AI Resume Analysis | Skill Rank",
            description: "Check out my AI-powered ATS resume analysis and skill ranking!",
        }
    }
}

export default function AnalysisPage() {
    return <AnalysisClient />;
}
