"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  ArrowRight,
  Loader2,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDropzone } from "react-dropzone";
import { useStore } from "@/store/useStore";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// ─── Theme Configuration for Testing ──────────────────────────────────────────
const themes = [
  {
    name: "Sky Blue",
    bgGradient: "from-slate-50 via-sky-50 to-indigo-50",
    brandText: "text-sky-500",
    brandTextHover: "hover:decoration-sky-500 decoration-sky-300",
    badge1: "text-sky-600 border-sky-200",
    badge2: "text-indigo-600 border-indigo-200",
    jokeShadow: "shadow-sky-100/50",
    jokeBorder: "rgba(186, 230, 253, 0.6)", // sky-200
    dropzoneActive: "border-sky-400 bg-sky-50 shadow-sky-100",
    dropzoneHover: "hover:border-sky-400 hover:bg-sky-50/50 hover:shadow-sky-100",
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-500 shadow-sky-400/40",
    buttonBg: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-200",
    snowText: "text-sky-200",
    tearColor: "#7dd3fc", // sky-300
    loaderBg: "bg-sky-200",
    loaderIcon: "from-sky-400 to-blue-500 shadow-sky-200",
    progressInner: "[&>div]:bg-sky-500",
    successBg: "bg-sky-200",
    successIcon: "from-sky-400 to-blue-500 shadow-sky-200",
  },
  {
    name: "Rose Red",
    bgGradient: "from-slate-50 via-rose-50 to-pink-50",
    brandText: "text-rose-500",
    brandTextHover: "hover:decoration-rose-500 decoration-rose-300",
    badge1: "text-rose-600 border-rose-200",
    badge2: "text-pink-600 border-pink-200",
    jokeShadow: "shadow-rose-100/50",
    jokeBorder: "rgba(254, 205, 211, 0.6)", // rose-200
    dropzoneActive: "border-rose-400 bg-rose-50 shadow-rose-100",
    dropzoneHover: "hover:border-rose-400 hover:bg-rose-50/50 hover:shadow-rose-100",
    iconBg: "bg-gradient-to-br from-rose-400 to-pink-500 shadow-rose-400/40",
    buttonBg: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-rose-200",
    snowText: "text-rose-200",
    tearColor: "#fda4af", // rose-300
    loaderBg: "bg-rose-200",
    loaderIcon: "from-rose-400 to-pink-500 shadow-rose-200",
    progressInner: "[&>div]:bg-rose-500",
    successBg: "bg-rose-200",
    successIcon: "from-rose-400 to-pink-500 shadow-rose-200",
  },
  {
    name: "Emerald Green",
    bgGradient: "from-slate-50 via-emerald-50 to-teal-50",
    brandText: "text-emerald-500",
    brandTextHover: "hover:decoration-emerald-500 decoration-emerald-300",
    badge1: "text-emerald-600 border-emerald-200",
    badge2: "text-teal-600 border-teal-200",
    jokeShadow: "shadow-emerald-100/50",
    jokeBorder: "rgba(167, 243, 208, 0.6)", // emerald-200
    dropzoneActive: "border-emerald-400 bg-emerald-50 shadow-emerald-100",
    dropzoneHover: "hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-emerald-100",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-400/40",
    buttonBg: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200",
    snowText: "text-emerald-200",
    tearColor: "#6ee7b7", // emerald-300
    loaderBg: "bg-emerald-200",
    loaderIcon: "from-emerald-400 to-teal-500 shadow-emerald-200",
    progressInner: "[&>div]:bg-emerald-500",
    successBg: "bg-emerald-200",
    successIcon: "from-emerald-400 to-teal-500 shadow-emerald-200",
  },
  {
    name: "Amber Yellow",
    bgGradient: "from-slate-50 via-amber-50 to-yellow-50",
    brandText: "text-amber-500",
    brandTextHover: "hover:decoration-amber-500 decoration-amber-300",
    badge1: "text-amber-600 border-amber-200",
    badge2: "text-yellow-600 border-yellow-200",
    jokeShadow: "shadow-amber-100/50",
    jokeBorder: "rgba(253, 230, 138, 0.6)", // amber-200
    dropzoneActive: "border-amber-400 bg-amber-50 shadow-amber-100",
    dropzoneHover: "hover:border-amber-400 hover:bg-amber-50/50 hover:shadow-amber-100",
    iconBg: "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-400/40",
    buttonBg: "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-amber-200",
    snowText: "text-amber-200",
    tearColor: "#fcd34d", // amber-300
    loaderBg: "bg-amber-200",
    loaderIcon: "from-amber-400 to-yellow-500 shadow-amber-200",
    progressInner: "[&>div]:bg-amber-500",
    successBg: "bg-amber-200",
    successIcon: "from-amber-400 to-yellow-500 shadow-amber-200",
  },
];

