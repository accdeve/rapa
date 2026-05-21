import type { IVotingService } from '@/domain/interfaces';

export class VotingService implements IVotingService {
  countVotes(votes: { groupId: string }[], groupIds: string[]): Map<string, number> {
    const counts = new Map<string, number>();

    for (const id of groupIds) {
      counts.set(id, 0);
    }

    for (const vote of votes) {
      const current = counts.get(vote.groupId) ?? 0;
      counts.set(vote.groupId, current + 1);
    }

    return counts;
  }

  calculatePercentages(counts: Map<string, number>, total: number): Map<string, number> {
    const percentages = new Map<string, number>();

    if (total === 0) {
      counts.forEach((_, key) => percentages.set(key, 0));
      return percentages;
    }

    counts.forEach((count, key) => {
      percentages.set(key, (count / total) * 100);
    });

    return percentages;
  }

  getWinner(
    groupVotes: Map<string, number>,
    groupNames: Map<string, string>
  ): { groupId: string; groupName: string; count: number } | null {
    let maxCount = 0;
    let winnerId: string | null = null;

    groupVotes.forEach((count, groupId) => {
      if (count > maxCount) {
        maxCount = count;
        winnerId = groupId;
      }
    });

    if (winnerId === null) return null;

    const groupName = groupNames.get(winnerId) ?? 'Unknown';
    return { groupId: winnerId, groupName, count: maxCount };
  }

  hasTie(groupVotes: Map<string, number>): boolean {
    if (groupVotes.size < 2) return false;

    const counts = Array.from(groupVotes.values()).sort((a, b) => b - a);
    return counts[0] === counts[1];
  }

  sortResults(groupVotes: Map<string, number>): string[] {
    return Array.from(groupVotes.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);
  }
}

export const votingService = new VotingService();