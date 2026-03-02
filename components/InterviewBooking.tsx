"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle, AlertCircle, Loader2,
  Briefcase, Award, UserCheck, Edit3, Trash2,
  Plus, ChevronLeft, CalendarDays, Clock3, RefreshCw,
  WifiOff, FileText, Github, Star, TrendingUp, Brain,
  ClipboardList, Zap, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import axios, { AxiosError } from "axios";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const TIME_SLOTS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

const JOB_DOMAINS = [
  { id:"frontend",  label:"Frontend Dev",    icon:"⚛️", color:"#0891b2" },
  { id:"backend",   label:"Backend Dev",     icon:"⚙️", color:"#7c3aed" },
  { id:"fullstack", label:"Full Stack",      icon:"🔧", color:"#0284c7" },
  { id:"devops",    label:"DevOps",          icon:"🚀", color:"#d97706" },
  { id:"mobile",    label:"Mobile Dev",      icon:"📱", color:"#059669" },
  { id:"data",      label:"Data Scientist",  icon:"📊", color:"#2563eb" },
  { id:"qa",        label:"QA Engineer",     icon:"🧪", color:"#65a30d" },
  { id:"security",  label:"Security Eng",    icon:"🔒", color:"#dc2626" },
  { id:"product",   label:"Product Manager", icon:"📋", color:"#9333ea" },
  { id:"design",    label:"UI/UX Designer",  icon:"🎨", color:"#db2777" },
];

const EXPERIENCE_LEVELS = [
  { id:"entry",  label:"Entry Level",      sub:"0 – 2 years", icon:"🌱", color:"#059669" },
  { id:"mid",    label:"Mid Level",        sub:"3 – 5 years", icon:"📈", color:"#2563eb" },
  { id:"senior", label:"Senior Level",     sub:"6 – 8 years", icon:"⭐", color:"#d97706" },
  { id:"lead",   label:"Lead / Architect", sub:"8+ years",    icon:"👑", color:"#9333ea" },
];

const EXPERT_DELIVERS = [
  { icon: <FileText size={14} />,     color: "#0891b2", title: "Resume Deep-Dive",      desc: "Line-by-line feedback — what to fix, cut, and highlight." },
  { icon: <Github size={14} />,       color: "#7c3aed", title: "GitHub Profile Review", desc: "Repos, commit history & project quality analysed live." },
  { icon: <Brain size={14} />,        color: "#0284c7", title: "Live Mock Interview",   desc: "Domain-specific technical & behavioural questions." },
  { icon: <ClipboardList size={14}/>, color: "#d97706", title: "Full Score Report",     desc: "Written report with strengths, gaps & 30-day action plan." },
  { icon: <TrendingUp size={14} />,   color: "#059669", title: "Career Roadmap",        desc: "Skills to learn, projects to build, roles to target next." },
];

type DomainType = typeof JOB_DOMAINS[0];
type ExpType    = typeof EXPERIENCE_LEVELS[0];
type AptStatus  = "confirmed" | "pending" | "cancelled";

interface Appointment {
  id: string; domainId: string; domain: string; experience: string;
  date: string; time: string; name: string; email: string;
  phone: string; notes: string; status: AptStatus;
}

const fmtDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) : "";
const todayStr = () => new Date().toISOString().split("T")[0];
const maxStr   = () => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split("T")[0]; };
const calcEnd  = (start: string, mins: number) => { const [h,m] = start.split(":").map(Number); const t = h*60+m+mins; return `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`; };

function parseError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED") return "Cannot reach the server. Please check your connection.";
    const msg = err.response?.data?.message ?? err.response?.data?.error;
    if (msg) return String(msg);
    if (err.response?.status === 409) return "This time slot is already booked. Please choose another.";
    if (err.response?.status === 400) return "Invalid data submitted. Please check your details.";
    if (err.response?.status && err.response.status >= 500) return "Server error. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function StatusBadge({ status }: { status: AptStatus }) {
  const map: Record<AptStatus, { bg:string; color:string; border:string; label:string }> = {
    confirmed: { bg:"#dcfce7", color:"#15803d", border:"#bbf7d0", label:"✓ Confirmed" },
    pending:   { bg:"#fef9c3", color:"#a16207", border:"#fde047", label:"⏳ Pending"  },
    cancelled: { bg:"#fee2e2", color:"#dc2626", border:"#fca5a5", label:"✗ Cancelled" },
  };
  const s = map[status] ?? map.pending;
  return <span style={{ fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:99, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{s.label}</span>;
}

function StepBar({ step }: { step: number }) {
  const labels = ["Domain","Schedule","Details"];
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:20 }}>
      {labels.map((label, i) => {
        const n=i+1, done=step>n, active=step===n;
        return (
          <div key={label} style={{ display:"flex", alignItems:"center", flex:i<2?1:"none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", fontWeight:900, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", background:done||active?"linear-gradient(135deg,#0891b2,#7c3aed)":"#f1f5f9", color:done||active?"#fff":"#94a3b8", boxShadow:active?"0 0 14px rgba(8,145,178,.4)":"none", border:!done&&!active?"1.5px solid #e2e8f0":"none", transition:"all .3s" }}>{done?"✓":n}</div>
              <span style={{ fontSize:10, fontWeight:700, color:active?"#0891b2":done?"#7c3aed":"#94a3b8" }}>{label}</span>
            </div>
            {i<2 && <div style={{ flex:1, height:2, margin:"0 4px 14px", background:done?"linear-gradient(90deg,#0891b2,#7c3aed)":"#e2e8f0", borderRadius:99, transition:"background .3s" }} />}
          </div>
        );
      })}
    </div>
  );
}

function SLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, fontSize:11, fontWeight:800, color:"#64748b", letterSpacing:1, textTransform:"uppercase" as const }}>
      {icon && <span style={{ color:"#0891b2" }}>{icon}</span>}
      {children}
      <div style={{ flex:1, height:1, background:"#e2e8f0" }} />
    </div>
  );
}

