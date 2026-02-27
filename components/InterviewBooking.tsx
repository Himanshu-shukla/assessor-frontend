"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Phone, CheckCircle, AlertCircle, Loader2,
  Briefcase, Award, UserCheck, Edit3, Trash2,
  Plus, ChevronLeft, CalendarDays, Clock3, RefreshCw,
  WifiOff, FileText, Github, Star, TrendingUp, Brain,
  ClipboardList, Zap, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import axios, { AxiosError } from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/* ─── constants ─────────────────────────────────────────────────────────── */
const TIME_SLOTS = [
  "09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00",
];

const JOB_DOMAINS = [
  { id:"frontend",  label:"Frontend Dev",    icon:"⚛️", color:"#22d3ee" },
  { id:"backend",   label:"Backend Dev",     icon:"⚙️", color:"#a78bfa" },
  { id:"fullstack", label:"Full Stack",      icon:"🔧", color:"#f472b6" },
  { id:"devops",    label:"DevOps",          icon:"🚀", color:"#fbbf24" },
  { id:"mobile",    label:"Mobile Dev",      icon:"📱", color:"#34d399" },
  { id:"data",      label:"Data Scientist",  icon:"📊", color:"#60a5fa" },
  { id:"qa",        label:"QA Engineer",     icon:"🧪", color:"#a3e635" },
  { id:"security",  label:"Security Eng",    icon:"🔒", color:"#fb7185" },
  { id:"product",   label:"Product Manager", icon:"📋", color:"#c084fc" },
  { id:"design",    label:"UI/UX Designer",  icon:"🎨", color:"#f9a8d4" },
];

const EXPERIENCE_LEVELS = [
  { id:"entry",  label:"Entry Level",      sub:"0 – 2 years", icon:"🌱", color:"#34d399" },
  { id:"mid",    label:"Mid Level",        sub:"3 – 5 years", icon:"📈", color:"#60a5fa" },
  { id:"senior", label:"Senior Level",     sub:"6 – 8 years", icon:"⭐", color:"#fbbf24" },
  { id:"lead",   label:"Lead / Architect", sub:"8+ years",    icon:"👑", color:"#f472b6" },
];

// What the expert will review / provide
const EXPERT_DELIVERS = [
  { icon: <FileText size={15} />,    color: "#22d3ee", title: "Resume Deep-Dive",      desc: "Line-by-line feedback on your resume — what to fix, cut, and highlight." },
  { icon: <Github size={15} />,      color: "#a78bfa", title: "GitHub Profile Review", desc: "Your repos, commit history & project quality analysed by a real engineer." },
  { icon: <Brain size={15} />,       color: "#f472b6", title: "Live Mock Interview",   desc: "Domain-specific technical & behavioural questions asked in real-time." },
  { icon: <ClipboardList size={15}/>, color: "#fbbf24", title: "Full Score Report",    desc: "Detailed written report with strengths, gaps & a 30-day action plan." },
  { icon: <TrendingUp size={15} />,  color: "#34d399", title: "Career Roadmap",        desc: "Exact skills to learn, projects to build, and roles to target next." },
];

type DomainType = typeof JOB_DOMAINS[0];
type ExpType    = typeof EXPERIENCE_LEVELS[0];
type AptStatus  = "confirmed" | "pending" | "cancelled";

interface Appointment {
  id: string;
  domainId: string;
  domain: string;
  experience: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: AptStatus;
}

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmtDate = (d: string) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      })
    : "";

const todayStr = () => new Date().toISOString().split("T")[0];
const maxStr   = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
};
const calcEnd = (start: string, mins: number) => {
  const [h, m] = start.split(":").map(Number);
  const total  = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

function parseError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED") {
      return "Cannot reach the server. Please check your connection or try again later.";
    }
    const msg = err.response?.data?.message ?? err.response?.data?.error;
    if (msg) return String(msg);
    if (err.response?.status === 404) return "Endpoint not found. Please contact support.";
    if (err.response?.status === 409) return "This time slot is already booked. Please choose another.";
    if (err.response?.status === 400) return "Invalid data submitted. Please check your details.";
    if (err.response?.status && err.response.status >= 500)
      return "Server error. Please try again in a moment.";
  }
  return "Something went wrong. Please try again.";
}

/* ─── STATUS BADGE ───────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: AptStatus }) {
  const map: Record<AptStatus, { bg: string; color: string; label: string }> = {
    confirmed: { bg: "rgba(52,211,153,.15)",  color: "#34d399", label: "✓ Confirmed" },
    pending:   { bg: "rgba(251,191,36,.15)",  color: "#fbbf24", label: "⏳ Pending"  },
    cancelled: { bg: "rgba(248,113,113,.15)", color: "#f87171", label: "✗ Cancelled" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: "3px 12px", borderRadius: 99,
      background: s.bg, color: s.color, letterSpacing: .8,
      border: `1px solid ${s.color}44`,
    }}>{s.label}</span>
  );
}

/* ─── STEP BAR ───────────────────────────────────────────────────────────── */
function StepBar({ step }: { step: number }) {
  const labels = ["Domain", "Schedule", "Details"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {labels.map((label, i) => {
        const n = i + 1, done = step > n, active = step === n;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", fontWeight: 900, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done || active ? "linear-gradient(135deg,#22d3ee,#a78bfa)" : "rgba(255,255,255,.07)",
                color: done || active ? "#fff" : "#475569",
                boxShadow: active ? "0 0 18px rgba(34,211,238,.5)" : "none",
                border: !done && !active ? "1.5px solid rgba(255,255,255,.08)" : "none",
                transition: "all .3s",
              }}>{done ? "✓" : n}</div>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: .4,
                color: active ? "#22d3ee" : done ? "#a78bfa" : "#334155",
              }}>{label}</span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: 2, margin: "0 6px 18px",
                background: done ? "linear-gradient(90deg,#22d3ee,#a78bfa)" : "rgba(255,255,255,.08)",
                borderRadius: 99, transition: "background .3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── SECTION LABEL ──────────────────────────────────────────────────────── */
function SLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
      fontSize: 12, fontWeight: 800, color: "#94a3b8",
      letterSpacing: 1.2, textTransform: "uppercase" as const,
    }}>
      {icon && <span style={{ color: "#22d3ee" }}>{icon}</span>}
      {children}
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
    </div>
  );
}

