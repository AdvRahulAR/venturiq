export enum Sector {
  SAAS = "SaaS",
  CONSUMER = "Consumer",
  FINTECH = "Fintech",
  HEALTHTECH = "Healthtech",
  CLIMATE_EV = "Climate/EV",
  DEEPTECH_AI = "Deeptech/AI",
  OTHER = "Other",
}

export enum Geography {
  INDIA = "India",
  GLOBAL = "Global",
  SEA = "SEA",
  US = "US",
  EU = "EU",
}

export enum Stage {
  PRE_SEED = "Pre-seed",
  SEED = "Seed",
  SERIES_A = "Series A",
  SERIES_B_PLUS = "Series B+",
}

export enum Recommendation {
  INVEST = "Invest",
  WATCHLIST = "Watchlist",
  PASS = "Pass",
}

export interface Weightages {
  team: number;
  market: number;
  product: number;
  traction: number;
  unitEconomics: number;
  risks: number; // Negative value
}

export interface AnalysisInput {
  companyName: string;
  sector: Sector;
  geography: Geography;
  stage: Stage;
  pitchDeckFile?: {
      name: string;
      mimeType: string;
      data: string; // base64 encoded
  };
  founderNotes: string;
  publicUrls: string;
  weightages: Weightages;
  investorProfile: string;
}

export interface GeminiScore {
  score: number;
  reasoning: string;
}

export interface GeminiRisk {
  risk: string;
  severity: "High" | "Medium" | "Low";
  mitigation: string;
}

export interface GeminiMetrics {
  TAM: string;
  SAM: string;
  SOM: string;
  [key: string]: string;
}

export interface GeminiAnalysisResult {
  executiveSummary: string;
  scores: {
    team: GeminiScore;
    market: GeminiScore;
    product: GeminiScore;
    traction: GeminiScore;
    unitEconomics: GeminiScore;
  };
  keyRisks: GeminiRisk[];
  // FIX: Allow investmentThesis to be a string or an array of strings to match potential API responses.
  investmentThesis: string | string[];
  benchmarkComparison: string;
  metricsSnapshot: GeminiMetrics;
  dataGaps: string[];
  followUpQuestions: string[];
  confidence: "High" | "Medium" | "Low";
}

export interface Analysis {
  id: string;
  timestamp: number;
  companyName: string;
  sector: Sector;
  geography: Geography;
  stage: Stage;
  score: number;
  recommendation: Recommendation;
  confidence: "High" | "Medium" | "Low";
  fullAnalysis: GeminiAnalysisResult;
  groundingSources?: { uri: string; title: string }[];
  investorProfile?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    sources?: { uri: string; title: string }[];
}