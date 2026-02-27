"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, TrendingUp, AlertTriangle, Zap, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Theme Configuration (Applies to background & brand elements) ─────────────
const themes = [
  {
    name: "Sky Blue",
    bgGradient: "from-slate-50 via-sky-50 to-indigo-50",
    brandText: "text-sky-500",
    brandHex: "#0ea5e9",
    buttonBg: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100",
  },
  {
    name: "Rose Red",
    bgGradient: "from-slate-50 via-rose-50 to-pink-50",
    brandText: "text-rose-500",
    brandHex: "#f43f5e",
    buttonBg: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100",
  },
  {
    name: "Emerald Green",
    bgGradient: "from-slate-50 via-emerald-50 to-teal-50",
    brandText: "text-emerald-500",
    brandHex: "#10b981",
    buttonBg: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
  },
  {
    name: "Amber Yellow",
    bgGradient: "from-slate-50 via-amber-50 to-yellow-50",
    brandText: "text-amber-500",
    brandHex: "#f59e0b",
    buttonBg: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
  },
];

// ─── Motivational messages ────────────────────────────────────────────────────
const goodMessages = [
  "🔥 You're literally on fire right now!",
  "🏆 Top tier developer energy!",
  "🚀 You're built different!",
  "⚡ The tech world needs you!",
  "🎯 Precision. Knowledge. Excellence.",
  "💎 Rare skill set detected!",
  "🌟 Recruiter bait: ACTIVATED!",
];

const midMessages = [
  "📈 Growth mindset unlocked!",
  "💪 Almost there — keep pushing!",
  "🧠 Smart people know what to improve.",
  "🔧 A little polish goes a long way.",
  "📚 Knowledge is just a commit away.",
  "⚙️ Refactor yourself like you refactor code!",
];

const badMessages = [
  "😤 This is your villain origin story.",
  "💡 Every expert was once a beginner.",
  "🏋️ The grind starts NOW.",
  "🔄 Failure is just a retry loop.",
  "📖 Open a textbook. Do it. NOW.",
  "😭 The only way is UP from here.",
  "☕ More coffee. More studying. Let's go.",
  "🗿 Bro... just... study.",
];