/* ─── FIELD INPUT ────────────────────────────────────────────────────────── */
function FInput({
  label, placeholder, value, onChange, type = "text", rows,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; rows?: number;
}) {
  const base: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 14,
    border: "1.5px solid rgba(255,255,255,.1)", outline: "none",
    background: "rgba(255,255,255,.05)", color: "#f1f5f9",
    fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", transition: "border .2s",
  };
  return (
    <div>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 700,
        color: "#64748b", marginBottom: 6, letterSpacing: .3,
      }}>{label}</label>
      {rows
        ? <textarea placeholder={placeholder} value={value}
            onChange={e => onChange(e.target.value)} rows={rows}
            style={{ ...base, resize: "none" }} />
        : <input type={type} placeholder={placeholder} value={value}
            onChange={e => onChange(e.target.value)} style={base} />
      }
    </div>
  );
}

/* ─── ERROR BANNER ───────────────────────────────────────────────────────── */
function ErrorBanner({ message, isNetwork }: { message: string; isNetwork?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "14px 16px", borderRadius: 14, marginBottom: 16,
        background: isNetwork ? "rgba(251,191,36,.1)" : "rgba(239,68,68,.12)",
        border: `1.5px solid ${isNetwork ? "rgba(251,191,36,.3)" : "rgba(239,68,68,.3)"}`,
        color: isNetwork ? "#fbbf24" : "#f87171",
        fontSize: 13, display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.6,
      }}>
      {isNetwork
        ? <WifiOff size={17} style={{ flexShrink: 0, marginTop: 1 }} />
        : <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
      }
      <div>
        <strong style={{ display: "block", marginBottom: 2 }}>
          {isNetwork ? "Connection Error" : "Booking Failed"}
        </strong>
        {message}
      </div>
    </motion.div>
  );
}

