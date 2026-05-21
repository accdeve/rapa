import type { BaseEntity, QuestionStatus, SessionPhase } from './common';

export interface Question extends BaseEntity {
  roomId: string;
  content: string;
  status: QuestionStatus;
  sessionOrder: number;
}

export interface QuestionWithOpinions extends Question {
  opinions: string[];
}