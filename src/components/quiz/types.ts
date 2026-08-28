export interface PerQuestionResult {
  questionId: string;
  correct: boolean;
  correctOptionIds: string[];
  explanation: string;
}

export interface QuizSubmitResponse {
  scorePct: number;
  passed: boolean;
  perfect: boolean;
  xpAwarded: { type: string; amount: number }[];
  perQuestionResult: PerQuestionResult[];
}
