import { create } from 'zustand';

// ─── Session ID helpers ───────────────────────────────────────────────────────
const SESSION_KEY = 'sr_session_id';

function generateSessionId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusable chars (0/O, 1/I)
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = generateSessionId();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

export function setSessionId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, id.toUpperCase().trim());
}

interface AppState {
  user: any | null;
  setUser: (user: any) => void;

  uploadStatus: 'idle' | 'uploading' | 'parsing' | 'ready';
  setUploadStatus: (status: 'idle' | 'uploading' | 'parsing' | 'ready') => void;
  uploadId: string | null;
  setUploadId: (id: string) => void;

  sessionId: string;
  initSession: () => void;
  updateSessionId: (id: string) => void;

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

  sessionId: '',
  initSession: () => set({ sessionId: getOrCreateSessionId() }),
  updateSessionId: (id: string) => {
    setSessionId(id);
    set({ sessionId: id.toUpperCase().trim() });
  },

  test: {
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 1800,
    setQuestions: (questions) =>
      set((state) => ({
        test: { ...state.test, questions, currentQuestionIndex: 0, answers: {} },
      })),
    setAnswer: (index, answer) => set((state) => ({
      test: { ...state.test, answers: { ...state.test.answers, [index]: answer } }
    })),
    nextQuestion: () => set((state) => ({
      test: { ...state.test, currentQuestionIndex: state.test.currentQuestionIndex + 1 }
    })),
    resetTest: () => set((state) => ({
      test: { ...state.test, questions: [], currentQuestionIndex: 0, answers: {}, timeRemaining: 1800 }
    })),
  },

  results: null,
  setResults: (results) => set({ results }),
}));