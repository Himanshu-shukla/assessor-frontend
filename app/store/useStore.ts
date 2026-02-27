import { create } from "zustand";

interface Question {
  id: string;
  skill: string;
  text: string;
  options: { id: string; text: string }[];
}

interface TestState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  setQuestions: (questions: Question[]) => void;
  setAnswer: (index: number, answerId: string) => void;
  nextQuestion: () => void;
}

interface Results {
  score: number;
  percentile: number;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

interface User {
  name: string;
  email: string;
}

interface Store {
  // Upload
  uploadStatus: "idle" | "uploading" | "parsing" | "ready";
  uploadId: string | null;
  setUploadStatus: (status: "idle" | "uploading" | "parsing" | "ready") => void;
  setUploadId: (id: string) => void;
  
  // Test
  test: TestState;
  setQuestions: (questions: Question[]) => void;
  setAnswer: (index: number, answerId: string) => void;
  nextQuestion: () => void;
  
  // Results
  results: Results | null;
  setResults: (results: Results) => void;
  
  // User
  user: User | null;
  setUser: (user: User) => void;
}

const createTestSlice = (set: any): TestState => ({
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  setQuestions: (questions) => set((state: Store) => ({
    test: { ...state.test, questions, currentQuestionIndex: 0, answers: {} }
  })),
  setAnswer: (index, answerId) => set((state: Store) => ({
    test: {
      ...state.test,
      answers: { ...state.test.answers, [index]: answerId }
    }
  })),
  nextQuestion: () => set((state: Store) => ({
    test: {
      ...state.test,
      currentQuestionIndex: Math.min(
        state.test.currentQuestionIndex + 1,
        state.test.questions.length - 1
      )
    }
  })),
});

export const useStore = create<Store>((set) => ({
  // Upload
  uploadStatus: "idle",
  uploadId: null,
  setUploadStatus: (status) => set({ uploadStatus: status }),
  setUploadId: (id) => set({ uploadId: id }),
  
  // Test
  test: createTestSlice(set),
  setQuestions: (questions) => set((state) => ({
    test: { ...state.test, questions, currentQuestionIndex: 0, answers: {} }
  })),
  setAnswer: (index, answerId) => set((state) => ({
    test: {
      ...state.test,
      answers: { ...state.test.answers, [index]: answerId }
    }
  })),
  nextQuestion: () => set((state) => ({
    test: {
      ...state.test,
      currentQuestionIndex: Math.min(
        state.test.currentQuestionIndex + 1,
        state.test.questions.length - 1
      )
    }
  })),
  
  // Results
  results: null,
  setResults: (results) => set({ results }),
  
  // User
  user: null,
  setUser: (user) => set({ user }),
}));