/* ─── WHAT YOU GET PANEL ─────────────────────────────────────────────────── */
function WhatYouGetPanel() {
  return (
    <div style={{
      borderRadius: 20, overflow: "hidden", marginBottom: 24,
      border: "1.5px solid rgba(34,211,238,.18)",
      background: "linear-gradient(145deg, rgba(6,182,212,.06), rgba(124,58,237,.06))",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: "1px solid rgba(255,255,255,.07)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg,#22d3ee22,#a78bfa22)",
          border: "1.5px solid rgba(34,211,238,.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Zap size={15} color="#22d3ee" />
        </div>
        <div>
          <p style={{ fontWeight: 900, fontSize: 14, color: "#f1f5f9", letterSpacing: -.2 }}>
            What happens in your session?
          </p>
          <p style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>
            A real industry expert reviews everything &amp; gives you a full report
          </p>
        </div>
      </div>

      {/* Items */}
      <div style={{ padding: "6px 0" }}>
        {EXPERT_DELIVERS.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 14, alignItems: "flex-start",
            padding: "12px 20px",
            borderBottom: i < EXPERT_DELIVERS.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: `${item.color}18`,
              border: `1px solid ${item.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: item.color,
            }}>{item.icon}</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: "#e2e8f0", marginBottom: 3 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Free badge */}
      <div style={{
        padding: "12px 20px",
        borderTop: "1px solid rgba(255,255,255,.07)",
        background: "rgba(52,211,153,.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
          ⏱ 30-minute session · No preparation needed
        </span>
        <span style={{
          fontSize: 11, fontWeight: 900, padding: "4px 14px", borderRadius: 99,
          background: "rgba(52,211,153,.15)", color: "#34d399",
          border: "1px solid rgba(52,211,153,.3)", letterSpacing: .5,
        }}>100% FREE</span>
      </div>
    </div>
  );
}

/* ─── APPOINTMENT CARD ───────────────────────────────────────────────────── */
function AptCard({
  apt, onEdit, onCancel,
}: { apt: Appointment; onEdit: (a: Appointment) => void; onCancel: (id: string) => void }) {
  const domain = JOB_DOMAINS.find(d => d.id === apt.domainId);
  const accent = domain?.color ?? "#22d3ee";
  return (
    <div style={{
      position: "relative", borderRadius: 20, overflow: "hidden",
      background: "rgba(255,255,255,.04)",
      border: "1.5px solid rgba(255,255,255,.09)",
      padding: "20px 20px 20px 24px",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: `linear-gradient(180deg,${accent},${accent}33)`,
        borderRadius: "4px 0 0 4px",
      }} />
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: `${accent}18`, border: `1.5px solid ${accent}33`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>{domain?.icon ?? "📋"}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontWeight: 800, color: "#f1f5f9", fontSize: 16 }}>{apt.domain}</span>
            <StatusBadge status={apt.status} />
          </div>
          {/* Interview reminder */}
          <p style={{
            fontSize: 11, color: "#22d3ee", fontWeight: 700,
            marginBottom: 10, letterSpacing: .3,
          }}>
            🎯 Mock Interview · Resume + GitHub Review + Full Report
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}>
              <CalendarDays size={13} color="#22d3ee" /> {fmtDate(apt.date)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}>
              <Clock3 size={13} color="#a78bfa" /> {apt.time} (30 min)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}>
              <span>👤</span> {apt.name}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}>
              <span>📱</span> {apt.phone}
            </span>
          </div>
          <div style={{
            marginTop: 10, fontSize: 11, color: "#475569", fontWeight: 600,
            padding: "4px 10px", borderRadius: 8, display: "inline-block",
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)",
          }}>ID: {apt.id} · {apt.experience}</div>
        </div>

        {apt.status !== "cancelled" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <button onClick={() => onEdit(apt)} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 14px", borderRadius: 11, fontSize: 12, fontWeight: 700,
              background: "rgba(99,102,241,.18)", color: "#a5b4fc",
              border: "1.5px solid rgba(99,102,241,.35)", cursor: "pointer",
            }}><Edit3 size={13} /> Edit</button>
            <button onClick={() => onCancel(apt.id)} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 14px", borderRadius: 11, fontSize: 12, fontWeight: 700,
              background: "rgba(239,68,68,.12)", color: "#f87171",
              border: "1.5px solid rgba(239,68,68,.3)", cursor: "pointer",
            }}><Trash2 size={13} /> Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ MAIN ══════ */
export default function InterviewBooking() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [activeTab,   setActiveTab]   = useState<"book" | "manage">("book");
  const [step,        setStep]        = useState(1);
  const [editingApt,  setEditingApt]  = useState<Appointment | null>(null);

  const [selDomain, setSelDomain] = useState<DomainType | null>(null);
  const [selExp,    setSelExp]    = useState<ExpType | null>(null);
  const [selDate,   setSelDate]   = useState("");
  const [selTime,   setSelTime]   = useState("");
  const [avail,     setAvail]     = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "", github: "", notes: "" });
  const ff = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const [loading,    setLoading]    = useState(false);
  const [bookStatus, setBookStatus] = useState<"idle" | "success" | "error">("idle");
  const [errMsg,     setErrMsg]     = useState("");
  const [isNetErr,   setIsNetErr]   = useState(false);

  const [apts,        setApts]        = useState<Appointment[]>([]);
  const [aptsLoading, setAptsLoading] = useState(false);
  const [aptsErr,     setAptsErr]     = useState("");
  const [cancelId,    setCancelId]    = useState<string | null>(null);
  const [cancelling,  setCancelling]  = useState(false);

  const { user } = useStore();

  /* ── load meetings ── */
  const loadApts = useCallback(async () => {
    setAptsLoading(true);
    setAptsErr("");
    try {
      const { data } = await axios.get(`${API_URL}/meetings`);
      setApts(data.data ?? data ?? []);
    } catch (err) {
      setAptsErr(parseError(err));
    } finally {
      setAptsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "manage" && isOpen) loadApts();
  }, [activeTab, isOpen, loadApts]);

  /* ── fetch available slots ── */
  useEffect(() => {
    if (!selDate) return;
    setSlotsLoading(true);
    axios
      .get(`${API_URL}/meetings/available-slots`, { params: { date: selDate, duration: 30 } })
      .then(({ data }) => {
        const slots = data.data?.map((s: any) => s.startTime) ?? [];
        setAvail(slots.length > 0 ? slots : TIME_SLOTS);
      })
      .catch(() => {
        setAvail(TIME_SLOTS);
      })
      .finally(() => setSlotsLoading(false));
  }, [selDate]);

  const resetForm = () => {
    setStep(1); setEditingApt(null);
    setSelDomain(null); setSelExp(null);
    setSelDate(""); setSelTime(""); setAvail([]);
    setForm({ name: "", email: "", phone: "", github: "", notes: "" });
    setBookStatus("idle"); setErrMsg(""); setIsNetErr(false);
  };
  const handleClose = () => { setIsOpen(false); setTimeout(resetForm, 300); };

  /* ── BOOK / RESCHEDULE ── */
  const handleSubmit = async () => {
    setLoading(true); setBookStatus("idle"); setErrMsg(""); setIsNetErr(false);
    try {
      const payload = {
        name:        form.name  || user?.name  || "Anonymous",
        email:       form.email || user?.email || "",
        phone:       form.phone,
        title:       `Mock Interview: ${selDomain?.label} (${selExp?.label})`,
        description: `Domain: ${selDomain?.label} | Exp: ${selExp?.label} | GitHub: ${form.github || "—"} | Notes: ${form.notes || "—"}`,
        date:        selDate,
        startTime:   selTime,
        endTime:     calcEnd(selTime, 30),
        meetingType: "phone",
        timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      if (editingApt) {
        await axios.patch(`${API_URL}/meetings/${editingApt.id}/reschedule`, payload);
        setApts(prev => prev.map(a => a.id === editingApt.id
          ? {
              ...a,
              domain:     selDomain!.label, domainId: selDomain!.id,
              experience: selExp!.label,
              date: selDate, time: selTime,
              name: form.name, email: form.email, phone: form.phone,
            }
          : a));
      } else {
        const { data } = await axios.post(`${API_URL}/meetings/book`, payload);
        const newApt: Appointment = {
          id:         data.data?.id ?? `APT-${Date.now()}`,
          domainId:   selDomain!.id,
          domain:     selDomain!.label,
          experience: selExp!.label,
          date: selDate,  time:  selTime,
          name: form.name, email: form.email,
          phone: form.phone, notes: form.notes,
          status: "pending",
        };
        setApts(prev => [...prev, newApt]);
      }

      setBookStatus("success");
    } catch (err) {
      const msg    = parseError(err);
      const isNet  = err instanceof AxiosError &&
        (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED");
      setErrMsg(msg);
      setIsNetErr(isNet);
      setBookStatus("error");
    } finally {
      setLoading(false);
    }
  };

  /* ── CANCEL ── */
  const confirmCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await axios.patch(`${API_URL}/meetings/${cancelId}/cancel`);
    } catch { /* optimistic */ } finally {
      setApts(prev => prev.map(a => a.id === cancelId ? { ...a, status: "cancelled" } : a));
      setCancelling(false);
      setCancelId(null);
    }
  };

  /* ── EDIT ── */
  const handleEdit = (apt: Appointment) => {
    setEditingApt(apt);
    setSelDomain(JOB_DOMAINS.find(d => d.id === apt.domainId) ?? JOB_DOMAINS[0]);
    setSelExp(EXPERIENCE_LEVELS.find(e => e.label === apt.experience) ?? EXPERIENCE_LEVELS[0]);
    setSelDate(apt.date); setSelTime(apt.time);
    setForm({ name: apt.name, email: apt.email, phone: apt.phone, github: "", notes: apt.notes });
    setStep(1); setBookStatus("idle");
    setActiveTab("book");
  };

  const activeApts    = apts.filter(a => a.status !== "cancelled");
  const cancelledApts = apts.filter(a => a.status === "cancelled");

  /* ════════════════════════════════════════════════════════════════ RENDER ═ */
  return (
    <>
      {/* ── Floating CTA button ── */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}>
        <motion.button
          onClick={() => { setIsOpen(true); resetForm(); setActiveTab("book"); }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          style={{ position: "relative", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: 99,
            background: "linear-gradient(135deg,#22d3ee,#a78bfa)",
            filter: "blur(20px)", opacity: .6,
          }} />
          <div style={{
            position: "relative",
            background: "linear-gradient(135deg,#06b6d4,#7c3aed)",
            color: "#fff", borderRadius: 99, padding: "14px 26px",
            boxShadow: "0 8px 32px rgba(6,182,212,.4)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Star size={17} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontWeight: 900, fontSize: 13, whiteSpace: "nowrap", letterSpacing: .3, lineHeight: 1.2 }}>
                Get Interview Ready
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.7)", letterSpacing: .2 }}>
                Free mock interview + full report
              </span>
            </div>
            <span style={{
              background: "rgba(255,255,255,.2)", fontSize: 10,
              fontWeight: 900, padding: "3px 10px", borderRadius: 99,
            }}>FREE</span>
            {activeApts.length > 0 && (
              <span style={{
                position: "absolute", top: -7, right: -7,
                width: 22, height: 22, background: "#f43f5e", borderRadius: "50%",
                fontSize: 11, fontWeight: 900, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(244,63,94,.5)",
              }}>{activeApts.length}</span>
            )}
          </div>
        </motion.button>
      </motion.div>

      {/* ── Cancel confirm dialog ── */}
      <AnimatePresence>
        {cancelId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
              background: "rgba(0,0,0,.9)", backdropFilter: "blur(10px)",
            }}>
            <motion.div
              initial={{ scale: .88, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .88 }}
              style={{
                background: "#0f172a", border: "1.5px solid rgba(248,113,113,.3)",
                borderRadius: 24, padding: "36px 30px",
                maxWidth: 360, width: "100%", textAlign: "center",
              }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>⚠️</div>
              <h3 style={{ fontSize: 21, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>
                Cancel Appointment?
              </h3>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                The slot will be released and this appointment will be marked as cancelled.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCancelId(null)} style={{
                  flex: 1, padding: "12px", borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: "rgba(255,255,255,.05)", color: "#94a3b8",
                  border: "1.5px solid rgba(255,255,255,.1)", cursor: "pointer",
                }}>Keep It</button>
                <button onClick={confirmCancel} disabled={cancelling} style={{
                  flex: 1, padding: "12px", borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: "rgba(239,68,68,.18)", color: "#f87171",
                  border: "1.5px solid rgba(239,68,68,.4)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: cancelling ? .7 : 1,
                }}>
                  {cancelling ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  {cancelling ? "Cancelling…" : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,.88)", backdropFilter: "blur(12px)" }}>
            <motion.div
              initial={{ scale: .92, y: 28 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: .92, y: 28 }}
              style={{ width: "100%", maxWidth: 600 }}>

              <Card style={{
                border: "none", overflow: "hidden", background: "#0c1525",
                boxShadow: "0 40px 100px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.07)",
              }}>

                {/* ── Header ── */}
                <div style={{
                  padding: "24px 28px 0",
                  background: "linear-gradient(135deg,rgba(6,182,212,.1),rgba(124,58,237,.1))",
                  borderBottom: "1.5px solid rgba(255,255,255,.07)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: "linear-gradient(135deg,#06b6d4,#7c3aed)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 6px 24px rgba(6,182,212,.45)", flexShrink: 0,
                      }}><Brain size={24} color="#fff" /></div>
                      <div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9", letterSpacing: -.3, lineHeight: 1.2 }}>
                          {activeTab === "book"
                            ? (editingApt ? "✏️ Reschedule Session" : "Mock Interview with an Expert")
                            : "My Interview Sessions"}
                        </h2>
                        <p style={{ fontSize: 12, color: "#475569", marginTop: 4, lineHeight: 1.6 }}>
                          {activeTab === "book" && !editingApt
                            ? "Resume review · GitHub analysis · Real interview · Detailed feedback report"
                            : activeTab === "book" && editingApt
                              ? "Update your session date, time, or role"
                              : "Track and manage your upcoming sessions"}
                        </p>
                      </div>
                    </div>
                    <button onClick={handleClose} style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "rgba(255,255,255,.06)",
                      border: "1.5px solid rgba(255,255,255,.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0,
                    }}><X size={16} color="#94a3b8" /></button>
                  </div>

                  {/* ── Tabs ── */}
                  {/* <div style={{ display: "flex" }}>
                    {(["book", "manage"] as const).map(tab => (
                    //   <button key={tab}
                    //     onClick={() => { setActiveTab(tab); if (tab === "book" && !editingApt) resetForm(); }}
                    //     style={{
                    //       flex: 1, padding: "11px 0", fontWeight: 800, fontSize: 13,
                    //       cursor: "pointer", border: "none", background: "none",
                    //       color: activeTab === tab ? "#22d3ee" : "#334155",
                    //       borderBottom: activeTab === tab
                    //         ? "2.5px solid #22d3ee"
                    //         : "2.5px solid transparent",
                    //       transition: "all .2s", letterSpacing: .3,
                    //     }}>
                    //     {tab === "book"
                    //       ? (editingApt ? "📅 Edit Session" : "📅 Book Session")
                    //       : `📋 My Sessions${apts.length > 0 ? ` (${activeApts.length})` : ""}`}
                    //   </button>
                    ))}
                  </div> */}
                </div>

                {/* ── Body ── */}
                <CardContent
                  style={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
                  className="custom-scrollbar">

                  {/* ══════ MANAGE TAB ══════ */}
                  {activeTab === "manage" && (
                    <div style={{ padding: "24px 28px" }}>
                      {aptsLoading ? (
                        <div style={{ textAlign: "center", padding: "48px 0" }}>
                          <Loader2 size={32} className="animate-spin"
                            style={{ color: "#22d3ee", margin: "0 auto", display: "block" }} />
                          <p style={{ color: "#475569", marginTop: 14, fontSize: 14 }}>
                            Loading your sessions…
                          </p>
                        </div>
                      ) : aptsErr ? (
                        <div style={{ padding: "32px 0" }}>
                          <ErrorBanner message={aptsErr} isNetwork={aptsErr.includes("server")} />
                          <button onClick={loadApts} style={{
                            width: "100%", padding: "12px", borderRadius: 14, fontWeight: 700, fontSize: 14,
                            background: "rgba(34,211,238,.1)", color: "#22d3ee",
                            border: "1.5px solid rgba(34,211,238,.25)", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          }}>
                            <RefreshCw size={15} /> Try Again
                          </button>
                        </div>
                      ) : apts.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "52px 0" }}>
                          <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#94a3b8", marginBottom: 8 }}>
                            No sessions booked yet
                          </h3>
                          <p style={{ color: "#475569", fontSize: 14, marginBottom: 26, lineHeight: 1.8 }}>
                            Schedule a free mock interview with a real industry expert.<br />
                            Get your resume reviewed, GitHub analysed, and receive<br />
                            a personalised improvement report — all in 30 minutes.
                          </p>
                          <button
                            onClick={() => { setActiveTab("book"); resetForm(); }}
                            style={{
                              padding: "12px 28px", borderRadius: 14,
                              background: "linear-gradient(135deg,#06b6d4,#7c3aed)",
                              color: "#fff", fontWeight: 800, fontSize: 14,
                              border: "none", cursor: "pointer",
                              boxShadow: "0 6px 20px rgba(6,182,212,.4)",
                              display: "inline-flex", alignItems: "center", gap: 8,
                            }}>
                            <Plus size={16} /> Book Free Session
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                              {activeApts.length} active · {cancelledApts.length} cancelled
                            </p>
                            <button onClick={loadApts} style={{
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "7px 14px", borderRadius: 10,
                              background: "rgba(255,255,255,.05)",
                              border: "1px solid rgba(255,255,255,.1)",
                              color: "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer",
                            }}>
                              <RefreshCw size={12} /> Refresh
                            </button>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {apts.map(apt => (
                              <AptCard key={apt.id} apt={apt}
                                onEdit={handleEdit} onCancel={setCancelId} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ══════ BOOK TAB ══════ */}
                  {activeTab === "book" && (
                    <div style={{ padding: "28px 28px 24px" }}>

                      {/* ── SUCCESS ── */}
                      {bookStatus === "success" ? (
                        <motion.div
                          initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                          style={{ textAlign: "center", padding: "16px 0" }}>
                          <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
                            <div style={{
                              position: "absolute", inset: -10, borderRadius: "50%",
                              background: "rgba(52,211,153,.15)",
                              animation: "ping 1.2s ease-in-out infinite",
                            }} />
                            <div style={{
                              position: "relative", width: 88, height: 88, borderRadius: 22,
                              background: "linear-gradient(135deg,#10b981,#059669)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              boxShadow: "0 12px 40px rgba(16,185,129,.45)",
                            }}><CheckCircle size={44} color="#fff" /></div>
                          </div>
                          <h3 style={{ fontSize: 24, fontWeight: 900, color: "#f1f5f9", marginBottom: 8, letterSpacing: -.5 }}>
                            {editingApt ? "Session Rescheduled! ✅" : "You're booked! 🎉"}
                          </h3>
                          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 6, lineHeight: 1.8 }}>
                            {editingApt
                              ? "Your mock interview session has been updated."
                              : <>A real <strong style={{ color: "#22d3ee" }}>{selDomain?.label}</strong> expert will call <strong style={{ color: "#22d3ee" }}>{form.phone}</strong> at your booked time.</>}
                          </p>
                          {!editingApt && (
                            <p style={{ color: "#475569", fontSize: 12, marginBottom: 24, lineHeight: 1.8 }}>
                              Have your <strong style={{ color: "#a78bfa" }}>resume PDF</strong> and your <strong style={{ color: "#a78bfa" }}>GitHub profile</strong> open and ready.<br />
                              Your expert will review them live and give you a full improvement report after the call.
                            </p>
                          )}

                          {/* Checklist: what to prepare */}
                          {!editingApt && (
                            <div style={{
                              background: "rgba(167,139,250,.07)",
                              border: "1.5px solid rgba(167,139,250,.2)",
                              borderRadius: 16, padding: "14px 18px",
                              marginBottom: 24, textAlign: "left",
                            }}>
                              <p style={{ fontSize: 12, fontWeight: 800, color: "#a78bfa", marginBottom: 12, letterSpacing: .5, textTransform: "uppercase" as const }}>
                                📋 Prepare before your call
                              </p>
                              {[
                                "Keep your latest Resume / CV ready",
                                `Open your GitHub profile (${form.github || "github.com/yourprofile"})`,
                                "Note 2–3 projects or roles you want feedback on",
                                "Think of 1–2 target companies or roles you're aiming for",
                              ].map((item, i) => (
                                <div key={i} style={{
                                  display: "flex", gap: 10, alignItems: "flex-start",
                                  marginBottom: i < 3 ? 8 : 0,
                                }}>
                                  <span style={{ color: "#34d399", fontSize: 14, flexShrink: 0 }}>✓</span>
                                  <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{
                            background: "rgba(34,211,238,.07)", border: "1.5px solid rgba(34,211,238,.18)",
                            borderRadius: 18, overflow: "hidden", marginBottom: 24, textAlign: "left",
                          }}>
                            {[
                              { label: "Role",       val: selDomain?.label,                       icon: "💼" },
                              { label: "Experience", val: selExp?.label,                           icon: "🎯" },
                              { label: "Date",       val: fmtDate(selDate),                        icon: "📅" },
                              { label: "Time",       val: `${selTime} – ${calcEnd(selTime, 30)}`,  icon: "🕐" },
                              { label: "Phone",      val: form.phone,                              icon: "📱" },
                            ].map((row, i) => (
                              <div key={row.label} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "13px 18px",
                                borderBottom: i < 4 ? "1px solid rgba(255,255,255,.05)" : "none",
                              }}>
                                <span style={{ color: "#64748b", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                                  {row.icon} {row.label}
                                </span>
                                <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 13 }}>{row.val}</span>
                              </div>
                            ))}
                          </div>
                          {/* <div style={{ display: "flex", gap: 10 }}>
                            <button
                              onClick={() => { setActiveTab("manage"); resetForm(); loadApts(); }}
                              style={{
                                flex: 1, padding: "13px", borderRadius: 14, fontWeight: 700, fontSize: 13,
                                background: "rgba(255,255,255,.06)", color: "#94a3b8",
                                border: "1.5px solid rgba(255,255,255,.1)", cursor: "pointer",
                              }}>View Sessions</button>
                            <button onClick={resetForm} style={{
                              flex: 1, padding: "13px", borderRadius: 14, fontWeight: 700, fontSize: 13,
                              background: "linear-gradient(135deg,#06b6d4,#7c3aed)", color: "#fff",
                              border: "none", cursor: "pointer",
                              boxShadow: "0 6px 20px rgba(6,182,212,.35)",
                            }}>Book Another</button>
                          </div> */}
                        </motion.div>

                      ) : (
                        <>
                          {/* Show "what you get" only on step 1 first time */}
                          {step === 1 && !editingApt && <WhatYouGetPanel />}

                          <StepBar step={step} />

                          {/* ─── STEP 1 ─── */}
                          {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                              <SLabel icon={<Briefcase size={13} />}>Which role will the interview be for?</SLabel>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
                                {JOB_DOMAINS.map(d => {
                                  const sel = selDomain?.id === d.id;
                                  return (
                                    <motion.button key={d.id}
                                      onClick={() => setSelDomain(d)}
                                      whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                      style={{
                                        padding: "14px", borderRadius: 16, textAlign: "left", cursor: "pointer",
                                        border: sel ? `2px solid ${d.color}` : "1.5px solid rgba(255,255,255,.09)",
                                        background: sel ? `${d.color}14` : "rgba(255,255,255,.03)",
                                        boxShadow: sel ? `0 0 24px ${d.color}28` : "none",
                                        transition: "all .2s",
                                      }}>
                                      <div style={{ fontSize: 24, marginBottom: 7 }}>{d.icon}</div>
                                      <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: .2, color: sel ? d.color : "#94a3b8" }}>
                                        {d.label}
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>

                              {selDomain && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                  <SLabel icon={<Award size={13} />}>Your current experience level</SLabel>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
                                    {EXPERIENCE_LEVELS.map(l => {
                                      const sel = selExp?.id === l.id;
                                      return (
                                        <button key={l.id} onClick={() => setSelExp(l)} style={{
                                          padding: "16px", borderRadius: 16, textAlign: "left", cursor: "pointer",
                                          border: sel ? `2px solid ${l.color}` : "1.5px solid rgba(255,255,255,.09)",
                                          background: sel ? `${l.color}14` : "rgba(255,255,255,.03)",
                                          boxShadow: sel ? `0 0 24px ${l.color}28` : "none",
                                          transition: "all .2s",
                                        }}>
                                          <div style={{ fontSize: 22, marginBottom: 6 }}>{l.icon}</div>
                                          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4, color: sel ? l.color : "#94a3b8" }}>
                                            {l.label}
                                          </div>
                                          <div style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{l.sub}</div>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Expert match preview */}
                                  {selExp && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                      style={{
                                        padding: "14px 18px", borderRadius: 16, marginBottom: 24,
                                        background: "linear-gradient(135deg,rgba(6,182,212,.08),rgba(124,58,237,.08))",
                                        border: "1.5px solid rgba(6,182,212,.2)",
                                        display: "flex", gap: 12, alignItems: "center",
                                      }}>
                                      <UserCheck size={18} color="#22d3ee" style={{ flexShrink: 0 }} />
                                      <div>
                                        <p style={{ fontWeight: 800, color: "#f1f5f9", fontSize: 13, marginBottom: 3 }}>
                                          Expert matched ✓
                                        </p>
                                        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                                          A <span style={{ color: "#22d3ee", fontWeight: 700 }}>{selDomain.label}</span> interviewer
                                          experienced with <span style={{ color: "#a78bfa", fontWeight: 700 }}>{selExp.label}</span> candidates
                                          will be assigned to your session.
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              )}

                              <button
                                disabled={!selDomain || !selExp}
                                onClick={() => setStep(2)}
                                style={{
                                  width: "100%", padding: "15px", borderRadius: 14,
                                  background: selDomain && selExp
                                    ? "linear-gradient(135deg,#06b6d4,#7c3aed)"
                                    : "rgba(255,255,255,.07)",
                                  color: selDomain && selExp ? "#fff" : "#334155",
                                  fontWeight: 800, fontSize: 15, border: "none",
                                  cursor: selDomain && selExp ? "pointer" : "not-allowed",
                                  boxShadow: selDomain && selExp ? "0 6px 24px rgba(6,182,212,.35)" : "none",
                                  transition: "all .3s", letterSpacing: .2,
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                }}>
                                Pick a Date & Time <ChevronRight size={16} />
                              </button>
                            </motion.div>
                          )}

                          {/* ─── STEP 2 ─── */}
                          {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                              <div style={{
                                padding: "14px 18px", borderRadius: 16, marginBottom: 24,
                                background: "linear-gradient(135deg,rgba(6,182,212,.08),rgba(124,58,237,.08))",
                                border: "1.5px solid rgba(6,182,212,.2)",
                                display: "flex", gap: 12, alignItems: "flex-start",
                              }}>
                                <Brain size={18} color="#22d3ee" style={{ flexShrink: 0, marginTop: 1 }} />
                                <div>
                                  <p style={{ fontWeight: 800, color: "#f1f5f9", fontSize: 14, marginBottom: 4 }}>
                                    Your session will include:
                                  </p>
                                  <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
                                    📄 Resume review &nbsp;·&nbsp; 🐙 GitHub analysis &nbsp;·&nbsp; 🎤 Live mock interview &nbsp;·&nbsp; 📊 Score report with action plan
                                  </p>
                                </div>
                              </div>

                              <SLabel icon={<CalendarDays size={13} />}>Choose a Date</SLabel>
                              <input
                                type="date" min={todayStr()} max={maxStr()}
                                value={selDate}
                                onChange={e => { setSelDate(e.target.value); setSelTime(""); }}
                                style={{
                                  width: "100%", padding: "13px 16px", borderRadius: 14, marginBottom: 22,
                                  border: "1.5px solid rgba(255,255,255,.12)", outline: "none",
                                  background: "rgba(255,255,255,.05)", color: "#f1f5f9",
                                  fontSize: 14, fontFamily: "inherit",
                                  colorScheme: "dark", boxSizing: "border-box",
                                }} />

                              {selDate && (
                                <>
                                  <SLabel icon={<Clock3 size={13} />}>
                                    Pick a Time (30-min session)
                                    {slotsLoading && (
                                      <Loader2 size={12} className="animate-spin" style={{ color: "#22d3ee" }} />
                                    )}
                                  </SLabel>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24 }}>
                                    {TIME_SLOTS.map(t => {
                                      const ok  = avail.length === 0 || avail.includes(t);
                                      const sel = selTime === t;
                                      return (
                                        <button key={t}
                                          onClick={() => ok && setSelTime(t)}
                                          disabled={!ok}
                                          style={{
                                            padding: "13px 8px", borderRadius: 12,
                                            fontWeight: 800, fontSize: 14,
                                            cursor: ok ? "pointer" : "not-allowed",
                                            border: sel ? "2px solid #22d3ee" : "1.5px solid rgba(255,255,255,.1)",
                                            background: sel
                                              ? "linear-gradient(135deg,#06b6d4,#7c3aed)"
                                              : ok ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.02)",
                                            color: sel ? "#fff" : ok ? "#e2e8f0" : "#334155",
                                            boxShadow: sel ? "0 4px 18px rgba(6,182,212,.45)" : "none",
                                            opacity: ok ? 1 : .35, transition: "all .2s",
                                          }}>{t}</button>
                                      );
                                    })}
                                  </div>
                                </>
                              )}

                              <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => setStep(1)} style={{
                                  padding: "13px 18px", borderRadius: 14, fontWeight: 700, fontSize: 13,
                                  background: "rgba(255,255,255,.05)", color: "#64748b",
                                  border: "1.5px solid rgba(255,255,255,.1)", cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: 6,
                                }}><ChevronLeft size={16} /> Back</button>
                                <button
                                  disabled={!selDate || !selTime}
                                  onClick={() => setStep(3)}
                                  style={{
                                    flex: 1, padding: "13px", borderRadius: 14,
                                    background: selDate && selTime
                                      ? "linear-gradient(135deg,#06b6d4,#7c3aed)"
                                      : "rgba(255,255,255,.07)",
                                    color: selDate && selTime ? "#fff" : "#334155",
                                    fontWeight: 800, fontSize: 14, border: "none",
                                    cursor: selDate && selTime ? "pointer" : "not-allowed",
                                    boxShadow: selDate && selTime ? "0 6px 20px rgba(6,182,212,.35)" : "none",
                                    transition: "all .3s",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                  }}>Fill in Your Details <ChevronRight size={16} /></button>
                              </div>
                            </motion.div>
                          )}

                          {/* ─── STEP 3 ─── */}
                          {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                              <SLabel>Your Details</SLabel>
                              <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 20 }}>
                                <FInput label="Full Name *" placeholder="Enter your full name"
                                  value={form.name} onChange={ff("name")} />
                                <FInput label="Email Address *" placeholder="you@email.com"
                                  type="email" value={form.email} onChange={ff("email")} />
                                <FInput label="Phone Number * (expert will call you on this)"
                                  placeholder="+91 98765 43210"
                                  type="tel" value={form.phone} onChange={ff("phone")} />
                                {/* <div>
                                  <FInput
                                    label="GitHub Profile URL (recommended — expert will review it live)"
                                    placeholder="https://github.com/yourusername"
                                    value={form.github} onChange={ff("github")} />
                                  <p style={{ fontSize: 11, color: "#475569", marginTop: 5, paddingLeft: 4 }}>
                                    💡 The expert will look at your repos, commit quality & project structure during the call.
                                  </p>
                                </div> */}
                                <FInput label="What do you want feedback on? (optional)"
                                  placeholder="e.g. My resume gaps, system design skills, negotiating a senior role at a product company…"
                                  value={form.notes} onChange={ff("notes")} rows={3} />
                              </div>

                              {/* session summary chips */}
                              <div style={{
                                display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 20,
                                padding: "12px 14px", borderRadius: 14,
                                background: "rgba(255,255,255,.03)",
                                border: "1px solid rgba(255,255,255,.07)",
                              }}>
                                {[
                                  selDomain && { text: selDomain.label, color: selDomain.color },
                                  selExp    && { text: selExp.label,    color: selExp.color    },
                                  selDate   && { text: fmtDate(selDate), color: "#60a5fa"      },
                                  selTime   && { text: selTime,          color: "#34d399"      },
                                ].filter(Boolean).map((tag: any) => (
                                  <span key={tag.text} style={{
                                    fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99,
                                    background: `${tag.color}18`, color: tag.color,
                                    border: `1px solid ${tag.color}33`,
                                  }}>{tag.text}</span>
                                ))}
                              </div>

                              {bookStatus === "error" && (
                                <ErrorBanner message={errMsg} isNetwork={isNetErr} />
                              )}

                              <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => setStep(2)} style={{
                                  padding: "13px 18px", borderRadius: 14, fontWeight: 700, fontSize: 13,
                                  background: "rgba(255,255,255,.05)", color: "#64748b",
                                  border: "1.5px solid rgba(255,255,255,.1)", cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: 6,
                                }}><ChevronLeft size={16} /> Back</button>
                                <button
                                  disabled={!form.name || !form.email || !form.phone || loading}
                                  onClick={handleSubmit}
                                  style={{
                                    flex: 1, padding: "13px", borderRadius: 14, fontWeight: 800, fontSize: 14,
                                    background: form.name && form.email && form.phone && !loading
                                      ? "linear-gradient(135deg,#06b6d4,#7c3aed)"
                                      : "rgba(255,255,255,.07)",
                                    color: form.name && form.email && form.phone && !loading ? "#fff" : "#334155",
                                    border: "none",
                                    cursor: form.name && form.email && form.phone && !loading ? "pointer" : "not-allowed",
                                    boxShadow: form.name && form.email && form.phone && !loading
                                      ? "0 6px 24px rgba(6,182,212,.4)" : "none",
                                    transition: "all .3s", letterSpacing: .2,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                  }}>
                                  {loading
                                    ? <><Loader2 size={17} className="animate-spin" />
                                        {editingApt ? "Updating…" : "Booking session…"}</>
                                    : editingApt
                                      ? <><RefreshCw size={16} /> Reschedule Session</>
                                      : <><CheckCircle size={16} /> Confirm Free Session</>}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* ── Footer ── */}
                <div style={{
                  padding: "12px 28px",
                  borderTop: "1.5px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.02)",
                  display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap",
                }}>
                  {["🔒 Private & Secure", "📊 Full Report After Call", "🎯 Role-Specific Expert", "📞 We Call You"].map(t => (
                    <span key={t} style={{ fontSize: 11, color: "#334155", fontWeight: 700, letterSpacing: .3 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,.03); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,.5); }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(.45) sepia(1) saturate(2) hue-rotate(170deg);
        }
        input::placeholder, textarea::placeholder { color: #2d3f55; }
        input:focus, textarea:focus { border-color: rgba(34,211,238,.55) !important; }
        @keyframes ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }
      `}</style>
    </>
  );
}