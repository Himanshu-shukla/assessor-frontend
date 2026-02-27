"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Send, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// ─── Fixed Theme Configuration ────────────────────────────────────────────────
const activeTheme = {
  name: "Amber Yellow",
  bgGradient: "from-slate-50 via-amber-50 to-yellow-50",
  brandText: "text-amber-500",
  brandHex: "#f59e0b",
  snowText: "text-amber-200",
  badgeBg: "rgba(245, 158, 11, 0.1)",
  badgeBorder: "rgba(245, 158, 11, 0.2)",
  radioActiveBg: "rgba(245, 158, 11, 0.06)",
  radioActiveBorder: "rgba(245, 158, 11, 0.4)",
  radioHoverBg: "rgba(245, 158, 11, 0.02)",
  buttonGradient: "linear-gradient(135deg, #f59e0b, #b45309)",
  buttonShadow: "0 10px 20px rgba(245, 158, 11, 0.25)",
  progressGradient: "linear-gradient(90deg, #f59e0b, #b45309)",
  progressActive: "rgba(245, 158, 11, 0.4)",
  successBg: "rgba(245, 158, 11, 0.12)",
  successBorder: "rgba(245, 158, 11, 0.25)",
  successText: "#f59e0b",
};

// ─── Penguin Thinking Character ───────────────────────────────────────────────
function PenguinThinking({ answered }: { answered: boolean }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 2500 + Math.random() * 1500);
    return () => clearInterval(t);
  }, []);

  const eyeH = blink ? 1 : 7;

  return (
    <motion.div
      className="select-none"
      animate={answered ? { y: [0, -12, 0, -6, 0] } : { y: [0, -4, 0] }}
      transition={
        answered
          ? { duration: 0.6, repeat: 2 }
          : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg viewBox="0 0 90 120" width="90" height="120">
        <ellipse cx="45" cy="116" rx="24" ry="5" fill="rgba(0,0,0,0.08)" />
        <ellipse cx="45" cy="82" rx="30" ry="36" fill="#1e293b" />
        <ellipse cx="45" cy="88" rx="19" ry="25" fill="#f8fafc" />
        <ellipse cx="45" cy="44" rx="26" ry="26" fill="#1e293b" />
        <ellipse cx="45" cy="48" rx="16" ry="16" fill="#f8fafc" />
        
        {answered ? (
          <>
            <path d="M36 42 Q39 38 42 42" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M48 42 Q51 38 54 42" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="34" cy="50" rx="6" ry="4" fill="#fca5a5" opacity="0.6" />
            <ellipse cx="56" cy="50" rx="6" ry="4" fill="#fca5a5" opacity="0.6" />
            <path d="M34 54 Q45 62 56 54" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="39" cy="42" rx="5" ry={eyeH / 1.3} fill="white" />
            <ellipse cx="52" cy="42" rx="5" ry={eyeH / 1.3} fill="white" />
            <circle cx="40" cy="43" r="2.5" fill="#0f172a" />
            <circle cx="53" cy="43" r="2.5" fill="#0f172a" />
            <circle cx="41" cy="41.5" r="1" fill="white" />
            <circle cx="54" cy="41.5" r="1" fill="white" />
            <line x1="36" y1="36" x2="43" y2="38" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="49" y1="37" x2="56" y2="36" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M38 54 Q45 57 52 54" stroke="#64748b" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        
        <polygon points="45,56 41,62 49,62" fill="#f97316" />
        
        <motion.g
          animate={answered ? { rotate: [0, 30, 0, 30, 0] } : { rotate: [3, -3, 3] }}
          transition={answered ? { duration: 0.4, repeat: 3 } : { duration: 2, repeat: Infinity }}
          style={{ originX: "15px", originY: "78px" }}
        >
          <ellipse cx="15" cy="78" rx="8" ry="18" fill="#1e293b" transform="rotate(-8,15,78)" />
        </motion.g>
        
        <motion.g
          animate={answered ? { rotate: [0, -30, 0, -30, 0] } : { rotate: [-3, 3, -3] }}
          transition={answered ? { duration: 0.4, repeat: 3 } : { duration: 2, repeat: Infinity }}
          style={{ originX: "75px", originY: "78px" }}
        >
          <ellipse cx="75" cy="78" rx="8" ry="18" fill="#1e293b" transform="rotate(8,75,78)" />
          {!answered && (
            <line x1="78" y1="62" x2="86" y2="50" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          )}
        </motion.g>
        
        <ellipse cx="37" cy="113" rx="10" ry="5" fill="#f97316" />
        <ellipse cx="53" cy="113" rx="10" ry="5" fill="#f97316" />
        
        {!answered && (
          <>
            <motion.circle cx="72" cy="30" r="3" fill="rgba(148, 163, 184, 0.3)"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.circle cx="80" cy="20" r="4.5" fill="rgba(148, 163, 184, 0.3)"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
            <motion.circle cx="91" cy="10" r="7" fill="rgba(148, 163, 184, 0.2)"
              animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
            <motion.text x="85" y="14" fontSize="8" textAnchor="middle" fill="#64748b" fontStyle="italic" fontWeight="bold"
              animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            >
              ?
            </motion.text>
          </>
        )}
      </svg>
    </motion.div>
  );
}

// ─── Snowflakes ───────────────────────────────────────────────────────────────
function Snowflakes({ snowClass }: { snowClass: string }) {
  const [mounted, setMounted] = useState(false);
  const [flakes, setFlakes] = useState<{ left: number; size: number; opacity: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    setFlakes(Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      size: 9 + Math.random() * 12,
      opacity: 0.2 + Math.random() * 0.3,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 12,
    })));
  }, []);

  if (!mounted || flakes.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {flakes.map((flake, i) => (
        <motion.div
          key={i}
          className={`absolute select-none transition-colors duration-1000 drop-shadow-sm ${snowClass}`}
          style={{
            left: `${flake.left}%`,
            top: "-20px",
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
          }}
          animate={{ y: ["0vh", "110vh"], rotate: [0, 360] }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
}

// ─── Circular progress timer ──────────────────────────────────────────────────
function TimerRing({ seconds, total, themeHex }: { seconds: number; total: number; themeHex: string }) {
  const pct = seconds / total;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  
  // Danger/Warning colors stay consistent, normal uses theme color
  const color = seconds > total * 0.5 ? themeHex : seconds > total * 0.2 ? "#f59e0b" : "#ef4444";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 60, height: 60 }}>
      <svg width="60" height="60" className="absolute">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth="4" />
        <motion.circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 30 30)"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }}
          transition={{ duration: 0.5, stroke: { duration: 1 } }}
        />
      </svg>
      <span className="relative text-xs font-black transition-colors duration-1000" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Question Progress Bar ─────────────────────────────────────────────────────
function QuestionProgress({ current, total, theme }: { current: number; total: number; theme: any }) {
  return (
    <div className="flex gap-1.5">
      {[...Array(total)].map((_, i) => (
        <motion.div
          key={i}
          className="h-2 rounded-full flex-1 transition-all duration-1000"
          style={{
            background:
              i < current
                ? theme.progressGradient
                : i === current
                  ? theme.progressActive
                  : "rgba(15, 23, 42, 0.05)",
          }}
          animate={i === current ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ─── Main Test Page ───────────────────────────────────────────────────────────
export default function TestPage() {
  const router = useRouter();
  const { test, uploadId, setResults } = useStore();
  const { setQuestions, setAnswer, nextQuestion, questions, currentQuestionIndex, answers } = test;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const TOTAL_TIME = 30 * 60;

  // Fetch questions
  useEffect(() => {
    if (!uploadId) { 
      router.push("/"); 
      return; 
    }
    
    const fetchQuestions = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/test/${uploadId}/questions`);
        const questionsArray = data.questions || data;
        
        if (!questionsArray || questionsArray.length === 0) {
           setError("No questions found for this assessment.");
           return;
        }

        setQuestions(questionsArray);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load questions. Please refresh.");
      }
    };
    
    fetchQuestions();
  }, [uploadId, setQuestions, router]);
  

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers: Record<string, string> = {};
      questions.forEach((q, index) => {
        const questionId = q._id || q.id;
        if (answers[index] && questionId) {
          formattedAnswers[questionId] = answers[index];
        }
      });

      const { data } = await axios.post(`${API_URL}/test/${uploadId}/submit`, {
        answers: formattedAnswers
      });

      setResults(data);
      router.push("/results");
    } catch {
      setSubmitting(false);
      setError("Failed to submit. Please try again.");
    }
  };

  const handleNext = () => {
    if (isLast) {
      handleSubmit();
    } else {
      setDirection(1);
      nextQuestion();
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <main className={`min-h-screen flex flex-col items-center justify-center gap-6 transition-colors duration-1000 bg-gradient-to-br ${activeTheme.bgGradient}`}>
        <Snowflakes snowClass={activeTheme.snowText} />
        <PenguinThinking answered={false} />
        <p className={`font-bold text-lg transition-colors duration-1000 ${activeTheme.brandText}`}>
          Loading your assessment...
        </p>
      </main>
    );
  }

  const currentQ = questions?.[currentQuestionIndex];

  if (!currentQ) {
    return null; 
  }

  const isLast = currentQuestionIndex === questions.length - 1;
  const hasAnswer = !!answers[currentQuestionIndex];
  const isUrgent = timeLeft < TOTAL_TIME * 0.2;

  // ── Error ──
  if (error) {
    return (
      <main
        className={`min-h-screen flex items-center justify-center transition-colors duration-1000 bg-gradient-to-br ${activeTheme.bgGradient}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 bg-white/80 p-8 rounded-3xl shadow-xl border border-red-100 backdrop-blur-xl"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-slate-800 font-black text-xl">{error}</p>
          <Button onClick={() => router.push("/")} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-5 rounded-xl shadow-lg shadow-red-200">
            Go Back Home
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-10 transition-colors duration-1000 bg-gradient-to-br ${activeTheme.bgGradient}`}
      style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
    >
     
      <Snowflakes snowClass={activeTheme.snowText} />

      {/* Urgent timer pulse background */}
      {isUrgent && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          animate={{ opacity: [0, 0.03, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ background: "radial-gradient(circle at center, #ef4444 0%, transparent 70%)" }}
        />
      )}

      <div className="relative z-10 w-full max-w-2xl space-y-5">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white/60 px-6 py-3 rounded-2xl shadow-sm border border-white/50 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white rounded-xl shadow-sm border border-slate-100 p-1">🐧</span>
            <div>
              <h1 className="text-xl font-black text-slate-800 leading-none transition-colors duration-500">
                Skill<span className={activeTheme.brandText}>{activeTheme.name.split(" ")[1] || "Rank"}</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Technical Assessment</p>
            </div>
          </div>
          <TimerRing seconds={timeLeft} total={TOTAL_TIME} themeHex={activeTheme.brandHex} />
        </motion.div>

        {/* ── Progress ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 px-2"
        >
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className={activeTheme.brandText}>{Math.round(((currentQuestionIndex) / questions.length) * 100)}% complete</span>
          </div>
          <QuestionProgress current={currentQuestionIndex} total={questions.length} theme={activeTheme} />
        </motion.div>

        {/* ── Main card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card
              className="border border-white/60 overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(255,255,255,0.5) inset",
              }}
            >
              <CardContent className="p-0">

                {/* Card top bar */}
                <div
                  className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100/60"
                >
                  <div className="flex items-center gap-4">
                    <PenguinThinking answered={hasAnswer} />
                    <div>
                      <p className="text-slate-400 font-semibold text-xs mb-1 uppercase tracking-wider">Current topic</p>
                      <Badge
                        className="text-xs font-black border px-3 py-1 shadow-sm transition-all duration-1000"
                        style={{
                          background: activeTheme.badgeBg,
                          color: activeTheme.brandHex,
                          borderColor: activeTheme.badgeBorder,
                        }}
                      >
                        {currentQ.skill}
                      </Badge>
                    </div>
                  </div>

                  {/* Answered indicator */}
                  <AnimatePresence>
                    {hasAnswer && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="text-xs font-bold flex items-center gap-1.5 px-4 py-2 rounded-full shadow-sm transition-all duration-1000"
                        style={{ 
                          background: activeTheme.successBg, 
                          border: `1px solid ${activeTheme.successBorder}`,
                          color: activeTheme.successText
                        }}
                      >
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.4 }}
                        >
                          ✓
                        </motion.span>
                        Answered!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Question text */}
                <div className="px-8 py-8">
                  <motion.h2
                    className="text-xl md:text-2xl font-black text-slate-800 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {currentQ.text}
                  </motion.h2>
                </div>

                {/* Options */}
                <div className="px-8 pb-8 space-y-3">
                  {currentQ.options.map((opt: { id: string; text: string }, i: number) => {
                    const selected = answers[currentQuestionIndex] === opt.id;
                    return (
                      <motion.label
                        key={opt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.07 }}
                        whileHover={{ scale: 1.01, backgroundColor: !selected ? activeTheme.radioHoverBg : undefined }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300"
                        style={{
                          background: selected ? activeTheme.radioActiveBg : "rgba(255, 255, 255, 0.5)",
                          border: selected ? `2px solid ${activeTheme.radioActiveBorder}` : "2px solid rgba(15,23,42,0.05)",
                          boxShadow: selected ? `0 4px 12px ${activeTheme.badgeBg}` : "0 2px 5px rgba(15,23,42,0.02)",
                        }}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={opt.id}
                          checked={selected}
                          onChange={() => setAnswer(currentQuestionIndex, opt.id)}
                          className="sr-only"
                        />

                        {/* Custom radio */}
                        <motion.div
                          className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-500"
                          style={{
                            borderColor: selected ? activeTheme.brandHex : "rgba(15,23,42,0.15)",
                            background: selected ? activeTheme.brandHex : "white",
                          }}
                          animate={selected ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ duration: 0.2 }}
                        >
                          {selected && (
                            <motion.div
                              className="w-2.5 h-2.5 rounded-full bg-white shadow-sm"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.15 }}
                            />
                          )}
                        </motion.div>

                        {/* Option label letter */}
                        <span
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black transition-colors duration-500"
                          style={{
                            background: selected ? activeTheme.badgeBg : "rgba(15,23,42,0.04)",
                            color: selected ? activeTheme.brandHex : "#64748b",
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>

                        <span
                          className={`text-base font-semibold leading-relaxed transition-colors duration-300 ${selected ? 'text-slate-800' : 'text-slate-600'}`}
                        >
                          {opt.text}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>

                {/* Footer */}
                <div
                  className="px-6 py-5 flex items-center justify-between border-t border-slate-100/60 bg-white/40"
                >
                  <p className="text-slate-500 font-medium text-sm">
                    {hasAnswer ? "Great! Move to the next question." : "Select an answer to continue."}
                  </p>

                  <motion.div whileHover={hasAnswer ? { scale: 1.03 } : {}} whileTap={hasAnswer ? { scale: 0.97 } : {}}>
                    <Button
                      onClick={handleNext}
                      disabled={!hasAnswer || submitting}
                      className="font-black text-base px-8 py-6 rounded-xl transition-all duration-1000 border-0"
                      style={{
                        background: hasAnswer ? activeTheme.buttonGradient : "#f1f5f9",
                        color: hasAnswer ? "white" : "#94a3b8",
                        boxShadow: hasAnswer ? activeTheme.buttonShadow : "none",
                        cursor: hasAnswer ? "pointer" : "not-allowed",
                      }}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                          >
                            ⚙️
                          </motion.span>
                          Analyzing...
                        </span>
                      ) : isLast ? (
                        <span className="flex items-center gap-2">
                          Submit & Get Rank
                          <Send className="w-5 h-5" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Next Question
                          <ChevronRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* ── Footer tip ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm font-semibold text-slate-500 bg-white/50 py-2 px-4 rounded-full w-max mx-auto shadow-sm border border-white"
        >
          🐧 The penguin is rooting for you · {questions.length - currentQuestionIndex - 1} questions remaining
        </motion.p>
      </div>
    </main>
  );
}