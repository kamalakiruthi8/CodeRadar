export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export interface CommitDetail {
  sha: string;
  message: string;
  date: string;
  repoName: string;
  url: string;
}

export interface PrDetail {
  id: number;
  title: string;
  repoName: string;
  date: string;
  url: string;
  state: "merged" | "closed";
}

export interface OrgDetail {
  name: string;
  description: string;
  avatarUrl: string;
  url: string;
}

export interface LanguageDetail {
  name: string;
  percentage: number;
  color: string;
  repoCount: number;
  totalBytes?: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number; // 0 (none) to 4 (maximum)
  dayName: string; // e.g. "Mon"
  monthName: string; // e.g. "Jul"
}

export interface GitHubProfile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  location: string;
  company: string;
  createdAt: string;
  commitsCount: number;
  prsCount: number;
  orgsCount: number;
  languagesCount: number;
  languages: LanguageStat[];
  cubeGrid: number[][]; // 5x5 grid for the 3D contribution cube heights
  heatmapData: HeatmapDay[];
  commitsList?: CommitDetail[];
  prsList?: PrDetail[];
  orgsList?: OrgDetail[];
  languagesList?: LanguageDetail[];
  reposList?: RepoDetail[];
  isRealProfile?: boolean;
}

export interface RepoDetail {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
  contributionsCount: number;
}

export interface SavedRepo {
  id: string;
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  savedAt: string;
}

export interface AnalyticsHistoryEntry {
  id: string;
  timestamp: string;
  targetUser: string;
  commitsCount: number;
  prsCount: number;
  languagesCount: number;
}

export interface UserAccount {
  email: string;
  username: string;
  githubUsername: string | null;
  savedRepos: SavedRepo[];
  analyticsHistory: AnalyticsHistoryEntry[];
  avatarSeed: string; // seed for identicon
  createdAt: string;
}

export type AppTheme = "cyan" | "pink" | "green";