// ─── Walking text messages that float near the penguin ────────────────────────
const walkingMessages = [
  "I'm leaving because you won't upload! 😤",
  "Bye forever! Don't miss me! 🐧💨",
  "No resume = no stay! 😠",
  "I had a whole career planned for you... 😔",
  "This mountain looks cozy anyway! 🏔️",
  "Maybe the mountain will appreciate me! 🗻",
  "You had ONE job... upload a PDF! 😭",
  "See ya, wouldn't wanna be ya! 👋",
  "I've been standing here for AGES! ⏰",
  "Going to find someone who uploads resumes! 🚶",
  "Even the mountain is a better friend! 😤",
  "I'm not crying, YOU'RE crying! 😤💧",
  "This is your last chance... I mean it! ⚠️",
  "Fine. THE MOUNTAIN IT IS. 🏔️💨",
];

// ─── Jokes cycling above upload ───────────────────────────────────────────────
const normalJokes = [
  "Why don't penguins like strangers at parties? Hard to break the ice! 🧊",
  "Three companies were after me. Boss asked which. Gas, Electric & Water! 💡",
  "Why did the resume go to therapy? Too many issues! 📄",
  "Penguin in the desert? Lost. Very, very lost. 🐧🏜️",
  "My resume says I work well under pressure. Currently being tested. 😅",
  "Why did the dev quit? He didn't get arrays! 💻",
  "Penguin at interview. Recruiter: 'You seem cool.' 🐧❄️",
  "Put 'Microsoft Office' on resume. Hired for Excel-lent reasons! 📊",
  "Why is a penguin a great employee? Always shows up in a suit! 🤵",
  "My CV says I'm a quick learner. Learned that the hard way. 📝",
  "What do you call a fish with no eyes? A fsh. 🐟",
  "Why do Java developers wear glasses? Because they don't C#! 😎",
];

const sadJokes = [
  "The penguin died waiting... and so did my dreams. 😭",
  "RIP brave penguin. Died doing what he loved: waiting for a PDF. 🪦",
  "Roses are red, violets are blue, the penguin is dead because of you. 💔",
  "The mountain wanted a friend. The penguin obliged. Nobody's happy. ⛰️💀",
  "Error 404: Penguin not found. Last seen walking toward a mountain. 📁",
  "He didn't die in vain. Well... actually he did. 😬",
  "The penguin's last words: 'I just wanted to see your resume...' 🥺",
  "In memory of Mr. Penguin. He waited. You didn't upload. 🪦",
  "Gone too soon. Taken by the mountain. No resume was worth it. 💔",
];

