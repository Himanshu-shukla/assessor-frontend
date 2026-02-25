"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;;

export default function TestPage() {
  const router = useRouter();

  const { test, uploadId, setResults } = useStore();
  const { setQuestions, setAnswer, nextQuestion, questions, currentQuestionIndex, answers } = test;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch Real Questions from Backend
  useEffect(() => {
    if (!uploadId) {
      router.push("/"); // Kick user back if no assessment is active
      return;
    }

    const fetchQuestions = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/test/${uploadId}/questions`);
        setQuestions(data.questions);
      } catch (err) {
        setError("Failed to load questions.");
      }
    };

    fetchQuestions();
  }, [uploadId, setQuestions, router]);

  const currentQ = questions[currentQuestionIndex];
  const isLast = currentQuestionIndex === questions.length - 1;

  const handleNext = async () => {
    if (isLast) {
      setSubmitting(true);
      try {
        // Submit real answers to backend
        const { data } = await axios.post(`${API_URL}/test/${uploadId}/submit`, { answers });

        // Save score to Zustand and go to results
        setResults(data);
        router.push("/results");
      } catch (err) {
        setSubmitting(false);
        setError("Failed to submit test.");
      }
    } else {
      nextQuestion();
    }
  };

  if (error) return <div className="min-h-screen bg-neutral-950 flex justify-center items-center text-red-500">{error}</div>;
  if (!currentQ) return <div className="min-h-screen bg-neutral-950 flex justify-center items-center text-white">Loading test...</div>;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full bg-neutral-900 border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-800 pb-4">
          <CardTitle className="text-white">Technical Assessment</CardTitle>
          <div className="text-blue-500 font-mono text-xl">29:59</div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            {/* Added a Skill Badge dynamically fetched from backend */}
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-500/20">
              {currentQ.skill}
            </span>
          </div>

          <h2 className="text-xl font-medium text-white">{currentQ.text}</h2>

          <div className="space-y-3">
            {currentQ.options.map((opt: any) => (
              <label key={opt.id} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${answers[currentQuestionIndex] === opt.id ? "bg-blue-600/20 border-blue-500" : "border-neutral-700 hover:bg-neutral-800"}`}>
                <input
                  type="radio"
                  name="answer"
                  value={opt.id}
                  checked={answers[currentQuestionIndex] === opt.id}
                  onChange={() => setAnswer(currentQuestionIndex, opt.id)}
                  className="mr-3 w-4 h-4 text-blue-600 bg-neutral-900 border-neutral-600 focus:ring-blue-600"
                />
                <span className="text-neutral-200">{opt.text}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleNext} disabled={!answers[currentQuestionIndex] || submitting} className="bg-white text-black hover:bg-neutral-200">
              {isLast ? (submitting ? "Analyzing..." : "Submit & Get Rank") : "Next Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}