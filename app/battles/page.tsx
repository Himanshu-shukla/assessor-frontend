"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Loader2, Trophy, ArrowRight, ShieldAlert, Sparkles, User, Code, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Candidate {
  _id: string;
  name: string;
  topSkills: string[];
  aiReport: any;
  battleWins: number;
  battleLosses: number;
}

export default function BattlesPage() {
  const { sessionId, initSession } = useStore();
  const [candidates, setCandidates] = useState<[Candidate, Candidate] | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initSession();
    fetchMatchup();
  }, [initSession]);

  const fetchMatchup = async () => {
    try {
      setLoading(true);
      setError(null);
      setWinnerId(null);
      
      const { data } = await axios.get(`${API_URL}/analysis/battle/matchup`, {
        headers: { "x-session-id": sessionId || "" },
      });

      if (data.candidates && data.candidates.length === 2) {
        setCandidates(data.candidates as [Candidate, Candidate]);
      } else {
        throw new Error("Invalid matchup data");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load candidates for battle.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (winner: Candidate, loser: Candidate) => {
    if (voting) return;
    try {
      setVoting(true);
      setWinnerId(winner._id);

      await axios.post(`${API_URL}/analysis/battle/vote`, {
        winnerId: winner._id,
        loserId: loser._id
      }, {
        headers: { "x-session-id": sessionId || "" },
      });

      // Show winner animation briefly, then load next
      setTimeout(() => {
        fetchMatchup();
        setVoting(false);
      }, 1800);

    } catch (err: any) {
      console.error("Failed to vote:", err);
      setVoting(false);
      setWinnerId(null);
    }
  };

  const formatRadarData = (parameters: any[]) => {
    if (!parameters) return [];
    return parameters.map((p: any) => ({
      subject: p.parameter.length > 12 ? p.parameter.slice(0, 12) + "..." : p.parameter,
      score: p.score,
      fullMark: 10,
    })).slice(0, 5); // Limit to 5 points to keep chart clean
  };

  // Safe accessor for AI report deeply nested properties
  const safeProp = (obj: any, path: string[], defaultValue: any = "N/A"): any => {
      try {
          let current = obj;
          for(const p of path) {
              if (current === undefined || current === null) return defaultValue;
              current = current[p];
          }
          return current ?? defaultValue;
      } catch (e) {
          return defaultValue;
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center border border-rose-200 shadow-inner">
            <Swords className="text-rose-600 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Resume Battles</h1>
            <p className="text-xs font-bold text-slate-400 tracking-wide uppercase">Rank Candidates</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="ghost" className="font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-9">
            Exit Arena
          </Button>
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="relative">
               <div className="absolute inset-0 bg-rose-200 rounded-full animate-ping opacity-60" />
               <div className="relative w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center border-2 border-rose-500 shadow-lg">
                 <Swords className="text-rose-600 w-8 h-8 animate-bounce" />
               </div>
            </div>
            <p className="text-slate-600 font-bold text-lg animate-pulse">Summoning candidates to the arena...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <ShieldAlert className="w-16 h-16 text-rose-300" />
            <p className="text-slate-600 font-bold text-lg">{error}</p>
            <Button onClick={fetchMatchup} variant="outline" className="mt-4 border-slate-200">Try Again</Button>
          </div>
        )}

        {!loading && !error && candidates && (
          <div className="flex flex-col lg:flex-row gap-8 items-stretch relative">
            
            {/* VS Badge */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-slate-800 rounded-full items-center justify-center shadow-2xl border-4 border-white">
              <span className="font-black text-white text-xl italic tracking-tighter">VS</span>
            </div>

            {candidates.map((candidate, idx) => {
              const isWinner = winnerId === candidate._id;
              const isLoser = winnerId && winnerId !== candidate._id;
              const otherCandidate = candidates[idx === 0 ? 1 : 0];
              const score = safeProp(candidate, ['aiReport', 'total_score'], 0);
              const totalMatches = (candidate.battleWins || 0) + (candidate.battleLosses || 0);
              const winRate = totalMatches > 0 ? Math.round(((candidate.battleWins || 0) / totalMatches) * 100) : 0;
              const radarData = formatRadarData(safeProp(candidate, ['aiReport', 'parameters'], []));

              return (
                <div key={candidate._id} className="flex-1">
                  <motion.div 
                    initial={{ opacity: 0, x: idx === 0 ? -50 : 50 }}
                    animate={{ 
                      opacity: isLoser ? 0.3 : 1, 
                      scale: isWinner ? 1.02 : isLoser ? 0.95 : 1,
                      x: 0
                    }}
                    transition={{ duration: 0.4 }}
                    className={`h-full flex flex-col bg-white rounded-3xl border-2 transition-all p-6 sm:p-8 shadow-sm ${
                      isWinner ? "border-emerald-500 shadow-emerald-100 shadow-2xl" : 
                      isLoser ? "border-slate-100" : 
                      "border-slate-200 hover:border-indigo-200 hover:shadow-xl"
                    }`}
                  >
                    
                    {/* Header: Name & Score */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                            idx === 0 ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                        }`}>
                          <User className="w-6 h-6 opacity-60" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            Candidate {candidate._id.slice(-4).toUpperCase()}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                                Win Rate: {winRate}%
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                                Matches: {totalMatches}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-slate-800 tracking-tighter">{score}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Score</div>
                      </div>
                    </div>

                    {/* Skill Radar Chart */}
                    <div className="w-full h-[220px] bg-slate-50 rounded-2xl border border-slate-100 mb-6 p-2 relative overflow-hidden">
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                              <Radar 
                                name="Skills" 
                                dataKey="score" 
                                stroke={idx === 0 ? "#3b82f6" : "#a855f7"} 
                                strokeWidth={2} 
                                fill={idx === 0 ? "#3b82f6" : "#a855f7"} 
                                fillOpacity={0.3} 
                              />
                          </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Strengths & Weaknesses Snapshot */}
                    <div className="flex-1 space-y-4 mb-8">
                       <div>
                         <div className="flex items-center gap-2 mb-2">
                           <Sparkles className="w-4 h-4 text-emerald-500" />
                           <h4 className="text-sm font-bold text-slate-700">Top Strengths</h4>
                         </div>
                         <ul className="space-y-1.5">
                           {safeProp(candidate, ['aiReport', 'recruiter_report', 'strengths'], []).slice(0, 2).map((s: string, i: number) => (
                             <li key={i} className="text-sm text-slate-600 font-medium leading-snug pl-3 border-l-2 border-emerald-200">{s}</li>
                           ))}
                         </ul>
                       </div>

                       <div>
                         <div className="flex items-center gap-2 mb-2">
                           <ShieldAlert className="w-4 h-4 text-rose-500" />
                           <h4 className="text-sm font-bold text-slate-700">Areas of Concern</h4>
                         </div>
                         <ul className="space-y-1.5">
                           {safeProp(candidate, ['aiReport', 'recruiter_report', 'weaknesses'], []).slice(0, 2).map((w: string, i: number) => (
                             <li key={i} className="text-sm text-slate-600 font-medium leading-snug pl-3 border-l-2 border-rose-200">{w}</li>
                           ))}
                         </ul>
                       </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <Button 
                        onClick={() => handleVote(candidate, otherCandidate)}
                        disabled={voting}
                        className={`w-full h-14 text-base font-bold shadow-md transition-all ${
                          isWinner ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 ring-4 ring-emerald-100" : 
                          isLoser ? "bg-slate-100 text-slate-400 hover:bg-slate-100 shadow-none border border-slate-200" :
                          idx === 0 ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:-translate-y-1" :
                          "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 hover:-translate-y-1"
                        }`}
                      >
                        {isWinner ? (
                          <span className="flex items-center justify-center gap-2">
                            <Trophy className="w-5 h-5" /> Winner Chosen
                          </span>
                        ) : voting && !winnerId ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          "Vote as Better Resume"
                        )}
                      </Button>
                    </div>

                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
