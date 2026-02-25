// results/page.tsx
"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, TrendingUp, AlertTriangle, Zap, Target } from "lucide-react";

export default function ResultsDashboard() {
  const { results } = useStore();
  
  const score = results?.score || 0;
  const percentile = results?.percentile || 0;
  
  // Fallback SWOT in case of direct navigation without test data
  const swot = results?.swotAnalysis || {
    strengths: ["Data unavailable. Please take the test."],
    weaknesses: ["Data unavailable."],
    opportunities: ["Data unavailable."],
    threats: ["Data unavailable."]
  };

  const shareRank = () => {
    const text = `I scored ${score}/100 and I'm in the top ${percentile}% of Devs on my stack!`;
    if (navigator.share) {
      navigator.share({ title: 'My Rank', text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Assessment Complete</h1>
            <p className="text-neutral-400 mt-1">Based on global profiles evaluated.</p>
          </div>
          <Button onClick={shareRank} variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10">
            <Share2 className="w-4 h-4 mr-2" /> Share My Rank
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-blue-900/20 to-neutral-900 border-blue-500/30">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 mb-4 px-4 py-1 text-sm">
              Technical Assessment
            </Badge>
            <h2 className="text-6xl font-black text-white mb-2">Top {100 - percentile}%</h2>
            <p className="text-xl text-neutral-300">You scored {score}/100 on your custom tech stack test.</p>
          </CardContent>
        </Card>

        {/* Dynamic SWOT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Strengths */}
          <Card className="bg-neutral-900 border-green-500/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="text-green-500 w-5 h-5" />
              <CardTitle className="text-green-500">Strengths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-neutral-300">
              {swot.strengths.length > 0 ? swot.strengths.map((item: string, i: number) => (
                <div key={i} className="bg-neutral-950 p-3 rounded-md border border-neutral-800 text-white">
                  {item}
                </div>
              )) : (
                <p className="text-neutral-500 italic">No clear strengths identified in this run.</p>
              )}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="bg-neutral-900 border-red-500/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="text-red-500 w-5 h-5" />
              <CardTitle className="text-red-500">Weaknesses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-neutral-300">
              {swot.weaknesses.length > 0 ? swot.weaknesses.map((item: string, i: number) => (
                <div key={i} className="bg-neutral-950 p-3 rounded-md border border-neutral-800 text-white">
                  {item}
                </div>
              )) : (
                <p className="text-neutral-500 italic">Solid performance across the board!</p>
              )}
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="bg-neutral-900 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <Zap className="text-yellow-500 w-5 h-5" />
              <CardTitle className="text-yellow-500">Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-300">
              {swot.opportunities.length > 0 ? swot.opportunities.map((item: string, i: number) => (
                <p key={i}>• {item}</p>
              )) : (
                <p className="text-neutral-500 italic">Focus on maintaining your current proficiency.</p>
              )}
            </CardContent>
          </Card>

          {/* Threats */}
          <Card className="bg-neutral-900 border-orange-500/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="text-orange-500 w-5 h-5" />
              <CardTitle className="text-orange-500">Threats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-300">
              {swot.threats.map((item: string, i: number) => (
                <p key={i}>• <span className="text-white font-medium">{item}</span></p>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}