// ─── Mountain SVG — supports "crashed" state ─────────────────────────────────
function Mountain({ crashed }: { crashed: boolean }) {
  return (
    <svg viewBox="0 0 320 200" width="320" height="200" className="flex-shrink-0">
      {crashed ? (
        <>
          <motion.polygon
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: -55, y: 45, rotate: -32 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            points="80,190 170,45 230,190"
            fill="#94a3b8"
          />
          <motion.polygon
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: 60, y: 35, rotate: 28 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            points="190,190 260,70 320,190"
            fill="#94a3b8"
          />
          <motion.polygon
            points="200,20 178,78 222,78"
            fill="white"
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ y: 120, opacity: 0, rotate: 50, x: -20 }}
            transition={{ duration: 0.7 }}
          />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <motion.circle
              key={i}
              cx={110 + i * 18}
              cy={180}
              r={3 + (i % 3) * 3}
              fill="#cbd5e1"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: [0, -25, 55], opacity: [1, 1, 0] }}
              transition={{ delay: i * 0.06, duration: 0.7 }}
            />
          ))}
          <motion.ellipse
            cx="200"
            cy="168"
            rx="70"
            ry="22"
            fill="#e2e8f0"
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: [0, 0.85, 0], scaleX: [0.3, 2, 3.5] }}
            transition={{ duration: 1.4 }}
          />
          <rect x="0" y="185" width="400" height="15" fill="#f1f5f9" rx="4" />
        </>
      ) : (
        <>
          <polygon points="210,190 290,55 370,190" fill="#cbd5e1" />
          <polygon points="290,55 272,108 308,108" fill="white" />
          <polygon points="80,190 200,18 320,190" fill="#94a3b8" />
          <polygon points="200,18 178,78 222,78" fill="white" />
          <rect x="0" y="178" width="400" height="15" fill="#f1f5f9" rx="4" />
          <ellipse cx="145" cy="180" rx="65" ry="6" fill="white" opacity="0.8" />
        </>
      )}
    </svg>
  );
}

