import type { RoomParticipant, SessionPhase } from '@/domain/models';
import type { ISessionService } from '@/domain/interfaces';

export class SessionService implements ISessionService {
  createParticipant(roomId: string, avatarSeed: string): RoomParticipant {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      roomId,
      avatarSeed,
      isMuted: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  canStartSession(participantCount: number, minRequired: number): boolean {
    return participantCount >= minRequired;
  }

  calculatePhaseProgress(phase: SessionPhase, elapsedTime: number): number {
    const phaseDurations: Record<SessionPhase, number> = {
      waiting: 300000,
      input: 180000,
      grouping: 120000,
      voting: 60000,
      results: 0,
    };

    const duration = phaseDurations[phase];
    if (duration === 0) return 100;

    return Math.min(100, (elapsedTime / duration) * 100);
  }

  getNextPhase(current: SessionPhase): SessionPhase {
    const phaseOrder: SessionPhase[] = ['waiting', 'input', 'grouping', 'voting', 'results'];
    const currentIndex = phaseOrder.indexOf(current);
    const nextIndex = Math.min(currentIndex + 1, phaseOrder.length - 1);
    return phaseOrder[nextIndex];
  }
}

export const sessionService = new SessionService();