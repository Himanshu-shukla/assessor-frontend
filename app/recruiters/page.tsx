"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Loader2, UploadCloud, Users, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useStore } from "@/store/useStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function RecruitersPage() {
  const router = useRouter();
  const { sessionId, initSession } = useStore();
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "done">("idle");
  const [results, setResults] = useState<any[]>([]);
  const [jobIds, setJobIds] = useState<string[]>([]);
  
  useEffect(() => { initSession(); }, [initSession]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] }
  });

  const handleProcess = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatus("uploading");
    
    try {
      // 1. Upload files in concurrent chunks
      const assessmentIds: string[] = [];
      const CHUNK_SIZE = 20; // 20 concurrent uploads to prevent browser timeout
      
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        
        const chunkPromises = chunk.map(async (file) => {
          const formData = new FormData();
          formData.append("resume", file);
          const { data } = await axios.post(`${API_URL}/upload`, formData, {
            headers: { "x-session-id": sessionId || "" },
          });
          return data.assessmentId as string;
        });

        const chunkIds = await Promise.all(chunkPromises);
        assessmentIds.push(...chunkIds);
        
        setProgress(Math.round(((i + chunk.length) / files.length) * 50)); // First 50% is uploading
      }

      // 2. Submit to Batch Analysis API
      setStatus("analyzing");
      setProgress(50);
      const batchRes = await axios.post(`${API_URL}/analysis/batch`, { 
        assessmentIds,
        jobDescription: jobDescription.trim() || undefined
      });
      const currentJobIds = batchRes.data.jobIds;
      setJobIds(currentJobIds);

      // 3. Poll for completion
      pollBatchStatus(currentJobIds, assessmentIds);
      
    } catch (error) {
      console.error(error);
      setUploading(false);
      setStatus("idle");
      alert("An error occurred during bulk upload.");
    }
  };

  const pollBatchStatus = (jobs: string[], assessmentIds: string[]) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.post(`${API_URL}/analysis/batch/status`, { jobIds: jobs });
        
        const completed = data.statuses.filter((s: any) => s.state === "completed" || s.state === "failed");
        const progressPct = 50 + Math.round((completed.length / jobs.length) * 50);
        setProgress(progressPct);

        if (completed.length === jobs.length) {
          clearInterval(interval);
          setStatus("done");
          fetchFinalResults(assessmentIds);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  const fetchFinalResults = async (assessmentIds: string[]) => {
    try {
      const allResults = await Promise.all(
        assessmentIds.map(async (id) => {
          const res = await axios.get(`${API_URL}/analysis/${id}`);
          return { id, ...res.data };
        })
      );
      
      // Sort by score descending
      allResults.sort((a, b) => (b.report?.total_score || 0) - (a.report?.total_score || 0));
      setResults(allResults);
      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Users className="text-blue-600" /> Recruiter Hub: Bulk Screening
            </h1>
            <p className="text-sm text-slate-500 mt-1">Upload multiple resumes to instantly rank candidates.</p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* State: Idle / Uploading / Analyzing */}
        {status !== "done" && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            
            {uploading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <h3 className="text-xl font-bold text-slate-700">
                  {status === "uploading" ? "Uploading Resumes..." : "AI agents are screening candidates..."}
                </h3>
                <div className="w-full max-w-md">
                  <Progress value={progress} className="h-3" />
                  <p className="text-center text-slate-500 font-medium mt-2 text-sm">{progress}% - Server Processing</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"}`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-bold text-slate-700">Drag & Drop Multiple Resumes (PDF)</p>
                  <p className="text-slate-500 text-sm mt-2">Maximum 5MB per file</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Target Job Description (Optional)
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-sm outline-none resize-none"
                    placeholder="Paste the job description here... Our AI will rank the candidates strictly against these requirements!"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                {files.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-700 text-sm">Selected Files ({files.length})</h4>
                      <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-red-500 h-7 text-xs">Clear All</Button>
                    </div>
                    <ul className="max-h-32 overflow-y-auto text-xs text-slate-600 space-y-1">
                      {files.map((file, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> {file.name}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={handleProcess} 
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 font-bold shadow-md"
                    >
                      Start AI Screening 🚀
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* State: Done (Results) */}
        {status === "done" && results.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-800">Candidate Leaderboard</h2>
              <Button onClick={() => { setStatus("idle"); setFiles([]); setResults([]); }} variant="outline">
                New Bulk Upload
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Rank</th>
                    <th className="px-6 py-4 font-semibold">Candidate Ref</th>
                    <th className="px-6 py-4 font-semibold">Total Score</th>
                    <th className="px-6 py-4 font-semibold">Recommendation</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((res, index) => {
                    const score = res.report?.total_score || 0;
                    const recommendation = res.report?.recruiter_report?.recommendation || "Needs Review";
                    
                    return (
                      <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-black">
                          {index === 0 ? <span className="text-amber-500 text-lg">#1 🏆</span> : <span className="text-slate-500">#{index + 1}</span>}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          ID: {res.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                              {score}/100
                            </span>
                            <Progress value={score} className="w-24 h-2 bg-slate-200 [&>div]:bg-blue-500" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            recommendation.toLowerCase().includes('strong') || recommendation.toLowerCase().includes('hire') 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : recommendation.toLowerCase().includes('reject')
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {recommendation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-xs font-bold"
                            onClick={() => window.open(`/analysis/${res.id}`, '_blank')}
                          >
                            View Full Report ↗
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
