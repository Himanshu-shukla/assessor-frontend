"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, RefreshCw, Sparkles, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const loadingPhrases = [
    "Scanning document structure...",
    "Evaluating career trajectory...",
    "Analyzing technical depth...",
    "Cross-referencing with industry standards...",
    "Generating final insights...",
];

export default function AnalysisPage() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axios.get(`${API_URL}/analysis/${id}`);

            setReport(data.report || data.aiReport);
        } catch (err: any) {
            console.error(err);
            setError("Failed to load analysis report. The AI might be taking a coffee break.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAnalysis();
    }, [id]);

    // Cycle through loading phrases
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setLoadingPhraseIdx((prev) => (prev + 1) % loadingPhrases.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [loading]);

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#fafcff] px-4 sm:px-6 py-10 font-sans">

            {/* Background Abstract Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/40 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-10"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                AI Deep Analysis
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">15-Parameter Framework Evaluation</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 rounded-xl font-semibold shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Upload</span>
                    </Button>
                </motion.div>

                {/* LOADING STATE */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32"
                    >
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 rounded-3xl bg-indigo-200 animate-ping opacity-60" />
                            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-300">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.p
                                key={loadingPhraseIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="text-slate-600 font-bold text-lg"
                            >
                                {loadingPhrases[loadingPhraseIdx]}
                            </motion.p>
                        </AnimatePresence>
                        <p className="text-slate-400 text-sm mt-2 font-medium">This usually takes about 10-15 seconds.</p>
                    </motion.div>
                )}

                {/* ERROR STATE */}
                {error && !loading && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-red-200 bg-red-50/50 shadow-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-10 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                                    <span className="text-3xl">⚠️</span>
                                </div>
                                <h3 className="text-xl font-bold text-red-900 mb-2">Analysis Interrupted</h3>
                                <p className="text-red-600 font-medium mb-6 max-w-md">{error}</p>

                                <Button
                                    onClick={fetchAnalysis}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 py-6 shadow-lg shadow-red-200"
                                >
                                    <RefreshCw className="mr-2 w-5 h-5" />
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* REPORT CONTENT */}
                {!loading && report && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <Card
                            className="border border-white/80 rounded-3xl overflow-hidden"
                            style={{
                                background: "rgba(255, 255, 255, 0.7)",
                                backdropFilter: "blur(24px)",
                                boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255,255,255,0.6) inset",
                            }}
                        >
                            <CardContent className="p-8 sm:p-12">

                                {/* HEAVY CUSTOMIZATION FOR MARKDOWN 
                  This makes the AI's emojis, tables, and headers look like a premium dashboard.
                */}
                                <div className="prose prose-slate max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-800
                  prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:text-center prose-h1:mb-12 prose-h1:pb-8 prose-h1:border-b border-slate-200 prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:bg-gradient-to-r prose-h1:from-indigo-600 prose-h1:to-sky-600
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:flex prose-h2:items-center prose-h2:gap-2
                  prose-h3:text-lg prose-h3:text-slate-700 prose-h3:mt-8
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                  prose-strong:text-slate-900 prose-strong:font-extrabold
                  prose-ul:list-none prose-ul:pl-0 prose-ul:space-y-3
                  prose-li:flex prose-li:items-start prose-li:gap-2 prose-li:text-slate-600 prose-li:font-medium prose-li:bg-white/50 prose-li:px-4 prose-li:py-2 prose-li:rounded-lg prose-li:border prose-li:border-slate-100
                  prose-table:w-full prose-table:mt-8 prose-table:rounded-2xl prose-table:overflow-hidden prose-table:border-collapse prose-table:shadow-sm
                  prose-thead:bg-slate-800 prose-thead:text-white
                  prose-th:py-4 prose-th:px-6 prose-th:text-left prose-th:font-bold
                  prose-tr:bg-white/60 even:prose-tr:bg-slate-50/60 hover:prose-tr:bg-sky-50/50 prose-tr:transition-colors
                  prose-td:py-4 prose-td:px-6 prose-td:border-b prose-td:border-slate-100 prose-td:font-medium prose-td:text-slate-700
                ">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Intercept standard Markdown elements and inject custom Tailwind classes
                                            table: ({ node, ...props }) => (
                                                <div className="overflow-x-auto my-10 rounded-2xl border border-slate-200 shadow-sm">
                                                    <table className="w-full text-left border-collapse bg-white min-w-[800px]" {...props} />
                                                </div>
                                            ),
                                            thead: ({ node, ...props }) => (
                                                <thead className="bg-slate-800 text-white" {...props} />
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th className="py-4 px-6 font-bold text-sm uppercase tracking-wider border-b border-slate-700 whitespace-nowrap" {...props} />
                                            ),
                                            tbody: ({ node, ...props }) => (
                                                <tbody className="divide-y divide-slate-100" {...props} />
                                            ),
                                            tr: ({ node, ...props }) => (
                                                <tr className="hover:bg-sky-50/40 transition-colors group" {...props} />
                                            ),
                                            td: ({ node, ...props }) => {
                                                // Auto-detect columns based on content to apply smart widths
                                                const content = props.children?.toString() || "";
                                                const isNumber = /^\d+$/.test(content.trim());
                                                const isScore = content.includes("/10") || /^\d+(\.\d+)?$/.test(content.trim());

                                                return (
                                                    <td
                                                        className={`py-4 px-6 text-slate-700 align-top ${isNumber ? "w-12 text-center font-bold text-slate-400" :
                                                                isScore ? "w-24 text-center font-black text-indigo-600" :
                                                                    "min-w-[300px]" // Forces the 'Comments' column to take up the most space
                                                            }`}
                                                        {...props}
                                                    />
                                                );
                                            }
                                        }}
                                    >
                                        {report}
                                    </ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ACTION SECTION */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
                        >
                            <div className="text-center sm:text-left sm:flex-1 sm:pl-4">
                                <h4 className="text-lg font-bold text-slate-800">Ready to prove your skills?</h4>
                                <p className="text-sm text-slate-500 font-medium">Take the dynamically generated technical test.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/")}
                                    className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-6 px-6"
                                >
                                    Upload Another
                                </Button>

                                <Button
                                    onClick={() => router.push(`/test/${id}`)}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-200 font-bold py-6 px-8 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                                >
                                    <Target className="mr-2 w-5 h-5 group-hover:animate-pulse" />
                                    Start Technical Test
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}