// ─── Dancing Character (Good Score) ──────────────────────────────────────────
function DancingCharacter({ index }: { index: number }) {
  const colors = [
    { body: "#7c3aed", belly: "#a78bfa", accent: "#fbbf24" },
    { body: "#0891b2", belly: "#67e8f9", accent: "#f472b6" },
    { body: "#059669", belly: "#6ee7b7", accent: "#fbbf24" },
  ];
  const c = colors[index % colors.length];

  const dances = [
    { y: [0, -40, 0, -20, 0], rotate: [0, 180, 360, 360, 360] },
    { x: [-20, 20, -20, 20, 0], y: [0, -15, 0, -15, 0], rotate: [0, 0, 0, 0, 0] },
    { y: [0, -30, 0, -30, 0], scaleX: [1, 0.85, 1, 0.85, 1] },
  ];

  return (
    <motion.div
      className="relative select-none"
      animate={dances[index % 3]}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
    >
      <svg viewBox="0 0 80 110" width="80" height="110">
        <ellipse cx="40" cy="106" rx="22" ry="5" fill="rgba(0,0,0,0.1)" />
        <ellipse cx="40" cy="72" rx="26" ry="32" fill={c.body} />
        <ellipse cx="40" cy="78" rx="16" ry="22" fill={c.belly} />
        <circle cx="40" cy="38" r="22" fill={c.body} />
        <circle cx="40" cy="42" r="13" fill={c.belly} />
        <path d="M31 36 Q34 32 37 36" stroke={c.body} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M43 36 Q46 32 49 36" stroke={c.body} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M30 46 Q40 56 50 46" stroke={c.body} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="28" cy="44" rx="5" ry="4" fill="#FF9999" opacity="0.6" />
        <ellipse cx="52" cy="44" rx="5" ry="4" fill="#FF9999" opacity="0.6" />
        <motion.line
          x1="14" y1="68" x2="2" y2="48"
          stroke={c.body} strokeWidth="7" strokeLinecap="round"
          animate={{ x2: [2, -4, 2], y2: [48, 42, 48] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
        <motion.line
          x1="66" y1="68" x2="78" y2="48"
          stroke={c.body} strokeWidth="7" strokeLinecap="round"
          animate={{ x2: [78, 84, 78], y2: [48, 42, 48] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
        />
        <motion.line
          x1="34" y1="100" x2="26" y2="108"
          stroke={c.body} strokeWidth="7" strokeLinecap="round"
          animate={{ x2: [26, 34, 26], y2: [108, 102, 108] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
        <motion.line
          x1="46" y1="100" x2="54" y2="108"
          stroke={c.body} strokeWidth="7" strokeLinecap="round"
          animate={{ x2: [54, 46, 54], y2: [108, 102, 108] }}
          transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
        />
        <polygon points="40,8 30,30 50,30" fill={c.accent} />
        <circle cx="40" cy="8" r="3" fill="white" />
        <line x1="30" y1="30" x2="50" y2="30" stroke={c.accent} strokeWidth="2" />
        <motion.rect x="8" y="15" width="5" height="5" fill={c.accent} rx="1"
          animate={{ y: [15, 25, 15], rotate: [0, 180, 360] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <motion.rect x="62" y="20" width="4" height="4" fill="#f472b6" rx="1"
          animate={{ y: [20, 30, 20], rotate: [0, -180, -360] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: 0.2 }}
        />
      </svg>
    </motion.div>
  );
}

// ─── Sad / Head-banging Character (Bad Score) ─────────────────────────────────
function SadCharacter({ index }: { index: number }) {
  const isBanger = index % 2 === 0;

  return (
    <motion.div
      className="relative select-none"
      animate={
        isBanger
          ? { rotate: [0, -30, 0, -30, 0], y: [0, 15, 0, 15, 0] }
          : { y: [0, -5, 0] }
      }
      transition={{ duration: isBanger ? 0.5 : 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
    >
      <svg viewBox="0 0 80 120" width="80" height="120">
        <ellipse cx="40" cy="116" rx="22" ry="5" fill="rgba(0,0,0,0.1)" />
        <ellipse cx="40" cy="80" rx="26" ry="32" fill="#475569" />
        <ellipse cx="40" cy="86" rx="16" ry="22" fill="#64748b" />
        <circle cx="40" cy="42" r="22" fill="#475569" />
        <circle cx="40" cy="46" r="13" fill="#64748b" />

        {isBanger ? (
          <>
            <circle cx="33" cy="40" r="5" fill="white" />
            <circle cx="47" cy="40" r="5" fill="white" />
            <path d="M30 37 Q33 40 30 43" stroke="#475569" strokeWidth="1.5" fill="none" />
            <path d="M44 37 Q47 40 44 43" stroke="#475569" strokeWidth="1.5" fill="none" />
            <circle cx="33" cy="40" r="2" fill="#475569" />
            <circle cx="47" cy="40" r="2" fill="#475569" />
          </>
        ) : (
          <>
            <ellipse cx="33" cy="40" rx="5" ry="4" fill="white" />
            <ellipse cx="47" cy="40" rx="5" ry="4" fill="white" />
            <circle cx="33" cy="41" r="2.5" fill="#111" />
            <circle cx="47" cy="41" r="2.5" fill="#111" />
            <line x1="29" y1="34" x2="37" y2="37" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="43" y1="37" x2="51" y2="34" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        <path
          d={isBanger ? "M30 54 Q40 48 50 54" : "M30 52 Q40 46 50 52"}
          stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />

        {!isBanger && (
          <>
            <motion.ellipse cx="30" cy="46" rx="2" ry="3" fill="#38bdf8"
              animate={{ cy: [46, 58], opacity: [1, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.3 }}
            />
            <motion.ellipse cx="50" cy="46" rx="2" ry="3" fill="#38bdf8"
              animate={{ cy: [46, 58], opacity: [1, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.7 }}
            />
          </>
        )}

        <line x1="14" y1="72" x2="6" y2="88" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
        <line x1="66" y1="72" x2="74" y2="88" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
        <line x1="34" y1="108" x2="30" y2="118" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
        <line x1="46" y1="108" x2="50" y2="118" stroke="#475569" strokeWidth="7" strokeLinecap="round" />

        {isBanger && (
          <motion.text
            x="55" y="20"
            fontSize="18"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: "55px 20px" }}
          >
            💥
          </motion.text>
        )}
      </svg>
    </motion.div>
  );
}

// ─── Mid / Shoulder-shrug Character ──────────────────────────────────────────
function MidCharacter({ index }: { index: number }) {
  return (
    <motion.div
      className="relative select-none"
      animate={{ y: [0, -8, 0], rotate: index % 2 === 0 ? [0, 5, 0, -5, 0] : [0, -5, 0, 5, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
    >
      <svg viewBox="0 0 80 110" width="80" height="110">
        <ellipse cx="40" cy="106" rx="22" ry="5" fill="rgba(0,0,0,0.1)" />
        <ellipse cx="40" cy="72" rx="26" ry="32" fill="#1d4ed8" />
        <ellipse cx="40" cy="78" rx="16" ry="22" fill="#3b82f6" />
        <circle cx="40" cy="38" r="22" fill="#1d4ed8" />
        <circle cx="40" cy="42" r="13" fill="#3b82f6" />
        <ellipse cx="33" cy="38" rx="5" ry="5" fill="white" />
        <ellipse cx="47" cy="38" rx="5" ry="5" fill="white" />
        <circle cx="33" cy="38" r="2.5" fill="#111" />
        <circle cx="47" cy="38" r="2.5" fill="#111" />
        <line x1="32" y1="50" x2="48" y2="50" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
        <motion.line
          x1="14" y1="65" x2="4" y2="55"
          stroke="#1d4ed8" strokeWidth="7" strokeLinecap="round"
          animate={{ x2: [4, 4, 0], y2: [55, 50, 55] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.line
          x1="66" y1="65" x2="76" y2="55"
          stroke="#1d4ed8" strokeWidth="7" strokeLinecap="round"
          animate={{ x2: [76, 76, 80], y2: [55, 50, 55] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
        />
        <line x1="34" y1="100" x2="30" y2="108" stroke="#1d4ed8" strokeWidth="7" strokeLinecap="round" />
        <line x1="46" y1="100" x2="50" y2="108" stroke="#1d4ed8" strokeWidth="7" strokeLinecap="round" />
        <motion.ellipse cx="58" cy="28" rx="4" ry="6" fill="#93c5fd" opacity="0.8"
          animate={{ y: [0, 6, 0], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
}

// ─── Confetti particles (good score) ─────────────────────────────────────────
function Confetti() {
  const colors = ["#fbbf24", "#f472b6", "#34d399", "#60a5fa", "#a78bfa", "#fb923c"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm drop-shadow-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            background: colors[i % colors.length],
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            x: [0, (Math.random() - 0.5) * 80],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ─── Floating motivation text ─────────────────────────────────────────────────
function FloatingMotivation({ messages, color }: { messages: string[]; color: string }) {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx((p) => (p + 1) % messages.length);
        setShow(true);
      }, 500);
    }, 4000);
    return () => clearInterval(t);
  }, [messages]);

  return (
    <div className="relative h-14 w-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ duration: 0.4 }}
            className="absolute text-base font-black tracking-wide text-center px-6 py-3 rounded-2xl shadow-lg"
            style={{
              color,
              background: "rgba(255, 255, 255, 0.95)",
              border: `1px solid ${color}60`,
              backdropFilter: "blur(12px)",
              boxShadow: `0 10px 25px ${color}20`,
            }}
          >
            {messages[idx]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, semanticColor }: { score: number; semanticColor: string }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      <svg width="160" height="160" className="absolute">
        <circle cx="80" cy="80" r="54" fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="12" />
        <motion.circle
          cx="80" cy="80" r="54"
          fill="none"
          stroke={semanticColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeDashoffset={0}
          transform="rotate(-90 80 80)"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${strokeDash} ${circumference}` }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${semanticColor}80)` }}
        />
      </svg>
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <div className="text-5xl font-black text-slate-800 leading-none">{score}</div>
          <div className="text-xs font-bold mt-1" style={{ color: semanticColor }}>/ 100</div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Results Dashboard ───────────────────────────────────────────────────
export default function ResultsDashboard() {
  const { results } = useStore();

  // Theme Cycler State
  const [themeIndex, setThemeIndex] = useState(0);
  const activeTheme = themes[themeIndex];

  useEffect(() => {
    const themeCycler = setInterval(() => {
      setThemeIndex((prev) => (prev + 1) % themes.length);
    }, 5000);
    return () => clearInterval(themeCycler);
  }, []);

  const score = results?.score || 0;
  const percentile = results?.percentile || 0;

  const swot = results?.swotAnalysis || {
    strengths: ["Data unavailable. Please take the test."],
    weaknesses: ["Data unavailable."],
    opportunities: ["Data unavailable."],
    threats: ["Data unavailable."],
  };

  const isGood = score >= 70;
  const isMid = score >= 40 && score < 70;
  const isBad = score < 40;

  // Semantic color represents the score performance (kept constant regardless of app theme)
  const semanticColor = isGood ? "#10b981" : isMid ? "#f59e0b" : "#ef4444";
  
  const motMessages = isGood ? goodMessages : isMid ? midMessages : badMessages;
  const numChars = isGood ? 3 : isMid ? 2 : 3;

  const shareRank = () => {
    const text = `I scored ${score}/100 and I'm in the top ${100 - percentile}% of Devs on my stack! 🚀`;
    if (navigator.share) {
      navigator.share({ title: "My SkillRank Result", text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      alert("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    try {
      const url = isGood
        ? "https://www.myinstants.com/media/sounds/ta-da.mp3"
        : isBad
        ? "https://www.myinstants.com/media/sounds/sad-trombone.mp3"
        : null;
      if (url) {
        const a = new Audio(url);
        a.volume = 0.25;
        a.play().catch(() => {});
      }
    } catch (_) {}
  }, [isGood, isBad]);

  return (
    <main
      className={`min-h-screen relative overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${activeTheme.bgGradient}`}
      style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
    >
     
      {isGood && <Confetti />}

      {isBad && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl select-none opacity-60 drop-shadow-sm"
              style={{ left: `${Math.random() * 100}%`, top: "-20px" }}
              animate={{ y: ["0vh", "110vh"], opacity: [1, 0.5, 0] }}
              transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 6, ease: "linear" }}
            >
              {["😢", "💔", "📉", "😭", "🥲"][i % 5]}
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 p-4 px-6 rounded-2xl shadow-sm border border-white/50 backdrop-blur-md"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl bg-white p-1 rounded-xl shadow-sm border border-slate-100">🐧</span>
              <h1 className="text-2xl font-black text-slate-800 transition-colors duration-500">
                Skill<span className={activeTheme.brandText}>{ " Rank"}</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-xs mt-1">
              Assessment Complete · Based on global developer profiles
            </p>
          </div>
          <Button
            onClick={shareRank}
            className={`transition-all duration-500 border border-transparent shadow-sm ${activeTheme.buttonBg}`}
          >
            <Share2 className="w-4 h-4 mr-2" /> Share My Rank
          </Button>
        </motion.div>

        {/* ── Hero score card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card
            className="border border-white/60 overflow-hidden backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.75)",
              boxShadow: `0 20px 50px ${semanticColor}15, 0 0 0 1px ${semanticColor}20 inset`,
            }}
          >
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-10">

                {/* Score ring */}
                <div className="flex-shrink-0">
                  <ScoreRing score={score} semanticColor={semanticColor} />
                </div>

                {/* Score info + characters */}
                <div className="flex-1 text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Badge
                      className="mb-4 text-sm px-4 py-1.5 font-bold border"
                      style={{ background: `${semanticColor}15`, color: semanticColor, borderColor: `${semanticColor}30` }}
                    >
                      {isGood ? "🏆 Excellent Performance" : isMid ? "📈 Good Progress" : "💪 Room to Grow"}
                    </Badge>
                    <h2 className="text-5xl font-black text-slate-800 mb-3 drop-shadow-sm">
                      Top <span style={{ color: semanticColor }}>{100 - percentile}%</span>
                    </h2>
                    <p className="text-slate-600 font-semibold text-lg mb-2">
                      You scored <strong className="text-slate-800">{score}/100</strong> on your custom tech stack test.
                    </p>
                    <p className="text-slate-500 text-sm font-medium">
                      {isGood
                        ? "Outstanding! You rank among the elite developers worldwide."
                        : isMid
                        ? "Solid foundation! A bit more practice and you'll be unstoppable."
                        : "Don't worry — every expert started here. The grind begins now."}
                    </p>
                  </motion.div>
                </div>

                {/* Animated characters */}
                <div className="flex items-end gap-3 flex-shrink-0">
                  {[...Array(numChars)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.15 }}
                    >
                      {isGood ? (
                        <DancingCharacter index={i} />
                      ) : isMid ? (
                        <MidCharacter index={i} />
                      ) : (
                        <SadCharacter index={i} />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Motivation text cycling */}
              <div className="mt-8">
                <FloatingMotivation messages={motMessages} color={semanticColor} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Bad score CTA ── */}
        {isBad && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl p-6 text-center shadow-sm"
            style={{
              background: "rgba(254, 226, 226, 0.7)",
              border: "1px solid rgba(252, 165, 165, 0.8)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p className="text-red-600 font-black text-lg mb-1">😤 Time for a comeback arc.</p>
            <p className="text-slate-600 font-medium text-sm">
              Your score is low — but that just means there&apos;s more room to grow.
              Review your weak areas below, hit the books, and come back stronger.
            </p>
          </motion.div>
        )}

        {/* ── Mid score tip ── */}
        {isMid && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl p-6 text-center shadow-sm"
            style={{
              background: "rgba(254, 243, 199, 0.7)",
              border: "1px solid rgba(253, 230, 138, 0.8)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p className="text-amber-600 font-black text-lg mb-1">🧗 Almost at the top!</p>
            <p className="text-slate-600 font-medium text-sm">
              You&apos;re in the middle tier — solidly respectable. Focus on your weak areas
              and you could be in the top 30% with just a bit more effort.
            </p>
          </motion.div>
        )}

        {/* ── SWOT Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Strengths */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card
              className="border border-emerald-100 h-full backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.05)",
              }}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <TrendingUp className="text-emerald-500 w-5 h-5" />
                </div>
                <CardTitle className="text-emerald-600 font-black text-lg">Strengths</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {swot.strengths.map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-emerald-50 shadow-sm"
                  >
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weaknesses */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card
              className="border border-red-100 h-full backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                boxShadow: "0 10px 30px rgba(239, 68, 68, 0.05)",
              }}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center border border-red-200">
                  <AlertTriangle className="text-red-500 w-5 h-5" />
                </div>
                <CardTitle className="text-red-500 font-black text-lg">Weaknesses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {swot.weaknesses.map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-red-50 shadow-sm"
                  >
                    <span className="text-red-500 mt-0.5 flex-shrink-0 font-bold">⚠</span>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Opportunities */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card
              className="border border-amber-100 h-full backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                boxShadow: "0 10px 30px rgba(245, 158, 11, 0.05)",
              }}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200">
                  <Zap className="text-amber-500 w-5 h-5" />
                </div>
                <CardTitle className="text-amber-500 font-black text-lg">Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {swot.opportunities.map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-amber-50 shadow-sm"
                  >
                    <span className="text-amber-500 mt-0.5 flex-shrink-0 font-bold">→</span>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Threats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card
              className="border border-orange-100 h-full backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                boxShadow: "0 10px 30px rgba(249, 115, 22, 0.05)",
              }}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center border border-orange-200">
                  <Target className="text-orange-500 w-5 h-5" />
                </div>
                <CardTitle className="text-orange-500 font-black text-lg">Threats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {swot.threats.map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-orange-50 shadow-sm"
                  >
                    <span className="text-orange-500 mt-0.5 flex-shrink-0 font-bold">!</span>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center pb-4"
        >
          <p className="text-slate-500 font-semibold text-xs">
            © 2024 SkillRank · Powered by Penguin Intelligence™
          </p>
        </motion.div>
      </div>
    </main>
  );
}