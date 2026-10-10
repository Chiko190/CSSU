import type { PublicHeartsState } from "@/core/progress/hearts";
import type { PublicPointsState } from "@/core/progress/points";

export type { PublicHeartsState, PublicPointsState };

export interface AnswerResponse {
  correct: boolean;
  correctOptionIds: string[];
  explanation: string;
  hearts: PublicHeartsState;
  points: PublicPointsState;
  done: boolean;
}

export interface SkipResponse {
  correctOptionIds: string[];
  explanation: string;
  points: PublicPointsState;
  done: boolean;
}

export interface QuizSubmitResponse {
  scorePct: number;
  passed: boolean;
  perfect: boolean;
  xpAwarded: { type: string; amount: number }[];
  correctFirstTryIds: string[];
}
