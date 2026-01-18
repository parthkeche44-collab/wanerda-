
export enum Verdict {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  MISLEADING = 'MISLEADING',
  UNVERIFIED = 'UNVERIFIED',
  PARTS_TRUE = 'PARTIALLY TRUE'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface FactCheckResult {
  id: string;
  claim: string;
  verdict: Verdict;
  credibilityScore: number; // 0 to 100
  analysis: string;
  sources: GroundingSource[];
  timestamp: number;
}

export interface AppState {
  history: FactCheckResult[];
  isAnalyzing: boolean;
  error: string | null;
  currentResult: FactCheckResult | null;
}
