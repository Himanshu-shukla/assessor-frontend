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
        {/* Shadow */}
        <ellipse cx="45" cy="116" rx="24" ry="5" fill="rgba(0,0,0,0.2)" />
        {/* Body */}
        <ellipse cx="45" cy="82" rx="30" ry="36" fill="#1a1a2e" />
        <ellipse cx="45" cy="88" rx="19" ry="25" fill="#f0f0f0" />
        {/* Head */}
        <ellipse cx="45" cy="44" rx="26" ry="26" fill="#1a1a2e" />
        <ellipse cx="45" cy="48" rx="16" ry="16" fill="#f0f0f0" />
        {/* Eyes */}
        {answered ? (
          <>
            {/* Happy squint */}
            <path d="M36 42 Q39 38 42 42" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M48 42 Q51 38 54 42" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Blush */}
            <ellipse cx="34" cy="50" rx="6" ry="4" fill="#FF9999" opacity="0.5" />
            <ellipse cx="56" cy="50" rx="6" ry="4" fill="#FF9999" opacity="0.5" />
            {/* Smile */}
            <path d="M34 54 Q45 62 56 54" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="39" cy="42" rx="5" ry={eyeH / 1.3} fill="white" />
            <ellipse cx="52" cy="42" rx="5" ry={eyeH / 1.3} fill="white" />
            <circle cx="40" cy="43" r="2.5" fill="#111" />
            <circle cx="53" cy="43" r="2.5" fill="#111" />
            <circle cx="41" cy="41.5" r="1" fill="white" />
            <circle cx="54" cy="41.5" r="1" fill="white" />
            {/* Thinking expression - raised eyebrow */}
            <line x1="36" y1="36" x2="43" y2="38" stroke="#4b5563" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="49" y1="37" x2="56" y2="36" stroke="#4b5563" strokeWidth="1.8" strokeLinecap="round" />
            {/* Neutral-curious mouth */}
            <path d="M38 54 Q45 57 52 54" stroke="#4b5563" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* Beak */}
        <polygon points="45,56 41,62 49,62" fill="#FF8C00" />
        {/* Left wing */}
        <motion.g
          animate={answered ? { rotate: [0, 30, 0, 30, 0] } : { rotate: [3, -3, 3] }}
          transition={answered ? { duration: 0.4, repeat: 3 } : { duration: 2, repeat: Infinity }}
          style={{ originX: "15px", originY: "78px" }}
        >
          <ellipse cx="15" cy="78" rx="8" ry="18" fill="#1a1a2e" transform="rotate(-8,15,78)" />
        </motion.g>
        {/* Right wing — holds pencil when not answered */}
        <motion.g
          animate={answered ? { rotate: [0, -30, 0, -30, 0] } : { rotate: [-3, 3, -3] }}
          transition={answered ? { duration: 0.4, repeat: 3 } : { duration: 2, repeat: Infinity }}
          style={{ originX: "75px", originY: "78px" }}
        >
          <ellipse cx="75" cy="78" rx="8" ry="18" fill="#1a1a2e" transform="rotate(8,75,78)" />
          {!answered && (
            <line x1="78" y1="62" x2="86" y2="50" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          )}
        </motion.g>
        {/* Feet */}
        <ellipse cx="37" cy="113" rx="10" ry="5" fill="#FF8C00" />
        <ellipse cx="53" cy="113" rx="10" ry="5" fill="#FF8C00" />
        {/* Thinking bubble */}
        {!answered && (
          <>
            <motion.circle cx="72" cy="30" r="3" fill="rgba(255,255,255,0.3)"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.circle cx="80" cy="20" r="4.5" fill="rgba(255,255,255,0.3)"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
            <motion.circle cx="91" cy="10" r="7" fill="rgba(255,255,255,0.2)"
              animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
            <motion.text x="85" y="14" fontSize="8" textAnchor="middle"
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
function Snowflakes() {
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client (browser)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during Server-Side Rendering to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute select-none text-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-20px",
            fontSize: `${9 + Math.random() * 12}px`,
            opacity: 0.08 + Math.random() * 0.1,
          }}
          animate={{ y: ["0vh", "110vh"], rotate: [0, 360] }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 12,
            ease: "linear",
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
}

function SnowBackground() {
  const [flakes, setFlakes] = useState<
    { left: number; size: number; opacity: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 24 }).map(() => ({
      left: Math.random() * 100,
      size: 10 + Math.random() * 14,
      opacity: 0.12 + Math.random() * 0.14,
      duration: 7 + Math.random() * 10,
      delay: Math.random() * 12,
    }));

    setFlakes(generated);
  }, []);

  if (flakes.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flakes.map((flake, i) => (
        <motion.div
          key={i}
          className="absolute select-none text-white"
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
function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = seconds / total;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = seconds > total * 0.5 ? "#22d3ee" : seconds > total * 0.2 ? "#f59e0b" : "#ef4444";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 60, height: 60 }}>
      <svg width="60" height="60" className="absolute">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <motion.circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 30 30)"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <span className="relative text-xs font-black" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Question Progress Bar ─────────────────────────────────────────────────────
function QuestionProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {[...Array(total)].map((_, i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-full flex-1"
          style={{
            background:
              i < current
                ? "linear-gradient(90deg,#22d3ee,#3b82f6)"
                : i === current
                  ? "rgba(34,211,238,0.4)"
                  : "rgba(255,255,255,0.08)",
          }}
          animate={i === current ? { opacity: [0.4, 1, 0.4] } : {}}
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
        
        // 🔥 FIX: Use data.questions if it exists, otherwise fall back to data directly
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
      // 1. Transform index-based answers to ID-based answers
      const formattedAnswers: Record<string, string> = {};

      questions.forEach((q, index) => {
        // Depending on how your API returns data, it might be q._id or q.id
        const questionId = q._id || q.id;

        if (answers[index] && questionId) {
          formattedAnswers[questionId] = answers[index];
        }
      });

      // 2. Send the formatted answers to the backend
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
      <main className="min-h-screen flex flex-col items-center justify-center gap-6">
        <PenguinThinking answered={false} />
        <p className="text-cyan-400 font-bold text-lg">
          Loading your assessment...
        </p>
      </main>
    );
  }

  const currentQ = questions?.[currentQuestionIndex];

  if (!currentQ) {
    return null; // extra safety
  }

  const isLast = currentQuestionIndex === questions.length - 1;
  const hasAnswer = !!answers[currentQuestionIndex];
  const isUrgent = timeLeft < TOTAL_TIME * 0.2;

  // ── Error ──
  if (error) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #080e1c 0%, #0c1830 50%, #0a2040 100%)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-400 font-bold text-lg">{error}</p>
          <Button onClick={() => router.push("/")} className="bg-cyan-500 hover:bg-cyan-400 text-white">
            Go Back Home
          </Button>
        </motion.div>
      </main>
    );
  }

  // ── Loading ──
  if (!currentQ) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(160deg, #080e1c 0%, #0c1830 50%, #0a2040 100%)" }}
      >
        <Snowflakes />
        <PenguinThinking answered={false} />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-cyan-400 font-bold text-lg"
        >
          Loading your assessment...
        </motion.div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-500"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-10"
      style={{
        background: "linear-gradient(160deg, #080e1c 0%, #0c1830 50%, #0a2040 100%)",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      <Snowflakes />

      {/* Urgent timer pulse background */}
      {isUrgent && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0, 0.05, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ background: "radial-gradient(circle at center, #ef4444 0%, transparent 70%)" }}
        />
      )}

      <div className="relative z-10 w-full max-w-2xl space-y-5">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐧</span>
            <div>
              <h1 className="text-xl font-black text-white leading-none">
                Skill<span className="text-cyan-400">Rank</span>
              </h1>
              <p className="text-xs text-slate-600">Technical Assessment</p>
            </div>
          </div>
          <TimerRing seconds={timeLeft} total={TOTAL_TIME} />
        </motion.div>

        {/* ── Progress ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-xs text-slate-500">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex) / questions.length) * 100)}% complete</span>
          </div>
          <QuestionProgress current={currentQuestionIndex} total={questions.length} />
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
              className="border-0 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)",
              }}
            >
              <CardContent className="p-0">

                {/* Card top bar */}
                <div
                  className="px-6 pt-6 pb-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <PenguinThinking answered={hasAnswer} />
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Current topic</p>
                      <Badge
                        className="text-xs font-black border-0 px-3 py-1"
                        style={{
                          background: "rgba(34,211,238,0.12)",
                          color: "#22d3ee",
                          border: "1px solid rgba(34,211,238,0.25)",
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
                        className="text-green-400 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
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
                <div className="px-6 py-5">
                  <motion.h2
                    className="text-xl font-bold text-white leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {currentQ.text}
                  </motion.h2>
                </div>

                {/* Options */}
                <div className="px-6 pb-6 space-y-3">
                  {currentQ.options.map((opt: { id: string; text: string }, i: number) => {
                    const selected = answers[currentQuestionIndex] === opt.id;
                    return (
                      <motion.label
                        key={opt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.07 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: selected
                            ? "rgba(34,211,238,0.1)"
                            : "rgba(255,255,255,0.03)",
                          border: selected
                            ? "1px solid rgba(34,211,238,0.5)"
                            : "1px solid rgba(255,255,255,0.07)",
                          boxShadow: selected ? "0 0 20px rgba(34,211,238,0.08)" : "none",
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
                          className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: selected ? "#22d3ee" : "rgba(255,255,255,0.2)",
                            background: selected ? "#22d3ee" : "transparent",
                          }}
                          animate={selected ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.2 }}
                        >
                          {selected && (
                            <motion.div
                              className="w-2 h-2 rounded-full bg-white"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.15 }}
                            />
                          )}
                        </motion.div>

                        {/* Option label letter */}
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                          style={{
                            background: selected ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.06)",
                            color: selected ? "#22d3ee" : "#64748b",
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>

                        <span
                          className="text-sm font-medium leading-relaxed"
                          style={{ color: selected ? "#e2e8f0" : "#94a3b8" }}
                        >
                          {opt.text}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>

                {/* Footer */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-slate-600 text-xs">
                    {hasAnswer ? "Great! Move to the next question." : "Select an answer to continue."}
                  </p>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handleNext}
                      disabled={!hasAnswer || submitting}
                      className="font-black text-sm px-6 py-2.5 rounded-xl transition-all border-0"
                      style={{
                        background: hasAnswer
                          ? "linear-gradient(135deg, #22d3ee, #3b82f6)"
                          : "rgba(255,255,255,0.07)",
                        color: hasAnswer ? "white" : "#475569",
                        boxShadow: hasAnswer ? "0 0 20px rgba(34,211,238,0.3)" : "none",
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
                          <Send className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Next Question
                          <ChevronRight className="w-4 h-4" />
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
          className="text-center text-xs text-slate-700"
        >
          🐧 The penguin is rooting for you · {questions.length - currentQuestionIndex - 1} questions remaining
        </motion.p>
      </div>
    </main>
  );
}