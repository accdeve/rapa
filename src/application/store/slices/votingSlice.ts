import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Vote, OpinionGroup, VotingResult } from '@/domain/models';
import { votingService } from '@/domain/services';

interface VotingState {
  votes: Vote[];
  groups: OpinionGroup[];
  results: VotingResult[];
  hasVoted: boolean;
  selectedGroupId: string | null;
}

const initialState: VotingState = {
  votes: [],
  groups: [],
  results: [],
  hasVoted: false,
  selectedGroupId: null,
};

const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    setVotes(state, action: PayloadAction<Vote[]>) {
      state.votes = action.payload;
    },
    addVote(state, action: PayloadAction<Vote>) {
      state.votes.push(action.payload);
    },
    setGroups(state, action: PayloadAction<OpinionGroup[]>) {
      state.groups = action.payload;
    },
    setResults(state, action: PayloadAction<VotingResult[]>) {
      state.results = action.payload;
    },
    setHasVoted(state, action: PayloadAction<boolean>) {
      state.hasVoted = action.payload;
    },
    setSelectedGroup(state, action: PayloadAction<string | null>) {
      state.selectedGroupId = action.payload;
    },
    computeResults(state) {
      const groupIds = state.groups.map((g) => g.id);
      const counts = votingService.countVotes(state.votes, groupIds);
      const percentages = votingService.calculatePercentages(counts, state.votes.length);

      state.results = state.groups.map((group) => ({
        groupId: group.id,
        groupName: group.name,
        voteCount: counts.get(group.id) ?? 0,
        percentage: percentages.get(group.id) ?? 0,
      })).sort((a, b) => b.voteCount - a.voteCount);
    },
    resetVoting(state) {
      state.votes = [];
      state.results = [];
      state.hasVoted = false;
      state.selectedGroupId = null;
    },
  },
});

export const {
  setVotes,
  addVote,
  setGroups,
  setResults,
  setHasVoted,
  setSelectedGroup,
  computeResults,
  resetVoting,
} = votingSlice.actions;

export default votingSlice.reducer;

export const selectVotes = (state: { voting: VotingState }) => state.voting.votes;
export const selectGroups = (state: { voting: VotingState }) => state.voting.groups;
export const selectResults = (state: { voting: VotingState }) => state.voting.results;
export const selectHasVoted = (state: { voting: VotingState }) => state.voting.hasVoted;
export const selectSelectedGroup = (state: { voting: VotingState }) => state.voting.selectedGroupId;