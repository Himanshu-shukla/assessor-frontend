"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import { useStore } from "@/store/useStore";
import axios from "axios";

const API_URL = "https://assessor-backend-h64l.onrender.com";

export default function Home() {
  const router = useRouter();
  const { uploadStatus, setUploadStatus, setUploadId, setUser } = useStore();
  const [progress, setProgress] = useState(0);

  // The Real Polling Logic
  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/status/${id}`);
        
        if (data.status === 'parsing') {
          setProgress(60); // Update visually
        }
        
        if (data.ready) {
          setProgress(100);
          setUploadStatus("ready");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error polling status", err);
        clearInterval(interval);
      }
    }, 2000); // Check every 2 seconds
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setUploadStatus("uploading");
    setProgress(10);
    
    try {
      // Create form data payload
      const formData = new FormData();
      formData.append("resume", acceptedFiles[0]);
      
      // Upload to Fastify server
      const { data } = await axios.post(`${API_URL}/upload`, formData);
      
      setUploadId(data.uploadId);
      setProgress(30);
      setUploadStatus("parsing");
      
      // Start checking if the worker is done
      pollStatus(data.uploadId);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadStatus("idle");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleOAuthLogin = () => {
    // In production, trigger Google OAuth. For MVP, we mock the user context.
    setUser({ name: "Developer", email: "dev@example.com" });
    router.push("/test");
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            How good is your tech stack, <span className="text-blue-500">really?</span>
          </h1>
          <p className="text-lg text-neutral-400">
            Upload your resume. Our AI extracts your core skills, generates a dynamic 10-question test, and ranks you against 10,000+ developers.
          </p>
        </div>

        <Card className="bg-neutral-900 border-neutral-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Get Your Market Ranking</CardTitle>
            <CardDescription className="text-neutral-400">PDFs only. Max 5MB.</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus === "idle" && (
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-neutral-700 hover:border-neutral-500"}`}>
                <input {...getInputProps()} />
                <UploadCloud className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-300 font-medium">Drag & drop your resume here</p>
              </div>
            )}

            {(uploadStatus === "uploading" || uploadStatus === "parsing") && (
              <div className="space-y-6 py-12">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-neutral-300 font-medium">
                    {uploadStatus === "uploading" ? "Uploading securely..." : "AI is analyzing your stack & generating your test..."}
                  </p>
                  <Progress value={progress} className="h-2 w-full bg-neutral-800" />
                </div>
              </div>
            )}

            {uploadStatus === "ready" && (
              <div className="space-y-6 py-8">
                <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Your custom analysis is ready.</h3>
                <p className="text-neutral-400 text-sm pb-4">Unlock your dynamic test to see your market percentile.</p>
                <Button onClick={handleOAuthLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg">
                  Sign in with Google to Start <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}