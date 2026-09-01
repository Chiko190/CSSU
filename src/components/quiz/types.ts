import type { PublicHeartsState } from "@/core/progress/hearts";

export type { PublicHeartsState };

export interface AnswerResponse {
  correct: boolean;
  correctOptionIds: string[];
  explanation: string;
  hearts: PublicHeartsState;
  done: boolean;
}

export interface QuizSubmitResponse {
  scorePct: number;
  passed: boolean;
  perfect: boolean;
  xpAwarded: { type: string; amount: number }[];
}
