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
          {/* Left chunk flying left */}
          <motion.polygon
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: -55, y: 45, rotate: -32 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            points="80,190 170,45 230,190"
            fill="#64748b"
          />
          {/* Right chunk flying right */}
          <motion.polygon
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: 60, y: 35, rotate: 28 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            points="190,190 260,70 320,190"
            fill="#64748b"
          />
          {/* Snow cap falling */}
          <motion.polygon
            points="200,20 178,78 222,78"
            fill="white"
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ y: 120, opacity: 0, rotate: 50, x: -20 }}
            transition={{ duration: 0.7 }}
          />
          {/* Rubble rocks */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <motion.circle
              key={i}
              cx={110 + i * 18}
              cy={180}
              r={3 + (i % 3) * 3}
              fill="#94a3b8"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: [0, -25, 55], opacity: [1, 1, 0] }}
              transition={{ delay: i * 0.06, duration: 0.7 }}
            />
          ))}
          {/* Dust cloud */}
          <motion.ellipse
            cx="200"
            cy="168"
            rx="70"
            ry="22"
            fill="#cbd5e1"
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: [0, 0.85, 0], scaleX: [0.3, 2, 3.5] }}
            transition={{ duration: 1.4 }}
          />
          {/* Ground */}
          <rect x="0" y="185" width="400" height="15" fill="#e2e8f0" rx="4" />
        </>
      ) : (
        <>
          {/* Back mountain */}
          <polygon points="210,190 290,55 370,190" fill="#94a3b8" />
          <polygon points="290,55 272,108 308,108" fill="white" />
          {/* Front mountain */}
          <polygon points="80,190 200,18 320,190" fill="#64748b" />
          <polygon points="200,18 178,78 222,78" fill="white" />
          {/* Ground */}
          <rect x="0" y="178" width="400" height="15" fill="#e2e8f0" rx="4" />
          <ellipse cx="145" cy="180" rx="65" ry="6" fill="white" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

// ─── Penguin SVG Character ────────────────────────────────────────────────────
function PenguinCharacter({
  state,
}: {
  state: "idle" | "waiting" | "walking" | "happy" | "dead";
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
        {/* Shadow */}
        <ellipse cx="60" cy="155" rx="30" ry="6" fill="rgba(0,0,0,0.15)" />
        {/* Body */}
        <ellipse cx="60" cy="100" rx="38" ry="50" fill="#1a1a2e" />
        <ellipse cx="60" cy="108" rx="24" ry="35" fill="#f0f0f0" />
        {/* Head */}
        <ellipse cx="60" cy="55" rx="30" ry="30" fill="#1a1a2e" />
        <ellipse cx="60" cy="60" rx="18" ry="18" fill="#f0f0f0" />

        {/* Eyes */}
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
            <circle cx="53" cy="55" r="3" fill="#111" />
            <circle cx="69" cy="55" r="3" fill="#111" />
            <circle cx="54" cy="53" r="1.2" fill="white" />
            <circle cx="70" cy="53" r="1.2" fill="white" />
          </>
        )}

        {/* Beak */}
        <polygon
          points="60,64 55,70 65,70"
          fill="#FF8C00"
          transform={isDead ? "translate(0,3)" : ""}
        />

        {/* Left wing */}
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
          <ellipse cx="20" cy="92" rx="10" ry="22" fill="#1a1a2e" transform="rotate(-10,20,92)" />
        </motion.g>

        {/* Right wing */}
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
          <ellipse cx="100" cy="92" rx="10" ry="22" fill="#1a1a2e" transform="rotate(10,100,92)" />
        </motion.g>

        {/* Feet */}
        <motion.g
          animate={isWalking ? { x: [0, 5, 0, -5, 0] } : {}}
          transition={{ duration: 0.38, repeat: Infinity }}
        >
          <ellipse
            cx="50" cy="148" rx="12" ry="6" fill="#FF8C00"
            transform={isWalking ? "rotate(-12,50,148)" : ""}
          />
          <ellipse
            cx="70" cy="148" rx="12" ry="6" fill="#FF8C00"
            transform={isWalking ? "rotate(12,70,148)" : ""}
          />
        </motion.g>

        {/* Happy blush */}
        {isHappy && (
          <>
            <ellipse cx="44" cy="66" rx="8" ry="5" fill="#FF9999" opacity="0.55" />
            <ellipse cx="76" cy="66" rx="8" ry="5" fill="#FF9999" opacity="0.55" />
          </>
        )}

        {/* Waiting tears */}
        {isWaiting && (
          <>
            <motion.ellipse cx="49" cy="63" rx="2.5" ry="3.5" fill="#93c5fd"
              animate={{ cy: [63, 74], opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
            />
            <motion.ellipse cx="71" cy="63" rx="2.5" ry="3.5" fill="#93c5fd"
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
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}
    >
      {/* Falling sad emojis */}
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
        {/* Tombstone */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl"
        >
          🪦
        </motion.div>

        <div>
          <h2 className="text-3xl font-black text-white mb-1">RIP 🐧 The Penguin</h2>
          <p className="text-slate-500 text-sm font-mono">2024 – 2024 · Died waiting for a PDF</p>
        </div>

        {/* Sad jokes cycling */}
        <AnimatePresence mode="wait">
          {showJoke && (
            <motion.div
              key={jokeIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl px-6 py-4 text-sm font-semibold text-white max-w-sm"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              😢 {sadJokes[jokeIdx]}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-slate-400 text-sm leading-relaxed">
          The penguin walked to the mountain and was never seen again.
          <br />
          You can still save the <span className="text-cyan-400 font-bold">next</span> penguin though...
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            onClick={onReload}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            Summon a New Penguin
          </Button>
          <Button
            onClick={onReload}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-3 rounded-xl"
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

  // Penguin states
  const [penguinState, setPenguinState] = useState<
    "idle" | "waiting" | "walking" | "happy" | "dead"
  >("idle");
  const [walkProgress, setWalkProgress] = useState(0); // 0–100
  const [mountainCrashed, setMountainCrashed] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);

  // Joke above upload
  const [currentJoke, setCurrentJoke] = useState(0);
  const [showJoke, setShowJoke] = useState(false);

  // Walking bubble message near penguin
  const [walkMsg, setWalkMsg] = useState("");
  const [showWalkMsg, setShowWalkMsg] = useState(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkMsgTimerRef = useRef<NodeJS.Timeout | null>(null);
  const jokeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Joke cycling above upload ──
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

  // ── Start walking message popups ──
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

  // ── Penguin idle → waiting → walking logic ──
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

        // Play sad trombone sound (browser may block autoplay — best effort)
        try {
          const audio = new Audio(
            "https://www.myinstants.com/media/sounds/sad-trombone.mp3"
          );
          audio.volume = 0.3;
          audio.play().catch(() => {});
          audioRef.current = audio;
        } catch (_) {}

        // Walk progress: increments every 200ms, total 100 steps = ~20 seconds walk
        let wp = 0;
        walkTimerRef.current = setInterval(() => {
          wp += 1.2;
          setWalkProgress(Math.min(wp, 100));

          if (wp >= 100) {
            if (walkTimerRef.current) clearInterval(walkTimerRef.current);
            if (walkMsgTimerRef.current) clearInterval(walkMsgTimerRef.current);
            setShowWalkMsg(false);
            // Crash mountain after short delay
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

  // ── Poll upload status ──
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

  // ── File drop ──
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Stop all timers & audio
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
        setUploadId(data.uploadId);
        setProgress(30);
        setUploadStatus("parsing");
        pollStatus(data.uploadId);
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

  // Convert walkProgress (0–100) to a CSS left % within the track
  // Penguin starts at left ~2% and ends near the mountain at ~62%
  const penguinLeftPct = `${2 + Math.min(walkProgress * 0.6, 60)}%`;

  return (
    <>
      {showDeathScreen && <DeathScreen onReload={handleReload} />}

      <main
        className="min-h-screen flex flex-col items-center relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #080e1c 0%, #0c1830 45%, #0a2040 100%)",
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {/* ── Snowflakes ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute select-none text-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-20px",
                fontSize: `${10 + Math.random() * 14}px`,
                opacity: 0.12 + Math.random() * 0.14,
              }}
              animate={{ y: ["0vh", "110vh"], rotate: [0, 360] }}
              transition={{
                duration: 7 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 12,
                ease: "linear",
              }}
            >
              ❄
            </motion.div>
          ))}
        </div>

        {/* ── Header ── */}
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mx-auto flex items-center justify-between px-8 py-5 z-20 relative"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐧</span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Skill<span className="text-cyan-400">Rank</span>
              </h1>
              <p className="text-xs text-slate-600">Powered by Penguin Intelligence™</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs">🔒 Secure</Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">⚡ Fast</Badge>
          </div>
        </motion.header>

        {/* ── Main content ── */}
        <div className="relative z-10 w-full max-w-2xl mx-auto px-6 flex flex-col items-center gap-5 mt-4 pb-60">

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
              Upload Your Resume
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={penguinState}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-base"
              >
                {penguinState === "idle" && (
                  <span className="text-slate-400">
                    Our penguin analyst is{" "}
                    <span className="text-cyan-400 font-bold">patiently waiting</span>{" "}
                    (for now...)
                  </span>
                )}
                {penguinState === "waiting" && (
                  <span className="text-yellow-400 font-bold">
                    ⚠️ The penguin is getting impatient... upload soon!
                  </span>
                )}
                {penguinState === "walking" && (
                  <span className="text-orange-400 font-bold">
                    🚨 THE PENGUIN HAS LEFT THE BUILDING! UPLOAD NOW!
                  </span>
                )}
                {penguinState === "dead" && (
                  <span className="text-red-400 font-bold">
                    💀 Too late. The penguin is gone. Upload to summon a new one.
                  </span>
                )}
                {penguinState === "happy" && (
                  <span className="text-green-400 font-bold">
                    🎉 The penguin is thrilled! Processing your resume...
                  </span>
                )}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* ── Joke above upload card ── */}
          <div className="relative h-14 w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              {showJoke && (
                <motion.div
                  key={currentJoke}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute w-full rounded-2xl px-5 py-3 text-center text-sm font-semibold text-white"
                  style={{
                    background: "rgba(99,102,241,0.18)",
                    border: "1px solid rgba(99,102,241,0.35)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  💬 {normalJokes[currentJoke]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Upload card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full"
          >
            <Card
              className="overflow-hidden border-0"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)",
              }}
            >
              <CardContent className="p-8">
                <AnimatePresence mode="wait">

                  {/* IDLE */}
                  {uploadStatus === "idle" && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div
                        {...getRootProps()}
                        className={`relative border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all text-center ${
                          isDragActive
                            ? "border-cyan-400 bg-cyan-400/10 scale-[1.01]"
                            : penguinState === "walking"
                            ? "border-orange-500/60 bg-orange-500/5 hover:bg-orange-500/10 animate-pulse"
                            : penguinState === "dead"
                            ? "border-red-500/50 bg-red-500/5 hover:bg-red-500/10"
                            : "border-slate-700 hover:border-cyan-500/50 hover:bg-white/5"
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
                          className="mb-5"
                        >
                          <div
                            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 ${
                              penguinState === "walking"
                                ? "bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/40"
                                : penguinState === "dead"
                                ? "bg-gradient-to-br from-red-700 to-red-900 shadow-red-900/40"
                                : "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/30"
                            }`}
                          >
                            <UploadCloud className="w-10 h-10 text-white" />
                          </div>
                        </motion.div>

                        {isDragActive ? (
                          <p className="text-cyan-400 text-xl font-bold">Drop it like it&apos;s 🔥 hot!</p>
                        ) : (
                          <>
                            <p className="text-white text-lg font-bold mb-1">
                              {penguinState === "walking"
                                ? "🆘 UPLOAD NOW to stop the penguin!"
                                : penguinState === "dead"
                                ? "🪦 Upload to summon a new penguin"
                                : "Drag & drop your resume here"}
                            </p>
                            <p className="text-slate-400 text-sm mb-5">
                              or{" "}
                              <span className="text-cyan-400 font-semibold underline underline-offset-2">
                                click to browse
                              </span>
                            </p>
                            <div className="flex justify-center gap-2">
                              <Badge className="bg-slate-800 text-slate-300 border-0 text-xs">PDF only</Badge>
                              <Badge className="bg-slate-800 text-slate-300 border-0 text-xs">Max 5MB</Badge>
                              <Badge className="bg-slate-800 text-slate-300 border-0 text-xs">Encrypted</Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* UPLOADING / PARSING */}
                  {(uploadStatus === "uploading" || uploadStatus === "parsing") && (
                    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 animate-ping" />
                        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                      </div>
                      <h3 className="text-white text-xl font-bold mb-2">
                        {uploadStatus === "uploading"
                          ? "🐧 Penguin is reading your resume..."
                          : "🔍 Analyzing your skills..."}
                      </h3>
                      <div className="max-w-xs mx-auto mt-5">
                        <Progress value={progress} className="h-2 bg-slate-800" />
                        <p className="text-slate-400 text-xs mt-2">{progress}% complete</p>
                      </div>
                    </motion.div>
                  )}

                  {/* READY */}
                  {uploadStatus === "ready" && (
                    <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                      <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 0.5, delay: 0.2 }} className="relative w-24 h-24 mx-auto mb-5">
                        <div className="absolute inset-0 rounded-2xl bg-green-500/20 animate-ping" />
                        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                      </motion.div>
                      <h3 className="text-white text-2xl font-black mb-1">🎉 Analysis Complete!</h3>
                      <p className="text-slate-400 text-sm mb-6">The penguin is doing a happy dance! 🕺</p>
                      <Button
                        onClick={handleContinue}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-5 text-base rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02]"
                      >
                        View My Dashboard
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust badges */}
          <div className="flex justify-center gap-6 text-slate-600 text-xs">
            <span>🏆 10,000+ Analyzed</span>
            <span>🌍 45+ Countries</span>
            <span>⚡ &lt;2 min Analysis</span>
          </div>
        </div>

        {/* ── BOTTOM SCENE: Penguin + Mountain ── */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
          style={{ height: 220 }}
        >
          {/* Ice ground */}
          <svg
            className="absolute bottom-8 left-0 w-full"
            viewBox="0 0 1400 50"
            preserveAspectRatio="none"
            height="50"
          >
            <ellipse cx="250" cy="28" rx="220" ry="22" fill="#cbd5e1" opacity="0.18" />
            <ellipse cx="750" cy="30" rx="300" ry="20" fill="#e2e8f0" opacity="0.14" />
            <ellipse cx="1150" cy="28" rx="200" ry="18" fill="#cbd5e1" opacity="0.16" />
          </svg>

          {/* Dark ground strip */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10"
            style={{ background: "linear-gradient(to top, #080e1c 60%, transparent)" }}
          />

          {/* Penguin track area */}
          <div className="absolute bottom-8 left-0 right-0 px-20" style={{ height: 200 }}>

            {/* Footprints when walking */}
            {penguinState === "walking" &&
              [...Array(7)].map((_, i) => {
                const footLeft = parseFloat(penguinLeftPct) - (i + 1) * 5;
                if (footLeft < 0) return null;
                return (
                  <motion.div
                    key={i}
                    className="absolute bottom-7 text-xs"
                    style={{ left: `${footLeft}%`, fontSize: 10 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.65, 0] }}
                    transition={{ delay: i * 0.13, duration: 2, repeat: Infinity }}
                  >
                    🐾
                  </motion.div>
                );
              })}

            {/* Penguin */}
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
              {/* Walking bubble — keeps showing new messages while walking */}
              <AnimatePresence mode="wait">
                {showWalkMsg && penguinState === "walking" && (
                  <motion.div
                    key={walkMsg}
                    initial={{ opacity: 0, y: 8, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.88 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-14 left-14 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg"
                    style={{
                      background: "linear-gradient(135deg,#ea580c,#dc2626)",
                      minWidth: 160,
                      maxWidth: 250,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {walkMsg}
                    <div
                      className="absolute -bottom-2 left-4 w-3 h-3"
                      style={{
                        background: "#dc2626",
                        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Idle / waiting speech bubble */}
              {(penguinState === "idle" || penguinState === "waiting") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-12 left-14 bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-md"
                >
                  {penguinState === "idle"
                    ? "Upload already... 👀"
                    : "I swear I'm about to walk! 😤"}
                  <div
                    className="absolute -bottom-2 left-4 w-3 h-3 bg-white"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  />
                </motion.div>
              )}

              <PenguinCharacter state={penguinState} />
            </motion.div>

            {/* Mountain — right side */}
            <div className="absolute right-0 bottom-2">
              <Mountain crashed={mountainCrashed} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-1 left-0 right-0 text-center z-20">
          <p className="text-slate-700 text-xs">
            © 2024 SkillRank · No penguins were permanently harmed (upload your resume to save one)
          </p>
        </div>
      </main>
    </>
  );
}