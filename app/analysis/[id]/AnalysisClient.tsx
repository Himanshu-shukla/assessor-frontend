"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, RefreshCw, Sparkles, Target, ArrowRight, Share2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface ResumeScoreParameter {
    id: number;
    parameter: string;
    score: number;
    comments: string;
}

interface AIReport {
    total_score: number;
    parameters: ResumeScoreParameter[];
}

interface ResumeRank {
    rank: number;
    total: number;
    percentile: number;
    profileKey: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const loadingPhrases = [
    "Scanning document structure...",
    "Evaluating career trajectory...",
    "Analyzing technical depth...",
    "Cross-referencing industry standards...",
    "Generating final insights...",
];

const goodMessages = ["🔥 Recruiter bait: ACTIVATED!", "🏆 Top tier developer energy!", "🚀 You're literally built different!"];
const midMessages = ["📈 Growth mindset unlocked!", "💪 Almost there — keep pushing!", "🔧 A little polish goes a long way."];
const badMessages = ["😤 This is your villain origin story.", "💡 Every expert was once a beginner.", "🏋️ The grind starts NOW."];

// ─── Styling Utilities (Light Theme Colors) ──────────────────────────────────
const scoreStyle = (s: number) =>
    s >= 8 ? { hex: "#10b981", dim: "rgba(16,185,129,0.12)", label: "Strong" }
        : s >= 5 ? { hex: "#f59e0b", dim: "rgba(245,158,11,0.12)", label: "Fair" }
            : { hex: "#ef4444", dim: "rgba(239,68,68,0.12)", label: "Weak" };

const overallColor = (pct: number) =>
    pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";

// ─── Font & Keyframe Injection ────────────────────────────────────────────────
const Fonts = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Lato:wght@300;400;700&display=swap');
    .font-disp { font-family: 'Bricolage Grotesque', sans-serif; }
    .font-body { font-family: 'Lato', sans-serif; }
    @keyframes shimmer-light { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `}</style>
);

// ─── Floating Motivation Component ────────────────────────────────────────────
function Motivation({ messages, color }: { messages: string[]; color: string }) {
    const [idx, setIdx] = useState(0);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const t = setInterval(() => {
            setShow(false);
            setTimeout(() => { setIdx(p => (p + 1) % messages.length); setShow(true); }, 350);
        }, 3800);
        return () => clearInterval(t);
    }, [messages]);

    return (
        <div className="h-12 flex items-center relative w-full justify-center lg:justify-start">
            <AnimatePresence mode="wait">
                {show && (
                    <motion.span key={idx}
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.3 }}
                        className="font-disp absolute font-bold whitespace-nowrap rounded-full px-4 py-1.5 shadow-sm"
                        style={{
                            fontSize: "clamp(0.78rem,2.2vw,0.92rem)",
                            color, background: `${color}10`, border: `1px solid ${color}30`,
                        }}>
                        {messages[idx]}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Arc Gauge Component ──────────────────────────────────────────────────────
function ArcGauge({ pct, score, max, color }: { pct: number, score: number, max: number, color: string }) {
    const R = 60, C = 2 * Math.PI * R;
    const filled = (pct / 100) * C * 0.75;

    // We set the mathematical center of the circle to Y=85
    const centerY = 85;

    return (
        <div className="relative w-40 h-[130px] shrink-0 mx-auto lg:mx-0">
            <svg width="160" height="130" className="overflow-visible">
                <circle cx="80" cy={centerY} r={R} fill="none" stroke="rgba(15,23,42,0.06)"
                    strokeWidth="10" strokeDasharray={`${C * 0.75} ${C}`}
                    strokeDashoffset={C * 0.125} strokeLinecap="round" transform={`rotate(135 80 ${centerY})`} />
                <motion.circle cx="80" cy={centerY} r={R} fill="none" stroke={color}
                    strokeWidth="10" strokeDasharray={`0 ${C}`} strokeDashoffset={C * 0.125}
                    strokeLinecap="round" transform={`rotate(135 80 ${centerY})`}
                    animate={{ strokeDasharray: `${filled} ${C}` }}
                    transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
                    style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                />
            </svg>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="absolute left-1/2 top-[85px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full"
            >
                <div className="font-disp font-extrabold text-slate-800 leading-none" style={{ fontSize: "clamp(2rem,7vw,2.6rem)" }}>
                    {pct}%
                </div>
                <div className="text-[11px] font-bold mt-1" style={{ color }}>
                    {score} / {max}
                </div>
            </motion.div>
        </div>
    );
}
// ─── Profile Label Map ────────────────────────────────────────────────────────
const profileLabels: Record<string, string> = {
    backend: "Backend Developers",
    frontend: "Frontend Developers",
    data_analytics: "Data Analytics Professionals",
    full_stack: "Full Stack Developers",
    devops: "DevOps Engineers",
    mobile: "Mobile Developers",
    data_science: "Data Scientists",
    general: "Developers",
};

// ─── Rank Card Component ──────────────────────────────────────────────────────
function RankCard({ resumeRank, color, messages }: { resumeRank: ResumeRank; color: string; messages: string[] }) {
    const { rank, total, percentile, profileKey } = resumeRank;
    const topPct = 100 - percentile;
    const label = profileLabels[profileKey] ?? "Developers";
    const ordinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const tierLabel =
        topPct <= 5  ? "🏆 Elite Tier" :
        topPct <= 15 ? "🔥 Top Performer" :
        topPct <= 35 ? "📈 Above Average" :
        topPct <= 65 ? "💪 Solid Candidate" :
                       "💡 Rising Talent";

    return (
        <div className="p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-center h-full gap-8 lg:gap-10 text-center lg:text-left mt-4 sm:mt-0">
            {/* Rank Orb */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.3 }}
                className="shrink-0 relative flex flex-col items-center justify-center"
            >
                <div
                    className="w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center shadow-2xl"
                    style={{
                        background: `radial-gradient(circle at 35% 35%, ${color}30, ${color}08)`,
                        border: `3px solid ${color}50`,
                        boxShadow: `0 0 36px ${color}30, 0 0 8px ${color}20`,
                    }}
                >
                    <div className="font-disp font-extrabold text-slate-800 leading-none" style={{ fontSize: "clamp(1.9rem,7vw,2.6rem)" }}>
                        #{rank.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold mt-1.5" style={{ color }}>
                        of {total.toLocaleString()}
                    </div>
                </div>
                {/* Pulsing ring */}
                <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ border: `2px solid ${color}` }}
                />
            </motion.div>

            {/* Text Section */}
            <div className="flex-1 w-full flex flex-col items-center lg:items-start justify-center">
                {/* Tier Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 mb-4 shadow-sm"
                    style={{ background: `${color}10`, border: `1px solid ${color}35` }}>
                    <span className="text-xs font-bold" style={{ color }}>{tierLabel}</span>
                </div>

                <h2 className="font-disp font-extrabold text-slate-800 leading-tight mb-2" style={{ fontSize: "clamp(1.3rem,4.5vw,1.9rem)" }}>
                    You&apos;re ranked{" "}
                    <span style={{ color }}>{ordinal(rank)}</span>{" "}
                    <span className="text-slate-500 font-bold">out of</span>{" "}
                    <span style={{ color }}>{total.toLocaleString()}</span>
                </h2>

                <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-3 font-medium">
                    Among <strong className="text-slate-700">{label}</strong> on our platform.
                    You&apos;re in the{" "}
                    <strong style={{ color }}>Top {topPct}%</strong>.
                </p>

                {/* Percentile bar */}
                <div className="w-full max-w-xs">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                        <span>Bottom</span><span>Top</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg,${color}80,${color})` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentile}%` }}
                            transition={{ duration: 1.6, ease: "easeOut", delay: 0.5 }}
                        />
                    </div>
                    <div className="text-center text-[11px] font-bold mt-1" style={{ color }}>Percentile {percentile}</div>
                </div>

                <div className="mt-4">
                    <Motivation messages={messages} color={color} />
                </div>
            </div>
        </div>
    );
}

// ─── Parameter Card Component ───────────────────────────────────────────────
function ParamCard({ param, delay }: { param: ResumeScoreParameter, delay: number }) {
    const st = scoreStyle(param.score);
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 h-full"
        >
            <div className="flex justify-between items-start gap-3">
                <div>
                    <div className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        #{param.id}
                    </div>
                    <div className="font-disp font-bold text-slate-800 leading-snug" style={{ fontSize: "clamp(0.85rem,2.5vw,0.95rem)" }}>
                        {param.parameter}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1" style={{ background: st.dim, border: `1px solid ${st.hex}40` }}>
                    <span className="font-disp text-base font-extrabold" style={{ color: st.hex }}>{param.score}</span>
                    <span className="text-[0.65rem] font-bold text-slate-500">/10</span>
                </div>
            </div>

            <div className="h-1.5 w-full rounded-full overflow-hidden bg-slate-100 shrink-0">
                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${st.hex}cc, ${st.hex})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(param.score / 10) * 100}%` }}
                    transition={{ duration: 1.1, delay: delay + 0.2, ease: "easeOut" }}
                />
            </div>

            <div className="text-sm font-body text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border-l-2 flex-grow" style={{ borderLeftColor: st.hex }}>
                {param.comments}
            </div>

            <div className="flex mt-auto pt-1">
                <span className="text-[0.68rem] font-bold rounded-full px-2.5 py-0.5" style={{ color: st.hex, background: st.dim }}>
                    {st.label}
                </span>
            </div>
        </motion.div>
    );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function AnalysisPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const setUploadStatus = useStore((state) => state.setUploadStatus);

    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<AIReport | null>(null);
    const [resumeRank, setResumeRank] = useState<ResumeRank | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [phraseIdx, setPhraseIdx] = useState(0);
    const [showPhrase, setShowPhrase] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const fetchAnalysis = async () => {
        try {
            setLoading(true); setError(null);
            const { data } = await axios.get(`${API_URL}/analysis/${id}`);
            const reportData = data.report || data.aiReport || data;

            if (typeof reportData === 'string') throw new Error("Backend returned a string instead of JSON. Please clear your DB.");
            setReport(reportData);
            if (data.resumeRank) setResumeRank(data.resumeRank);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to load analysis report.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchAnalysis(); }, [id]);

    useEffect(() => {
        if (!loading) return;
        const t = setInterval(() => {
            setShowPhrase(false);
            setTimeout(() => { setPhraseIdx(p => (p + 1) % loadingPhrases.length); setShowPhrase(true); }, 300);
        }, 2600);
        return () => clearInterval(t);
    }, [loading]);

    // Calculations
    const maxScore = 150;
    const score = report?.total_score || 0;
    const pct = Math.round((score / maxScore) * 100) || 0;
    const parameters = report?.parameters || [];

    // Ranking display helpers
    const rankPercentile = resumeRank?.percentile ?? pct;
    const isGood = rankPercentile >= 65, isMid = rankPercentile >= 35 && rankPercentile < 65;
    const scoreHex = overallColor(rankPercentile);
    const motMsgs = isGood ? goodMessages : isMid ? midMessages : badMessages;

    // Light Theme Ambient Blob Colors
    const blobA = isGood ? "#a7f3d0" : isMid ? "#fde68a" : "#fecaca";
    const blobB = isGood ? "#bae6fd" : isMid ? "#fed7aa" : "#fbcfe8";

    // Format Data for Recharts Radar
    const radarData = parameters.map((p) => ({
        subject: p.parameter.length > 16 ? p.parameter.slice(0, 16) + "..." : p.parameter,
        score: p.score,
        fullMark: 10,
    }));

    // ─── NATIVE SHARE FUNCTION ────────────────────────────────────────────────
    const handleShare = async () => {
        const shareUrl = window.location.href;
        const rankText = resumeRank
            ? `I ranked #${resumeRank.rank.toLocaleString()} out of ${resumeRank.total.toLocaleString()} ${profileLabels[resumeRank.profileKey] ?? "Developers"} on SkillRank AI! 🚀`
            : `I scored ${pct}% on my AI Resume Analysis! 🚀`;
        const text = rankText;

        // Use native share sheet if available (Android / iOS)
        if (navigator.share) {
            try {
                await navigator.share({ title: "My AI Resume Analysis", text, url: shareUrl });
                return;
            } catch (err) {
                // User dismissed — do nothing
                return;
            }
        }

        // Fallback: copy to clipboard (desktop)
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2500);
            }
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    };

    return (
        <>
            <Fonts />
            <main className="min-h-screen relative overflow-x-hidden font-body bg-[#fafcff]">

                {/* ── Background Elements ── */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <motion.div animate={{ background: blobA }} transition={{ duration: 1.4 }}
                        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-50" style={{ filter: "blur(100px)" }} />
                    <motion.div animate={{ background: blobB }} transition={{ duration: 1.4 }}
                        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-50" style={{ filter: "blur(120px)" }} />
                    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                </div>

                {/* WIDE CONTAINER TO MAXIMIZE SCREEN SPACE */}
                <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8 max-w-[1400px]">

                    {/* ── Header ── */}
                    <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                        className="flex items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 px-6 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                                <Sparkles className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="font-disp font-extrabold text-slate-800 leading-tight" style={{ fontSize: "clamp(1.1rem,3.5vw,1.5rem)" }}>
                                    AI Deep Analysis
                                </h1>
                            </div>
                        </div>

                        <button onClick={() => {
                            setUploadStatus("idle");
                            router.push("/");
                        }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </motion.div>

                    {/* ── Loading State ── */}
                    {loading && (
                        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 gap-6 flex-grow">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                                <div className="absolute inset-0 rounded-3xl bg-indigo-200 animate-ping opacity-60" />
                                <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200">
                                    <Loader2 className="text-white w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
                                </div>
                            </div>
                            <div className="h-10 relative w-full flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {showPhrase && (
                                        <motion.p key={phraseIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}
                                            className="font-disp absolute text-slate-700 font-bold text-center" style={{ fontSize: "clamp(0.9rem,2.5vw,1.05rem)" }}>
                                            {loadingPhrases[phraseIdx]}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Report Content ── */}
                    {!loading && report && (
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="flex flex-col gap-8">

                            {/* ── TOP SECTION: ATS Readiness & Radar (Side-by-Side) ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                                {/* 1. Hero Ranking Card */}
                                <div id="score-card" className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col h-full w-full">
                                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg,${scoreHex},${scoreHex}60)` }} />

                                    {/* Desktop Share Button */}
                                    <button
                                        onClick={handleShare}
                                        title="Share"
                                        className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all duration-300 shadow-sm group z-10 hidden sm:flex items-center gap-2 cursor-pointer"
                                    >
                                        <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold font-body tracking-wide pr-1">
                                            {isCopied ? "Copied!" : "Share"}
                                        </span>
                                    </button>

                                    {/* Mobile Share Button */}
                                    <button
                                        onClick={handleShare}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 sm:hidden z-10 shadow-sm cursor-pointer transition-all"
                                    >
                                        {isCopied ? (
                                            <span className="text-[10px] font-bold px-1">Copied!</span>
                                        ) : (
                                            <Share2 className="w-4 h-4" />
                                        )}
                                    </button>

                                    {resumeRank ? (
                                        <RankCard resumeRank={resumeRank} color={scoreHex} messages={motMsgs} />
                                    ) : (
                                        /* Fallback: plain score while rank loads */
                                        <div className="p-6 sm:p-10 flex flex-col items-center justify-center h-full gap-4 text-center mt-4 sm:mt-0">
                                            <div className="font-disp font-extrabold text-slate-800" style={{ fontSize: "clamp(2.5rem,10vw,4rem)" }}>
                                                {pct}%
                                            </div>
                                            <div className="text-slate-500 text-sm font-medium">Resume Score ({score}/{maxScore})</div>
                                            <Motivation messages={motMsgs} color={scoreHex} />
                                        </div>
                                    )}
                                </div>

                                {/* 2. Recharts Radar Chart */}
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col h-full w-full">
                                    <div className="flex items-center gap-3 mb-4 shrink-0 justify-center lg:justify-start">
                                        <Target className="text-indigo-500 w-5 h-5" />
                                        <h3 className="font-disp text-slate-800 font-extrabold text-lg">Skill Matrix Visualization</h3>
                                    </div>

                                    <div className="flex-1 w-full min-h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                                <PolarGrid stroke="#e2e8f0" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700, fontFamily: 'Lato' }}
                                                />
                                                <Radar
                                                    name="Resume Score"
                                                    dataKey="score"
                                                    stroke={scoreHex}
                                                    strokeWidth={2}
                                                    fill={scoreHex}
                                                    fillOpacity={0.25}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* ── Section Header ── */}
                            <div className="flex items-center gap-3 px-2 pt-2">
                                <h3 className="font-disp text-slate-800 font-extrabold text-xl">Detailed Breakdown</h3>
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{parameters.length} metrics</span>
                            </div>

                            {/* ── 3. Spacious & Dynamic Grid ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {parameters.map((p, i) => (
                                    <ParamCard key={p.id} param={p} delay={0.3 + i * 0.04} />
                                ))}
                            </div>

                            {/* ── 4. Action Section ── */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                                className="mt-8 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                            >
                                <div>
                                    <h4 className="font-disp text-slate-800 font-extrabold text-lg sm:text-xl mb-1.5">Want a better rank? 🎯</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">Take the skill test to prove your abilities and improve your standing among {profileLabels[resumeRank?.profileKey ?? "general"] ?? "Developers"}.</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button onClick={() => {
                                        setUploadStatus("idle");
                                        router.push("/");
                                    }}
                                        className="px-6 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                                        Upload Another
                                    </button>

                                    <button onClick={() => router.push(`/test/${id}`)}
                                        className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-disp font-bold text-sm shadow-lg shadow-emerald-200 hover:-translate-y-0.5 hover:shadow-emerald-300 transition-all">
                                        <Target className="w-4 h-4" />
                                        Start Technical Test
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>

                            {/* Footer */}
                            <p className="text-center text-slate-400 font-bold text-xs pt-4 pb-8">
                                © {new Date().getFullYear()} SkillRank AI · Powered by Mastery Nexus
                            </p>
                        </motion.div>
                    )}
                </div>
            </main>
        </>
    );
}