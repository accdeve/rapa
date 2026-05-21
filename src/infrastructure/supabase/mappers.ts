import type { Room, RoomParticipant } from '@/domain/models/Room';
import type { Question } from '@/domain/models/Question';
import type { Vote } from '@/domain/models/Voting';
import type { CanvasItem } from '@/domain/models/Canvas';

export const mapRoomToDomain = (dbRoom: any): Room => {
  return {
    id: dbRoom.id,
    code: dbRoom.code,
    title: dbRoom.title,
    gmId: dbRoom.gm_id,
    sessionType: dbRoom.session_type,
    status: dbRoom.status,
    maxParticipants: dbRoom.max_participants,
    createdAt: new Date(dbRoom.created_at),
    updatedAt: new Date(dbRoom.updated_at),
  };
};

export const mapParticipantToDomain = (dbParticipant: any): RoomParticipant => {
  return {
    id: dbParticipant.id,
    roomId: dbParticipant.room_id,
    avatarSeed: dbParticipant.avatar_seed,
    isMuted: dbParticipant.is_muted,
    createdAt: new Date(dbParticipant.created_at),
    updatedAt: dbParticipant.updated_at ? new Date(dbParticipant.updated_at) : new Date(dbParticipant.created_at),
  };
};

export const mapQuestionToDomain = (dbQuestion: any): Question => {
  return {
    id: dbQuestion.id,
    roomId: dbQuestion.room_id,
    content: dbQuestion.content,
    status: dbQuestion.status,
    sessionOrder: dbQuestion.session_order || 0, // Fallback to 0 if not present in schema
    createdAt: new Date(dbQuestion.created_at),
    updatedAt: dbQuestion.updated_at ? new Date(dbQuestion.updated_at) : new Date(dbQuestion.created_at),
  };
};

export const mapVoteToDomain = (dbVote: any): Vote => {
  return {
    id: dbVote.id,
    questionId: dbVote.question_id,
    participantId: dbVote.participant_id,
    groupId: dbVote.group_id || '', // Fallback to empty string if not in schema
    createdAt: new Date(dbVote.created_at),
    updatedAt: dbVote.updated_at ? new Date(dbVote.updated_at) : new Date(dbVote.created_at),
  };
};

export const mapCanvasItemToDomain = (dbItem: any): CanvasItem => {
  return {
    id: dbItem.id,
    roomId: dbItem.room_id,
    type: dbItem.type,
    parentId: dbItem.parent_id,
    content: dbItem.content,
    color: dbItem.color,
    xPos: dbItem.x_pos,
    yPos: dbItem.y_pos,
    metadata: dbItem.metadata || {},
    createdAt: new Date(dbItem.created_at),
    updatedAt: new Date(dbItem.updated_at),
  };
};
