
export interface Song {
  id: string;
  rank: number;
  title: string;
  artist: string;
  genre: string;
  popularityScore: number;
  dailyStreams: number;
  trend: 'up' | 'down' | 'steady';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalyticsData {
  songs: Song[];
  sources: GroundingSource[];
  summary: string;
  lastUpdated: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  ERROR = 'ERROR'
}
