export type Status = 'idle' | 'loading' | 'parsing' | 'done' | 'error';

export type ParsedStats = {
  followersCount: number;
  followingCount: number;
  skipCount: number;
  sourceNote: string;
  usedFollowersFiles: string[];
  usedFollowingFiles: string[];
  usedBlockedFiles: string[];
  usedRestrictedFiles: string[];
};

export type AnalysisResults = {
  following: string[];
  followers: string[];
  unfollowers: string[];
  fans: string[];
  mutuals: string[];
  blocked: string[];
  restricted: string[];
};

export type AnalysisOutput = {
  stats: ParsedStats;
  results: AnalysisResults;
  fileList: string[];
};

export const EMPTY_STATS: ParsedStats = {
  followersCount: 0,
  followingCount: 0,
  skipCount: 0,
  sourceNote: '',
  usedFollowersFiles: [],
  usedFollowingFiles: [],
  usedBlockedFiles: [],
  usedRestrictedFiles: []
};

export const EMPTY_RESULTS: AnalysisResults = {
  following: [],
  followers: [],
  unfollowers: [],
  fans: [],
  mutuals: [],
  blocked: [],
  restricted: []
};