function FInput({ label, placeholder, value, onChange, type="text", rows }: { label:string; placeholder:string; value:string; onChange:(v:string)=>void; type?:string; rows?:number }) {
  const base: React.CSSProperties = { width:"100%", padding:"11px 13px", borderRadius:11, border:"1.5px solid #e2e8f0", outline:"none", background:"#f8fafc", color:"#1e293b", fontSize:14, fontFamily:"inherit", boxSizing:"border-box", transition:"all .2s" };
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#475569", marginBottom:4 }}>{label}</label>
      {rows ? <textarea placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} rows={rows} style={{...base,resize:"none"}} /> : <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} style={base} />}
    </div>
  );
}

function ErrorBanner({ message, isNetwork }: { message:string; isNetwork?:boolean }) {
  return (
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} style={{ padding:"11px 13px", borderRadius:11, marginBottom:12, background:isNetwork?"#fef9c3":"#fee2e2", border:`1.5px solid ${isNetwork?"#fde047":"#fca5a5"}`, color:isNetwork?"#a16207":"#dc2626", fontSize:13, display:"flex", alignItems:"flex-start", gap:9, lineHeight:1.6 }}>
      {isNetwork ? <WifiOff size={16} style={{ flexShrink:0, marginTop:1 }} /> : <AlertCircle size={16} style={{ flexShrink:0, marginTop:1 }} />}
      <div><strong style={{ display:"block", marginBottom:2 }}>{isNetwork?"Connection Error":"Booking Failed"}</strong>{message}</div>
    </motion.div>
  );
}