// ─── Penguin SVG Character ────────────────────────────────────────────────────
function PenguinCharacter({
  state,
  tearColor,
}: {
  state: "idle" | "waiting" | "walking" | "happy" | "dead";
  tearColor: string;
}) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(t);
  }, []);

  const eyeH = blink ? 1 : 8;
  const isWalking = state === "walking";
  const isDead = state === "dead";
  const isHappy = state === "happy";
  const isWaiting = state === "waiting";

  return (
    <motion.div
      className="relative select-none"
      style={{ width: 120, height: 160 }}
      animate={
        isDead
          ? { rotate: 90, y: 32 }
          : isHappy
          ? { y: [0, -22, 0, -12, 0, -6, 0] }
          : isWalking
          ? { x: [0, 3, -3, 3, -3, 0] }
          : { y: [0, -5, 0] }
      }
      transition={
        isDead
          ? { duration: 0.5 }
          : isHappy
          ? { duration: 0.8, repeat: 3 }
          : isWalking
          ? { duration: 0.38, repeat: Infinity, ease: "linear" }
          : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg viewBox="0 0 120 160" width="120" height="160">
        <ellipse cx="60" cy="155" rx="30" ry="6" fill="rgba(0,0,0,0.08)" />
        <ellipse cx="60" cy="100" rx="38" ry="50" fill="#1e293b" />
        <ellipse cx="60" cy="108" rx="24" ry="35" fill="#f8fafc" />
        <ellipse cx="60" cy="55" rx="30" ry="30" fill="#1e293b" />
        <ellipse cx="60" cy="60" rx="18" ry="18" fill="#f8fafc" />

        {isDead ? (
          <>
            <line x1="46" y1="49" x2="57" y2="60" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <line x1="57" y1="49" x2="46" y2="60" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <line x1="63" y1="49" x2="74" y2="60" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <line x1="74" y1="49" x2="63" y2="60" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="52" cy="54" rx="6" ry={eyeH / 1.2} fill="white" />
            <ellipse cx="68" cy="54" rx="6" ry={eyeH / 1.2} fill="white" />
            <circle cx="53" cy="55" r="3" fill="#0f172a" />
            <circle cx="69" cy="55" r="3" fill="#0f172a" />
            <circle cx="54" cy="53" r="1.2" fill="white" />
            <circle cx="70" cy="53" r="1.2" fill="white" />
          </>
        )}

        <polygon
          points="60,64 55,70 65,70"
          fill="#f97316"
          transform={isDead ? "translate(0,3)" : ""}
        />

        <motion.g
          animate={
            isWalking ? { rotate: [25, -25, 25] } :
            isHappy ? { rotate: [0, 45, 0, 45, 0] } :
            { rotate: [5, -5, 5] }
          }
          transition={
            isWalking ? { duration: 0.38, repeat: Infinity } :
            isHappy ? { duration: 0.35, repeat: 5 } :
            { duration: 2, repeat: Infinity }
          }
          style={{ originX: "20px", originY: "90px" }}
        >
          <ellipse cx="20" cy="92" rx="10" ry="22" fill="#1e293b" transform="rotate(-10,20,92)" />
        </motion.g>

        <motion.g
          animate={
            isWalking ? { rotate: [-25, 25, -25] } :
            isHappy ? { rotate: [0, -45, 0, -45, 0] } :
            { rotate: [-5, 5, -5] }
          }
          transition={
            isWalking ? { duration: 0.38, repeat: Infinity } :
            isHappy ? { duration: 0.35, repeat: 5 } :
            { duration: 2, repeat: Infinity }
          }
          style={{ originX: "100px", originY: "90px" }}
        >
          <ellipse cx="100" cy="92" rx="10" ry="22" fill="#1e293b" transform="rotate(10,100,92)" />
        </motion.g>

        <motion.g
          animate={isWalking ? { x: [0, 5, 0, -5, 0] } : {}}
          transition={{ duration: 0.38, repeat: Infinity }}
        >
          <ellipse
            cx="50" cy="148" rx="12" ry="6" fill="#f97316"
            transform={isWalking ? "rotate(-12,50,148)" : ""}
          />
          <ellipse
            cx="70" cy="148" rx="12" ry="6" fill="#f97316"
            transform={isWalking ? "rotate(12,70,148)" : ""}
          />
        </motion.g>

        {isHappy && (
          <>
            <ellipse cx="44" cy="66" rx="8" ry="5" fill="#fca5a5" opacity="0.6" />
            <ellipse cx="76" cy="66" rx="8" ry="5" fill="#fca5a5" opacity="0.6" />
          </>
        )}

        {isWaiting && (
          <>
            <motion.ellipse cx="49" cy="63" rx="2.5" ry="3.5" fill={tearColor}
              style={{ transition: "fill 0.5s ease" }}
              animate={{ cy: [63, 74], opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
            />
            <motion.ellipse cx="71" cy="63" rx="2.5" ry="3.5" fill={tearColor}
              style={{ transition: "fill 0.5s ease" }}
              animate={{ cy: [63, 74], opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.9 }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}

// ─── Death Screen Overlay ─────────────────────────────────────────────────────
function DeathScreen({ onReload }: { onReload: () => void }) {
  const [jokeIdx, setJokeIdx] = useState(0);
  const [showJoke, setShowJoke] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setShowJoke(false);
      setTimeout(() => {
        setJokeIdx((p) => (p + 1) % sadJokes.length);
        setShowJoke(true);
      }, 500);
    }, 5000);
    return () => clearInterval(cycle);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(248, 250, 252, 0.95)", backdropFilter: "blur(12px)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl select-none"
            style={{ left: `${5 + Math.random() * 90}%`, top: "-30px" }}
            animate={{ y: ["0vh", "110vh"], opacity: [1, 1, 0] }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          >
            {["💧", "😢", "☁️", "💔", "🪦", "❄️", "😭"][i % 7]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
        className="relative z-10 flex flex-col items-center gap-6 max-w-lg px-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl drop-shadow-lg"
        >
          🪦
        </motion.div>

        <div>
          <h2 className="text-4xl font-black text-slate-800 mb-1">RIP 🐧 The Penguin</h2>
          <p className="text-slate-500 text-sm font-mono bg-slate-100 py-1 px-3 rounded-full inline-block">2024 – 2024 · Died waiting for a PDF</p>
        </div>

        <AnimatePresence mode="wait">
          {showJoke && (
            <motion.div
              key={jokeIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl px-6 py-4 text-sm font-semibold text-red-800 max-w-sm"
              style={{
                background: "rgba(254,226,226,0.8)",
                border: "1px solid rgba(252,165,165,0.8)",
              }}
            >
              😢 {sadJokes[jokeIdx]}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-slate-600 text-base leading-relaxed">
          The penguin walked to the mountain and was never seen again.
          <br />
          You can still save the <span className="text-sky-500 font-bold">next</span> penguin though...
        </p>

        <div className="flex gap-3 flex-wrap justify-center mt-4">
          <Button
            onClick={onReload}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold px-6 py-6 rounded-xl shadow-lg shadow-sky-500/30 transition-all hover:scale-105"
          >
            <RefreshCw className="mr-2 w-5 h-5" />
            Summon a New Penguin
          </Button>
          <Button
            onClick={onReload}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 px-6 py-6 rounded-xl font-semibold bg-white shadow-sm"
          >
            Upload Resume &amp; Save It
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const { uploadStatus, setUploadStatus, setUploadId, setUser } = useStore();
  const [progress, setProgress] = useState(0);

  // Theme Cycler State
  const [themeIndex, setThemeIndex] = useState(0);
  const activeTheme = themes[themeIndex];

  const [penguinState, setPenguinState] = useState<
    "idle" | "waiting" | "walking" | "happy" | "dead"
  >("idle");
  const [walkProgress, setWalkProgress] = useState(0); 
  const [mountainCrashed, setMountainCrashed] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);

  const [currentJoke, setCurrentJoke] = useState(0);
  const [showJoke, setShowJoke] = useState(false);

  const [walkMsg, setWalkMsg] = useState("");
  const [showWalkMsg, setShowWalkMsg] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkMsgTimerRef = useRef<NodeJS.Timeout | null>(null);
  const jokeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Cycle Theme Every 5 Seconds ──
  useEffect(() => {
    const themeCycler = setInterval(() => {
      setThemeIndex((prev) => (prev + 1) % themes.length);
    }, 5000);
    return () => clearInterval(themeCycler);
  }, []);

  useEffect(() => {
    const showNext = () => {
      setCurrentJoke((p) => (p + 1) % normalJokes.length);
      setShowJoke(true);
      setTimeout(() => setShowJoke(false), 5200);
    };
    const init = setTimeout(showNext, 2000);
    jokeTimerRef.current = setInterval(showNext, 9000);
    return () => {
      clearTimeout(init);
      if (jokeTimerRef.current) clearInterval(jokeTimerRef.current);
    };
  }, []);

  const startWalkMessages = useCallback(() => {
    let idx = 0;
    const show = () => {
      setWalkMsg(walkingMessages[idx % walkingMessages.length]);
      setShowWalkMsg(true);
      setTimeout(() => setShowWalkMsg(false), 2800);
      idx++;
    };
    show();
    walkMsgTimerRef.current = setInterval(show, 4200);
  }, []);

  useEffect(() => {
    if (uploadStatus !== "idle") return;

    let seconds = 0;
    idleTimerRef.current = setInterval(() => {
      seconds++;

      if (seconds === 8) {
        setPenguinState("waiting");
      }

      if (seconds === 16) {
        setPenguinState("walking");
        startWalkMessages();

        try {
          const audio = new Audio(
            "https://www.myinstants.com/media/sounds/sad-trombone.mp3"
          );
          audio.volume = 0.3;
          audio.play().catch(() => {});
          audioRef.current = audio;
        } catch (_) {}

        let wp = 0;
        walkTimerRef.current = setInterval(() => {
          wp += 1.2;
          setWalkProgress(Math.min(wp, 100));

          if (wp >= 100) {
            if (walkTimerRef.current) clearInterval(walkTimerRef.current);
            if (walkMsgTimerRef.current) clearInterval(walkMsgTimerRef.current);
            setShowWalkMsg(false);
            setTimeout(() => {
              setMountainCrashed(true);
              setPenguinState("dead");
              setTimeout(() => setShowDeathScreen(true), 1800);
            }, 300);
          }
        }, 200);
      }
    }, 1000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      if (walkTimerRef.current) clearInterval(walkTimerRef.current);
      if (walkMsgTimerRef.current) clearInterval(walkMsgTimerRef.current);
    };
  }, [uploadStatus, startWalkMessages]);

  const pollStatus = useCallback(
    async (id: string) => {
      const interval = setInterval(async () => {
        try {
          const { data } = await axios.get(`${API_URL}/status/${id}`);
          if (data.status === "parsing") setProgress(60);
          if (data.ready) {
            setProgress(100);
            setUploadStatus("ready");
            setPenguinState("happy");
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
          clearInterval(interval);
        }
      }, 2000);
    },
    [setUploadStatus]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      if (walkTimerRef.current) clearInterval(walkTimerRef.current);
      if (walkMsgTimerRef.current) clearInterval(walkMsgTimerRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setShowWalkMsg(false);
      setWalkProgress(0);

      setUploadStatus("uploading");
      setProgress(10);
      setPenguinState("happy");

      try {
        const formData = new FormData();
        formData.append("resume", acceptedFiles[0]);
        const { data } = await axios.post(`${API_URL}/upload`, formData);
        
        setUploadId(data.assessmentId); 
        setProgress(30);
        setUploadStatus("parsing");
        pollStatus(data.assessmentId); 
        
      } catch (err) {
        console.error(err);
        setUploadStatus("idle");
        setPenguinState("idle");
      }
    },
    [setUploadStatus, setUploadId, pollStatus]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleContinue = () => {
    setUser({ name: "Developer", email: "dev@example.com" });
    router.push("/test");
  };

  const handleReload = () => {
    setShowDeathScreen(false);
    setPenguinState("idle");
    setMountainCrashed(false);
    setWalkProgress(0);
    setUploadStatus("idle");
    setProgress(0);
  };

  function SnowBackground({ snowClass }: { snowClass: string }) {
    const [flakes, setFlakes] = useState<
      { left: number; size: number; opacity: number; duration: number; delay: number }[]
    >([]);

    useEffect(() => {
      const generated = Array.from({ length: 24 }).map(() => ({
        left: Math.random() * 100,
        size: 10 + Math.random() * 14,
        opacity: 0.3 + Math.random() * 0.4,
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
            className={`absolute select-none drop-shadow-sm transition-colors duration-1000 ${snowClass}`}
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

  const penguinLeftPct = `${2 + Math.min(walkProgress * 0.6, 60)}%`;

  return (
    <>
      {showDeathScreen && <DeathScreen onReload={handleReload} />}

      <main
        className={`min-h-screen flex flex-col items-center relative overflow-hidden bg-gradient-to-br transition-colors duration-1000 ${activeTheme.bgGradient}`}
        style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
      >
     
        <SnowBackground snowClass={activeTheme.snowText} />

        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mx-auto flex items-center justify-between px-8 py-6 z-20 relative"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <span className="text-3xl leading-none">🐧</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight transition-colors duration-500">
                Skill<span className={activeTheme.brandText}>{ " Rank"}</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Powered by Penguin Intelligence™</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className={`bg-white shadow-sm text-xs py-1 px-3 transition-colors duration-500 border ${activeTheme.badge1}`}>🔒 Secure</Badge>
            <Badge className={`bg-white shadow-sm text-xs py-1 px-3 transition-colors duration-500 border ${activeTheme.badge2}`}>⚡ Fast</Badge>
          </div>
        </motion.header>

        <div className="relative z-10 w-full max-w-2xl mx-auto px-6 flex flex-col items-center gap-6 mt-6 pb-60">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-3 leading-tight drop-shadow-sm">
              Upload Your Resume
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={penguinState}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-base font-medium"
              >
                {penguinState === "idle" && (
                  <span className="text-slate-500">
                    Our penguin analyst is{" "}
                    <span className={`font-bold transition-colors duration-500 ${activeTheme.brandText}`}>patiently waiting</span>{" "}
                    (for now...)
                  </span>
                )}
                {penguinState === "waiting" && (
                  <span className="text-amber-600 font-bold">
                    ⚠️ The penguin is getting impatient... upload soon!
                  </span>
                )}
                {penguinState === "walking" && (
                  <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    🚨 THE PENGUIN HAS LEFT THE BUILDING! UPLOAD NOW!
                  </span>
                )}
                {penguinState === "dead" && (
                  <span className="text-red-600 font-bold">
                    💀 Too late. The penguin is gone. Upload to summon a new one.
                  </span>
                )}
                {penguinState === "happy" && (
                  <span className={`font-bold px-3 py-1 rounded-full border transition-colors duration-500 bg-white ${activeTheme.badge1}`}>
                    🎉 The penguin is thrilled! Processing your resume...
                  </span>
                )}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <div className="relative h-14 w-full flex items-center justify-center z-20">
            <AnimatePresence mode="wait">
              {showJoke && (
                <motion.div
                  key={currentJoke}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute w-full rounded-2xl px-6 py-3 text-center text-sm font-bold text-slate-700 shadow-lg transition-all duration-1000 ${activeTheme.jokeShadow}`}
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: `1px solid ${activeTheme.jokeBorder}`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  💬 {normalJokes[currentJoke]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full relative z-10"
          >
            <Card
              className="overflow-hidden border border-white/60"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(255,255,255,0.5) inset",
              }}
            >
              <CardContent className="p-8 md:p-10">
                <AnimatePresence mode="wait">
                  {uploadStatus === "idle" && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div
                        {...getRootProps()}
                        className={`relative border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all duration-500 text-center bg-white/50 ${
                          isDragActive
                            ? activeTheme.dropzoneActive + " scale-[1.02]"
                            : penguinState === "walking"
                            ? "border-red-300 bg-red-50 hover:bg-red-100 animate-pulse"
                            : penguinState === "dead"
                            ? "border-slate-300 bg-slate-50 hover:bg-slate-100"
                            : `border-slate-300 hover:bg-white/80 ${activeTheme.dropzoneHover}`
                        }`}
                      >
                        <input {...getInputProps()} />
                        <motion.div
                          animate={
                            penguinState === "walking"
                              ? { y: [0, -4, 0], scale: [1, 1.05, 1] }
                              : { y: [0, -8, 0] }
                          }
                          transition={{ duration: penguinState === "walking" ? 0.5 : 2, repeat: Infinity, ease: "easeInOut" }}
                          className="mb-6"
                        >
                          <div
                            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl transition-all duration-500 ${
                              penguinState === "walking"
                                ? "bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/30"
                                : penguinState === "dead"
                                ? "bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-400/30"
                                : activeTheme.iconBg
                            }`}
                          >
                            <UploadCloud className="w-10 h-10 text-white" />
                          </div>
                        </motion.div>

                        {isDragActive ? (
                          <p className={`text-xl font-bold transition-colors ${activeTheme.brandText}`}>Drop it like it&apos;s 🔥 hot!</p>
                        ) : (
                          <>
                            <p className={`text-xl font-bold mb-2 ${penguinState === 'walking' ? 'text-red-600' : 'text-slate-800'}`}>
                              {penguinState === "walking"
                                ? "🆘 UPLOAD NOW to stop the penguin!"
                                : penguinState === "dead"
                                ? "🪦 Upload to summon a new penguin"
                                : "Drag & drop your resume here"}
                            </p>
                            <p className="text-slate-500 text-sm mb-6 font-medium">
                              or{" "}
                              <span className={`font-bold underline underline-offset-4 transition-colors duration-500 ${activeTheme.brandText} ${activeTheme.brandTextHover}`}>
                                click to browse
                              </span>
                            </p>
                            <div className="flex justify-center gap-3">
                              <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-xs py-1 hover:bg-slate-200 shadow-sm transition-colors">PDF only</Badge>
                              <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-xs py-1 hover:bg-slate-200 shadow-sm transition-colors">Max 5MB</Badge>
                              <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-xs py-1 hover:bg-slate-200 shadow-sm transition-colors">Encrypted</Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {(uploadStatus === "uploading" || uploadStatus === "parsing") && (
                    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                      <div className="relative w-28 h-28 mx-auto mb-8">
                        <div className={`absolute inset-0 rounded-3xl animate-ping opacity-60 transition-colors duration-1000 ${activeTheme.loaderBg}`} />
                        <div className={`relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-1000 bg-gradient-to-br ${activeTheme.loaderIcon}`}>
                          <Loader2 className="w-12 h-12 text-white animate-spin" />
                        </div>
                      </div>
                      <h3 className="text-slate-800 text-2xl font-black mb-3">
                        {uploadStatus === "uploading"
                          ? "🐧 Penguin is reading your resume..."
                          : "🔍 Analyzing your skills..."}
                      </h3>
                      <div className="max-w-xs mx-auto mt-6">
                        <Progress value={progress} className={`h-3 bg-slate-200 transition-colors duration-1000 ${activeTheme.progressInner}`} />
                        <p className="text-slate-500 font-bold text-sm mt-3">{progress}% complete</p>
                      </div>
                    </motion.div>
                  )}

                  {uploadStatus === "ready" && (
                    <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
                      <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 0.5, delay: 0.2 }} className="relative w-28 h-28 mx-auto mb-6">
                        <div className={`absolute inset-0 rounded-3xl animate-ping opacity-60 transition-colors duration-1000 ${activeTheme.successBg}`} />
                        <div className={`relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-xl transition-colors duration-1000 bg-gradient-to-br ${activeTheme.successIcon}`}>
                          <CheckCircle className="w-14 h-14 text-white" />
                        </div>
                      </motion.div>
                      <h3 className="text-slate-800 text-3xl font-black mb-2">🎉 Analysis Complete!</h3>
                      <p className="text-slate-500 font-medium text-base mb-8">The penguin is doing a happy dance! 🕺</p>
                      <Button
                        onClick={handleContinue}
                        className={`w-full text-white font-bold py-7 text-lg rounded-2xl shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${activeTheme.buttonBg}`}
                      >
                        View My Dashboard
                        <ArrowRight className="ml-2 w-6 h-6" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-center gap-6 text-slate-500 font-semibold text-sm">
            <span className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200 backdrop-blur-sm">🏆 10,000+ Analyzed</span>
            <span className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200 backdrop-blur-sm">🌍 45+ Countries</span>
            <span className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200 backdrop-blur-sm">⚡ &lt;2 min Analysis</span>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
          style={{ height: 220 }}
        >
          <svg
            className="absolute bottom-8 left-0 w-full"
            viewBox="0 0 1400 50"
            preserveAspectRatio="none"
            height="50"
          >
            <ellipse cx="250" cy="28" rx="220" ry="22" fill="#e2e8f0" opacity="0.6" />
            <ellipse cx="750" cy="30" rx="300" ry="20" fill="#f1f5f9" opacity="0.8" />
            <ellipse cx="1150" cy="28" rx="200" ry="18" fill="#e2e8f0" opacity="0.5" />
          </svg>

          <div
            className="absolute bottom-0 left-0 right-0 h-10"
            style={{ background: "linear-gradient(to top, #f8fafc 60%, transparent)" }}
          />

          <div className="absolute bottom-8 left-0 right-0 px-20" style={{ height: 200 }}>
            {penguinState === "walking" &&
              [...Array(7)].map((_, i) => {
                const footLeft = parseFloat(penguinLeftPct) - (i + 1) * 5;
                if (footLeft < 0) return null;
                return (
                  <motion.div
                    key={i}
                    className="absolute bottom-7 text-slate-300"
                    style={{ left: `${footLeft}%`, fontSize: 10 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ delay: i * 0.13, duration: 2, repeat: Infinity }}
                  >
                    🐾
                  </motion.div>
                );
              })}

            <motion.div
              className="absolute bottom-4"
              animate={{
                left:
                  penguinState === "walking"
                    ? penguinLeftPct
                    : penguinState === "dead"
                    ? "62%"
                    : "2%",
              }}
              transition={
                penguinState === "walking"
                  ? { duration: 0.2, ease: "linear" }
                  : { duration: 0.6, ease: "easeOut" }
              }
            >
              <AnimatePresence mode="wait">
                {showWalkMsg && penguinState === "walking" && (
                  <motion.div
                    key={walkMsg}
                    initial={{ opacity: 0, y: 8, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.88 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-14 left-14 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-red-200"
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                      minWidth: 160,
                      maxWidth: 250,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {walkMsg}
                    <div
                      className="absolute -bottom-2 left-4 w-3 h-3"
                      style={{
                        background: "#b91c1c",
                        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {(penguinState === "idle" || penguinState === "waiting") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-12 left-14 bg-white border border-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap shadow-lg shadow-slate-200/50"
                >
                  {penguinState === "idle"
                    ? "Upload already... 👀"
                    : "I swear I'm about to walk! 😤"}
                  <div
                    className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-b border-r border-slate-100"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  />
                </motion.div>
              )}

              <PenguinCharacter state={penguinState} tearColor={activeTheme.tearColor} />
            </motion.div>

            <div className="absolute right-0 bottom-2">
              <Mountain crashed={mountainCrashed} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-0 right-0 text-center z-20">
          <p className="text-slate-400 font-medium text-xs">
            © 2024 SkillRank · No penguins were permanently harmed (upload your resume to save one)
          </p>
        </div>
      </main>
    </>
  );
}