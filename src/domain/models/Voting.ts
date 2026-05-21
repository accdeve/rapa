import type { BaseEntity } from './common';

export interface Opinion extends BaseEntity {
  questionId: string;
  participantId: string;
  content: string;
}

export interface OpinionGroup extends BaseEntity {
  questionId: string;
  name: string;
  color: string;
  sessionOrder: number;
}

export interface Vote extends BaseEntity {
  questionId: string;
  participantId: string;
  groupId: string;
}

export interface VotingResult {
  groupId: string;
  groupName: string;
  voteCount: number;
  percentage: number;
}