function WhatYouGetPanel() {
  return (
    <div style={{ borderRadius:14, overflow:"hidden", marginBottom:18, border:"1.5px solid #bae6fd", background:"linear-gradient(145deg,#f0f9ff,#faf5ff)" }}>
      <div style={{ padding:"12px 14px", borderBottom:"1px solid #e0f2fe", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#bae6fd,#ddd6fe)", border:"1.5px solid #7dd3fc", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Zap size={13} color="#0891b2" />
        </div>
        <div>
          <p style={{ fontWeight:900, fontSize:13, color:"#0f172a" }}>What happens in your session?</p>
          <p style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>A real expert reviews everything & sends a full report</p>
        </div>
      </div>
      <div style={{ padding:"3px 0" }}>
        {EXPERT_DELIVERS.map((item,i) => (
          <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"9px 14px", borderBottom:i<EXPERT_DELIVERS.length-1?"1px solid #f1f5f9":"none" }}>
            <div style={{ width:26, height:26, borderRadius:7, flexShrink:0, background:`${item.color}15`, border:`1px solid ${item.color}40`, display:"flex", alignItems:"center", justifyContent:"center", color:item.color }}>{item.icon}</div>
            <div>
              <p style={{ fontWeight:800, fontSize:12, color:"#1e293b", marginBottom:2 }}>{item.title}</p>
              <p style={{ fontSize:11, color:"#64748b", lineHeight:1.5 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:"9px 14px", borderTop:"1px solid #e0f2fe", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:11, color:"#64748b", fontWeight:700 }}>⏱ 30-min session · No prep needed</span>
        <span style={{ fontSize:11, fontWeight:900, padding:"3px 11px", borderRadius:99, background:"#dcfce7", color:"#15803d", border:"1px solid #bbf7d0" }}>100% FREE</span>
      </div>
    </div>
  );
}

function AptCard({ apt, onEdit, onCancel }: { apt:Appointment; onEdit:(a:Appointment)=>void; onCancel:(id:string)=>void }) {
  const domain = JOB_DOMAINS.find(d => d.id === apt.domainId);
  const accent = domain?.color ?? "#0891b2";
  return (
    <div style={{ position:"relative", borderRadius:14, overflow:"hidden", background:"#fff", border:"1.5px solid #e2e8f0", padding:"14px 14px 14px 18px", boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:`linear-gradient(180deg,${accent},${accent}55)`, borderRadius:"4px 0 0 4px" }} />
      <div style={{ display:"flex", gap:11, alignItems:"flex-start" }}>
        <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:`${accent}12`, border:`1.5px solid ${accent}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{domain?.icon ?? "📋"}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
            <span style={{ fontWeight:800, color:"#0f172a", fontSize:14 }}>{apt.domain}</span>
            <StatusBadge status={apt.status} />
          </div>
          <p style={{ fontSize:11, color:"#0891b2", fontWeight:700, marginBottom:7 }}>🎯 Mock Interview · Resume + GitHub + Report</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 14px", fontSize:12 }}>
            <span style={{ display:"flex", alignItems:"center", gap:5, color:"#475569" }}><CalendarDays size={11} color="#0891b2" />{fmtDate(apt.date)}</span>
            <span style={{ display:"flex", alignItems:"center", gap:5, color:"#475569" }}><Clock3 size={11} color="#7c3aed" />{apt.time} (30 min)</span>
            <span style={{ display:"flex", alignItems:"center", gap:5, color:"#475569" }}>👤 {apt.name}</span>
            <span style={{ display:"flex", alignItems:"center", gap:5, color:"#475569" }}>📱 {apt.phone}</span>
          </div>
          <div style={{ marginTop:7, fontSize:10, color:"#94a3b8", fontWeight:600, padding:"2px 7px", borderRadius:5, display:"inline-block", background:"#f8fafc", border:"1px solid #e2e8f0" }}>ID: {apt.id} · {apt.experience}</div>
        </div>
        {apt.status !== "cancelled" && (
          <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
            <button onClick={()=>onEdit(apt)} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px 11px", borderRadius:9, fontSize:12, fontWeight:700, background:"#ede9fe", color:"#7c3aed", border:"1.5px solid #ddd6fe", cursor:"pointer" }}><Edit3 size={11} />Edit</button>
            <button onClick={()=>onCancel(apt.id)} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px 11px", borderRadius:9, fontSize:12, fontWeight:700, background:"#fee2e2", color:"#dc2626", border:"1.5px solid #fca5a5", cursor:"pointer" }}><Trash2 size={11} />Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewBooking() {
  const [isOpen,     setIsOpen]     = useState(false);
  const [activeTab,  setActiveTab]  = useState<"book"|"manage">("book");
  const [step,       setStep]       = useState(1);
  const [editingApt, setEditingApt] = useState<Appointment|null>(null);
  const [selDomain,  setSelDomain]  = useState<DomainType|null>(null);
  const [selExp,     setSelExp]     = useState<ExpType|null>(null);
  const [selDate,    setSelDate]    = useState("");
  const [selTime,    setSelTime]    = useState("");
  const [avail,      setAvail]      = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", github:"", notes:"" });
  const ff = (k: keyof typeof form) => (v:string) => setForm(p=>({...p,[k]:v}));
  const [loading,    setLoading]    = useState(false);
  const [bookStatus, setBookStatus] = useState<"idle"|"success"|"error">("idle");
  const [errMsg,     setErrMsg]     = useState("");
  const [isNetErr,   setIsNetErr]   = useState(false);
  const [apts,        setApts]        = useState<Appointment[]>([]);
  const [aptsLoading, setAptsLoading] = useState(false);
  const [aptsErr,     setAptsErr]     = useState("");
  const [cancelId,    setCancelId]    = useState<string|null>(null);
  const [cancelling,  setCancelling]  = useState(false);
  const { user } = useStore();

  const loadApts = useCallback(async () => {
    setAptsLoading(true); setAptsErr("");
    try { const { data } = await axios.get(`${API_URL}/meetings`); setApts(data.data ?? data ?? []); }
    catch (err) { setAptsErr(parseError(err)); }
    finally { setAptsLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === "manage" && isOpen) loadApts(); }, [activeTab, isOpen, loadApts]);

  useEffect(() => {
    if (!selDate) return;
    setSlotsLoading(true);
    axios.get(`${API_URL}/meetings/available-slots`, { params:{ date:selDate, duration:30 } })
      .then(({ data }) => { const slots = data.data?.map((s:any)=>s.startTime)??[]; setAvail(slots.length>0?slots:TIME_SLOTS); })
      .catch(() => setAvail(TIME_SLOTS))
      .finally(() => setSlotsLoading(false));
  }, [selDate]);

  const resetForm = () => { setStep(1); setEditingApt(null); setSelDomain(null); setSelExp(null); setSelDate(""); setSelTime(""); setAvail([]); setForm({name:"",email:"",phone:"",github:"",notes:""}); setBookStatus("idle"); setErrMsg(""); setIsNetErr(false); };
  const handleClose = () => { setIsOpen(false); setTimeout(resetForm, 300); };

  const handleSubmit = async () => {
    setLoading(true); setBookStatus("idle"); setErrMsg(""); setIsNetErr(false);
    try {
      const payload = { name:form.name||user?.name||"Anonymous", email:form.email||user?.email||"", phone:form.phone, title:`Mock Interview: ${selDomain?.label} (${selExp?.label})`, description:`Domain: ${selDomain?.label} | Exp: ${selExp?.label} | Notes: ${form.notes||"—"}`, date:selDate, startTime:selTime, endTime:calcEnd(selTime,30), meetingType:"phone", timezone:Intl.DateTimeFormat().resolvedOptions().timeZone };
      if (editingApt) {
        await axios.patch(`${API_URL}/meetings/${editingApt.id}/reschedule`, payload);
        setApts(prev=>prev.map(a=>a.id===editingApt.id?{...a,domain:selDomain!.label,domainId:selDomain!.id,experience:selExp!.label,date:selDate,time:selTime,name:form.name,email:form.email,phone:form.phone}:a));
      } else {
        const { data } = await axios.post(`${API_URL}/meetings/book`, payload);
        setApts(prev=>[...prev,{ id:data.data?.id??`APT-${Date.now()}`, domainId:selDomain!.id, domain:selDomain!.label, experience:selExp!.label, date:selDate, time:selTime, name:form.name, email:form.email, phone:form.phone, notes:form.notes, status:"pending" }]);
      }
      setBookStatus("success");
    } catch (err) {
      const msg=parseError(err); const isNet=err instanceof AxiosError&&(err.code==="ERR_NETWORK"||err.code==="ERR_CONNECTION_REFUSED");
      setErrMsg(msg); setIsNetErr(isNet); setBookStatus("error");
    } finally { setLoading(false); }
  };

  const confirmCancel = async () => {
    if (!cancelId) return; setCancelling(true);
    try { await axios.patch(`${API_URL}/meetings/${cancelId}/cancel`); } catch {}
    finally { setApts(prev=>prev.map(a=>a.id===cancelId?{...a,status:"cancelled"}:a)); setCancelling(false); setCancelId(null); }
  };

  const handleEdit = (apt: Appointment) => { setEditingApt(apt); setSelDomain(JOB_DOMAINS.find(d=>d.id===apt.domainId)??JOB_DOMAINS[0]); setSelExp(EXPERIENCE_LEVELS.find(e=>e.label===apt.experience)??EXPERIENCE_LEVELS[0]); setSelDate(apt.date); setSelTime(apt.time); setForm({name:apt.name,email:apt.email,phone:apt.phone,github:"",notes:apt.notes}); setStep(1); setBookStatus("idle"); setActiveTab("book"); };

  const activeApts = apts.filter(a=>a.status!=="cancelled");
  const cancelledApts = apts.filter(a=>a.status==="cancelled");

  return (
    <>
      {/* Floating CTA */}
      <motion.div className="fixed bottom-5 right-4 sm:bottom-8 sm:right-8 z-50" initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:260, damping:20 }}>
        <motion.button onClick={()=>{ setIsOpen(true); resetForm(); setActiveTab("book"); }} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} style={{ position:"relative", cursor:"pointer", background:"none", border:"none", padding:0 }}>
          <div style={{ position:"absolute", inset:0, borderRadius:99, background:"linear-gradient(135deg,#0891b2,#7c3aed)", filter:"blur(14px)", opacity:.45 }} />
          <div style={{ position:"relative", background:"linear-gradient(135deg,#0891b2,#7c3aed)", color:"#fff", borderRadius:99, padding:"11px 18px", boxShadow:"0 6px 20px rgba(8,145,178,.4)", display:"flex", alignItems:"center", gap:8 }}>
            <Star size={15} />
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
              <span style={{ fontWeight:900, fontSize:12, whiteSpace:"nowrap" }}>Get Interview Ready</span>
              <span style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,.85)" }}>Free mock + full report</span>
            </div>
            <span style={{ background:"rgba(255,255,255,.25)", fontSize:10, fontWeight:900, padding:"2px 8px", borderRadius:99 }}>FREE</span>
            {activeApts.length > 0 && <span style={{ position:"absolute", top:-6, right:-6, width:19, height:19, background:"#dc2626", borderRadius:"50%", fontSize:10, fontWeight:900, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>{activeApts.length}</span>}
          </div>
        </motion.button>
      </motion.div>

      {/* Cancel Dialog */}
      <AnimatePresence>
        {cancelId && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:"fixed", inset:0, zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(0,0,0,.5)", backdropFilter:"blur(6px)" }}>
            <motion.div initial={{ scale:.9,y:14 }} animate={{ scale:1,y:0 }} exit={{ scale:.9 }} style={{ background:"#fff", border:"1.5px solid #fca5a5", borderRadius:18, padding:"24px 22px", maxWidth:320, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>⚠️</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", marginBottom:7 }}>Cancel Appointment?</h3>
              <p style={{ color:"#64748b", fontSize:13, lineHeight:1.7, marginBottom:20 }}>The slot will be released and this appointment will be marked as cancelled.</p>
              <div style={{ display:"flex", gap:9 }}>
                <button onClick={()=>setCancelId(null)} style={{ flex:1, padding:"11px", borderRadius:10, fontWeight:700, fontSize:13, background:"#f8fafc", color:"#475569", border:"1.5px solid #e2e8f0", cursor:"pointer" }}>Keep It</button>
                <button onClick={confirmCancel} disabled={cancelling} style={{ flex:1, padding:"11px", borderRadius:10, fontWeight:700, fontSize:13, background:"#fee2e2", color:"#dc2626", border:"1.5px solid #fca5a5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:cancelling?.7:1 }}>
                  {cancelling?<Loader2 size={13} className="animate-spin" />:<Trash2 size={13} />}{cancelling?"Cancelling…":"Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(15,23,42,.55)", backdropFilter:"blur(8px)" }}
            className="ib-overlay">
            <motion.div
              initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", damping:30, stiffness:300 }}
              style={{ width:"100%", maxWidth:600 }}>
              <Card style={{ border:"none", overflow:"hidden", background:"#fff", boxShadow:"0 -6px 40px rgba(0,0,0,.15)", borderRadius:"22px 22px 0 0" }} className="ib-card">

                {/* Header */}
                <div style={{ padding:"16px 18px 0", background:"linear-gradient(135deg,#f0f9ff,#faf5ff)", borderBottom:"1.5px solid #e0f2fe" }}>
                  <div className="ib-handle" style={{ width:34, height:4, background:"#cbd5e1", borderRadius:99, margin:"0 auto 14px" }} />
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:11, flex:1, minWidth:0 }}>
                      <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:"linear-gradient(135deg,#0891b2,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(8,145,178,.35)" }}>
                        <Brain size={20} color="#fff" />
                      </div>
                      <div style={{ minWidth:0 }}>
                        <h2 style={{ fontSize:16, fontWeight:900, color:"#0f172a", letterSpacing:-.2, lineHeight:1.2 }}>
                          {activeTab==="book"?(editingApt?"✏️ Reschedule Session":"Mock Interview with Expert"):"My Interview Sessions"}
                        </h2>
                        <p style={{ fontSize:11, color:"#64748b", marginTop:3 }}>
                          {activeTab==="book"&&!editingApt?"Resume · GitHub · Interview · Full Report":activeTab==="book"&&editingApt?"Update your session date, time, or role":"Track and manage your upcoming sessions"}
                        </p>
                      </div>
                    </div>
                    {/* Large tappable X */}
                    <button onClick={handleClose} aria-label="Close" style={{ width:42, height:42, borderRadius:"50%", flexShrink:0, background:"#f1f5f9", border:"1.5px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginLeft:8 }}>
                      <X size={18} color="#475569" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <CardContent style={{ padding:0, background:"#fff" }} className="ib-body custom-scrollbar">

                  {activeTab === "manage" && (
                    <div style={{ padding:"18px" }}>
                      {aptsLoading ? (
                        <div style={{ textAlign:"center", padding:"40px 0" }}>
                          <Loader2 size={26} className="animate-spin" style={{ color:"#0891b2", margin:"0 auto", display:"block" }} />
                          <p style={{ color:"#94a3b8", marginTop:11, fontSize:13 }}>Loading sessions…</p>
                        </div>
                      ) : aptsErr ? (
                        <div style={{ padding:"20px 0" }}>
                          <ErrorBanner message={aptsErr} isNetwork={aptsErr.includes("server")} />
                          <button onClick={loadApts} style={{ width:"100%", padding:"12px", borderRadius:11, fontWeight:700, fontSize:14, background:"#f0f9ff", color:"#0891b2", border:"1.5px solid #bae6fd", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><RefreshCw size={13} />Try Again</button>
                        </div>
                      ) : apts.length === 0 ? (
                        <div style={{ textAlign:"center", padding:"36px 0" }}>
                          <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                          <h3 style={{ fontSize:16, fontWeight:800, color:"#475569", marginBottom:7 }}>No sessions yet</h3>
                          <p style={{ color:"#94a3b8", fontSize:13, marginBottom:20, lineHeight:1.8 }}>Schedule a free mock interview with a real industry expert.</p>
                          <button onClick={()=>{ setActiveTab("book"); resetForm(); }} style={{ padding:"11px 22px", borderRadius:11, background:"linear-gradient(135deg,#0891b2,#7c3aed)", color:"#fff", fontWeight:800, fontSize:13, border:"none", cursor:"pointer", boxShadow:"0 4px 14px rgba(8,145,178,.3)", display:"inline-flex", alignItems:"center", gap:7 }}>
                            <Plus size={14} />Book Free Session
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                            <p style={{ fontSize:12, color:"#64748b", fontWeight:600 }}>{activeApts.length} active · {cancelledApts.length} cancelled</p>
                            <button onClick={loadApts} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:7, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#64748b", fontSize:12, fontWeight:700, cursor:"pointer" }}><RefreshCw size={11} />Refresh</button>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            {apts.map(apt=><AptCard key={apt.id} apt={apt} onEdit={handleEdit} onCancel={setCancelId} />)}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "book" && (
                    <div style={{ padding:"18px 18px 14px" }}>

                      {bookStatus === "success" ? (
                        <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:"center", padding:"6px 0" }}>
                          <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
                            <div style={{ position:"absolute", inset:-8, borderRadius:"50%", background:"#dcfce7", animation:"ping 1.2s ease-in-out infinite" }} />
                            <div style={{ position:"relative", width:68, height:68, borderRadius:17, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 28px rgba(16,185,129,.38)" }}><CheckCircle size={33} color="#fff" /></div>
                          </div>
                          <h3 style={{ fontSize:19, fontWeight:900, color:"#0f172a", marginBottom:5 }}>{editingApt?"Session Rescheduled! ✅":"You're booked! 🎉"}</h3>
                          <p style={{ color:"#475569", fontSize:13, marginBottom:4, lineHeight:1.7 }}>
                            {editingApt?"Your session has been updated.":<>A <strong style={{ color:"#0891b2" }}>{selDomain?.label}</strong> expert will call <strong style={{ color:"#0891b2" }}>{form.phone}</strong>.</>}
                          </p>
                          {!editingApt && <>
                            <p style={{ color:"#64748b", fontSize:12, marginBottom:16, lineHeight:1.7 }}>Have your <strong style={{ color:"#7c3aed" }}>resume</strong> and <strong style={{ color:"#7c3aed" }}>GitHub</strong> open and ready.</p>
                            <div style={{ background:"#faf5ff", border:"1.5px solid #ddd6fe", borderRadius:13, padding:"11px 14px", marginBottom:16, textAlign:"left" }}>
                              <p style={{ fontSize:11, fontWeight:800, color:"#7c3aed", marginBottom:9, letterSpacing:.4, textTransform:"uppercase" as const }}>📋 Prepare before your call</p>
                              {["Keep your latest Resume / CV ready","Open your GitHub profile","Note 2–3 projects you want feedback on","Think of your target companies"].map((item,i)=>(
                                <div key={i} style={{ display:"flex", gap:7, alignItems:"flex-start", marginBottom:i<3?6:0 }}>
                                  <span style={{ color:"#10b981", fontSize:12 }}>✓</span>
                                  <span style={{ fontSize:12, color:"#475569", lineHeight:1.5 }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          </>}
                          <div style={{ background:"#f0f9ff", border:"1.5px solid #bae6fd", borderRadius:13, overflow:"hidden", marginBottom:16, textAlign:"left" }}>
                            {[
                              { label:"Role",       val:selDomain?.label,               icon:"💼" },
                              { label:"Experience", val:selExp?.label,                   icon:"🎯" },
                              { label:"Date",       val:fmtDate(selDate),                icon:"📅" },
                              { label:"Time",       val:`${selTime} – ${calcEnd(selTime,30)}`, icon:"🕐" },
                              { label:"Phone",      val:form.phone,                      icon:"📱" },
                            ].map((row,i)=>(
                              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderBottom:i<4?"1px solid #e0f2fe":"none" }}>
                                <span style={{ color:"#64748b", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>{row.icon} {row.label}</span>
                                <span style={{ fontWeight:700, color:"#0f172a", fontSize:12 }}>{row.val}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          {step===1&&!editingApt&&<WhatYouGetPanel />}
                          <StepBar step={step} />

                          {step===1&&(
                            <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}>
                              <SLabel icon={<Briefcase size={11} />}>Which role will the interview be for?</SLabel>
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:20 }}>
                                {JOB_DOMAINS.map(d=>{ const sel=selDomain?.id===d.id; return (
                                  <motion.button key={d.id} onClick={()=>setSelDomain(d)} whileTap={{ scale:.97 }} style={{ padding:"11px", borderRadius:12, textAlign:"left", cursor:"pointer", border:sel?`2px solid ${d.color}`:"1.5px solid #e2e8f0", background:sel?`${d.color}10`:"#f8fafc", boxShadow:sel?`0 0 18px ${d.color}20`:"none", transition:"all .2s" }}>
                                    <div style={{ fontSize:20, marginBottom:4 }}>{d.icon}</div>
                                    <div style={{ fontWeight:800, fontSize:11, color:sel?d.color:"#475569" }}>{d.label}</div>
                                  </motion.button>
                                ); })}
                              </div>
                              {selDomain&&(
                                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                                  <SLabel icon={<Award size={11} />}>Your experience level</SLabel>
                                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:20 }}>
                                    {EXPERIENCE_LEVELS.map(l=>{ const sel=selExp?.id===l.id; return (
                                      <button key={l.id} onClick={()=>setSelExp(l)} style={{ padding:"11px", borderRadius:12, textAlign:"left", cursor:"pointer", border:sel?`2px solid ${l.color}`:"1.5px solid #e2e8f0", background:sel?`${l.color}10`:"#f8fafc", boxShadow:sel?`0 0 18px ${l.color}20`:"none", transition:"all .2s" }}>
                                        <div style={{ fontSize:18, marginBottom:4 }}>{l.icon}</div>
                                        <div style={{ fontWeight:800, fontSize:11, marginBottom:2, color:sel?l.color:"#475569" }}>{l.label}</div>
                                        <div style={{ fontSize:10, color:"#94a3b8", fontWeight:600 }}>{l.sub}</div>
                                      </button>
                                    ); })}
                                  </div>
                                  {selExp&&(
                                    <motion.div initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} style={{ padding:"11px 13px", borderRadius:12, marginBottom:18, background:"#f0f9ff", border:"1.5px solid #bae6fd", display:"flex", gap:9, alignItems:"center" }}>
                                      <UserCheck size={15} color="#0891b2" style={{ flexShrink:0 }} />
                                      <div>
                                        <p style={{ fontWeight:800, color:"#0f172a", fontSize:12, marginBottom:2 }}>Expert matched ✓</p>
                                        <p style={{ fontSize:11, color:"#64748b" }}>A <span style={{ color:"#0891b2", fontWeight:700 }}>{selDomain.label}</span> interviewer for <span style={{ color:"#7c3aed", fontWeight:700 }}>{selExp.label}</span> candidates will be assigned.</p>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              )}
                              <button disabled={!selDomain||!selExp} onClick={()=>setStep(2)} style={{ width:"100%", padding:"13px", borderRadius:12, background:selDomain&&selExp?"linear-gradient(135deg,#0891b2,#7c3aed)":"#f1f5f9", color:selDomain&&selExp?"#fff":"#94a3b8", fontWeight:800, fontSize:13, border:"none", cursor:selDomain&&selExp?"pointer":"not-allowed", boxShadow:selDomain&&selExp?"0 4px 18px rgba(8,145,178,.32)":"none", transition:"all .3s", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                                Pick a Date & Time <ChevronRight size={14} />
                              </button>
                            </motion.div>
                          )}

                          {step===2&&(
                            <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}>
                              <div style={{ padding:"11px 13px", borderRadius:12, marginBottom:18, background:"#f0f9ff", border:"1.5px solid #bae6fd", display:"flex", gap:9, alignItems:"center" }}>
                                <Brain size={15} color="#0891b2" style={{ flexShrink:0 }} />
                                <p style={{ fontSize:12, color:"#64748b" }}>📄 Resume · 🐙 GitHub · 🎤 Interview · 📊 Report</p>
                              </div>
                              <SLabel icon={<CalendarDays size={11} />}>Choose a Date</SLabel>
                              <input type="date" min={todayStr()} max={maxStr()} value={selDate} onChange={e=>{ setSelDate(e.target.value); setSelTime(""); }} style={{ width:"100%", padding:"11px 13px", borderRadius:11, marginBottom:18, border:"1.5px solid #e2e8f0", outline:"none", background:"#f8fafc", color:"#1e293b", fontSize:14, fontFamily:"inherit", boxSizing:"border-box" }} />
                              {selDate&&(
                                <>
                                  <SLabel icon={<Clock3 size={11} />}>Pick a Time (30 min){slotsLoading&&<Loader2 size={10} className="animate-spin" style={{ color:"#0891b2" }} />}</SLabel>
                                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:18 }}>
                                    {TIME_SLOTS.map(t=>{ const ok=avail.length===0||avail.includes(t), sel=selTime===t; return <button key={t} onClick={()=>ok&&setSelTime(t)} disabled={!ok} style={{ padding:"11px 5px", borderRadius:9, fontWeight:800, fontSize:13, cursor:ok?"pointer":"not-allowed", border:sel?"2px solid #0891b2":"1.5px solid #e2e8f0", background:sel?"linear-gradient(135deg,#0891b2,#7c3aed)":ok?"#f8fafc":"#f8fafc", color:sel?"#fff":ok?"#1e293b":"#cbd5e1", boxShadow:sel?"0 3px 12px rgba(8,145,178,.3)":"none", opacity:ok?1:.5, transition:"all .2s" }}>{t}</button>; })}
                                  </div>
                                </>
                              )}
                              <div style={{ display:"flex", gap:7 }}>
                                <button onClick={()=>setStep(1)} style={{ padding:"11px 14px", borderRadius:11, fontWeight:700, fontSize:13, background:"#f8fafc", color:"#64748b", border:"1.5px solid #e2e8f0", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><ChevronLeft size={14} />Back</button>
                                <button disabled={!selDate||!selTime} onClick={()=>setStep(3)} style={{ flex:1, padding:"11px", borderRadius:11, background:selDate&&selTime?"linear-gradient(135deg,#0891b2,#7c3aed)":"#f1f5f9", color:selDate&&selTime?"#fff":"#94a3b8", fontWeight:800, fontSize:13, border:"none", cursor:selDate&&selTime?"pointer":"not-allowed", boxShadow:selDate&&selTime?"0 4px 14px rgba(8,145,178,.28)":"none", transition:"all .3s", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>Fill in Details <ChevronRight size={14} /></button>
                              </div>
                            </motion.div>
                          )}

                          {step===3&&(
                            <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}>
                              <SLabel>Your Details</SLabel>
                              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
                                <FInput label="Full Name *" placeholder="Enter your full name" value={form.name} onChange={ff("name")} />
                                <FInput label="Email Address *" placeholder="you@email.com" type="email" value={form.email} onChange={ff("email")} />
                                <FInput label="Phone Number * (expert will call you)" placeholder="+91 98765 43210" type="tel" value={form.phone} onChange={ff("phone")} />
                                <FInput label="What do you want feedback on? (optional)" placeholder="e.g. Resume gaps, system design…" value={form.notes} onChange={ff("notes")} rows={3} />
                              </div>
                              <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14, padding:"9px 11px", borderRadius:10, background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                                {[selDomain&&{text:selDomain.label,color:selDomain.color},selExp&&{text:selExp.label,color:selExp.color},selDate&&{text:fmtDate(selDate),color:"#2563eb"},selTime&&{text:selTime,color:"#059669"}].filter(Boolean).map((tag:any)=>(
                                  <span key={tag.text} style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:99, background:`${tag.color}12`, color:tag.color, border:`1px solid ${tag.color}28` }}>{tag.text}</span>
                                ))}
                              </div>
                              {bookStatus==="error"&&<ErrorBanner message={errMsg} isNetwork={isNetErr} />}
                              <div style={{ display:"flex", gap:7 }}>
                                <button onClick={()=>setStep(2)} style={{ padding:"11px 14px", borderRadius:11, fontWeight:700, fontSize:13, background:"#f8fafc", color:"#64748b", border:"1.5px solid #e2e8f0", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><ChevronLeft size={14} />Back</button>
                                <button disabled={!form.name||!form.email||!form.phone||loading} onClick={handleSubmit} style={{ flex:1, padding:"11px", borderRadius:11, background:form.name&&form.email&&form.phone&&!loading?"linear-gradient(135deg,#0891b2,#7c3aed)":"#f1f5f9", color:form.name&&form.email&&form.phone&&!loading?"#fff":"#94a3b8", fontWeight:800, fontSize:13, border:"none", cursor:form.name&&form.email&&form.phone&&!loading?"pointer":"not-allowed", boxShadow:form.name&&form.email&&form.phone&&!loading?"0 4px 18px rgba(8,145,178,.32)":"none", transition:"all .3s", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                                  {loading?<><Loader2 size={15} className="animate-spin" />{editingApt?"Updating…":"Booking…"}</>:editingApt?<><RefreshCw size={14} />Reschedule</>:<><CheckCircle size={14} />Confirm Free Session</>}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* Footer */}
                <div style={{ padding:"9px 18px 11px", borderTop:"1.5px solid #f1f5f9", background:"#fafafa", display:"flex", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
                  {["🔒 Private","📊 Full Report","🎯 Role Expert","📞 We Call You"].map(t=>(
                    <span key={t} style={{ fontSize:10, color:"#94a3b8", fontWeight:700 }}>{t}</span>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #bae6fd; border-radius: 10px; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity:.5; cursor:pointer; }
        input::placeholder, textarea::placeholder { color: #94a3b8; }
        input:focus, textarea:focus { border-color: #7dd3fc !important; box-shadow: 0 0 0 3px rgba(8,145,178,.1); }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }

        /* Mobile: bottom sheet */
        .ib-body { max-height: calc(100svh - 155px); overflow-y: auto; }
        .ib-handle { display: block; }

        /* Desktop: centered modal */
        @media (min-width: 640px) {
          .ib-overlay { align-items: center !important; padding: 16px !important; }
          .ib-card { border-radius: 24px !important; box-shadow: 0 24px 80px rgba(0,0,0,.2) !important; }
          .ib-body { max-height: 68vh !important; }
          .ib-handle { display: none !important; }
        }
      `}</style>
    </>
  );
}