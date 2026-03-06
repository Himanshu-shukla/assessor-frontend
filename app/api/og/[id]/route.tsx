import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params.id;

    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // fetch data
        const res = await fetch(`${API_URL}/analysis/${id}`);
        const data = await res.json();
        const report = data.report || data.aiReport || data;

        const maxScore = 150;
        const score = report?.total_score || 0;
        const pct = Math.round((score / maxScore) * 100) || 0;

        const isGood = pct >= 70;
        const isMid = pct >= 40 && pct < 70;
        const scoreHex = isGood ? "#10b981" : isMid ? "#f59e0b" : "#ef4444";
        const bgGradient = isGood
            ? "linear-gradient(135deg, #a7f3d0 0%, #ffffff 100%)"
            : isMid
                ? "linear-gradient(135deg, #fde68a 0%, #ffffff 100%)"
                : "linear-gradient(135deg, #fecaca 0%, #ffffff 100%)";

        return new ImageResponse(
            (
                <div
                    style={{
                        background: bgGradient,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'sans-serif',
                        padding: '40px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            padding: '60px',
                            borderRadius: '24px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        }}
                    >
                        <div style={{ fontSize: 48, fontWeight: 'bold', color: '#333', marginBottom: 20 }}>
                            AI Resume Analysis Score
                        </div>

                        <div
                            style={{
                                fontSize: 120,
                                fontWeight: '900',
                                color: scoreHex,
                                marginBottom: 20,
                            }}
                        >
                            {pct}%
                        </div>

                        <div style={{ fontSize: 32, color: '#666', fontWeight: '500' }}>
                            ATS Readiness: {score} / {maxScore}
                        </div>

                        <div style={{
                            marginTop: 40,
                            fontSize: 24,
                            color: 'white',
                            backgroundColor: scoreHex,
                            padding: '10px 30px',
                            borderRadius: '40px',
                            fontWeight: 'bold'
                        }} >
                            {isGood ? "🏆 Excellent Profile" : isMid ? "📈 Needs Optimization" : "💪 Needs Rewrite"}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.error(e);
        // Return a fallback image
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 60,
                        background: 'white',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    SkillRank AI Analysis
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    }
}
