import { create } from 'zustand';

interface AppState {
  user: any | null;
  setUser: (user: any) => void;
  
  uploadStatus: 'idle' | 'uploading' | 'parsing' | 'ready';
  setUploadStatus: (status: 'idle' | 'uploading' | 'parsing' | 'ready') => void;
  uploadId: string | null;
  setUploadId: (id: string) => void;

  test: {
    questions: any[];
    currentQuestionIndex: number;
    answers: Record<number, string>;
    timeRemaining: number;
    setQuestions: (q: any[]) => void;
    setAnswer: (index: number, answer: string) => void;
    nextQuestion: () => void;
    resetTest: () => void;
  };

  results: any | null;
  setResults: (res: any) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  uploadStatus: 'idle',
  setUploadStatus: (status) => set({ uploadStatus: status }),
  uploadId: null,
  setUploadId: (id) => set({ uploadId: id }),

  test: {
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 1800, // 30 mins
    setQuestions: (questions) => set((state) => ({ test: { ...state.test, questions } })),
    setAnswer: (index, answer) => set((state) => ({
      test: { ...state.test, answers: { ...state.test.answers, [index]: answer } }
    })),
    nextQuestion: () => set((state) => ({
      test: { ...state.test, currentQuestionIndex: state.test.currentQuestionIndex + 1 }
    })),
    resetTest: () => set((state) => ({ 
      test: { 
        ...state.test, 
        questions: [], 
        currentQuestionIndex: 0, 
        answers: {}, 
        timeRemaining: 1800 
      } 
    })),
  },

  results: null,
  setResults: (results) => set({ results }),
}));