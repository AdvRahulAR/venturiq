
import { GeminiAnalysisResult, Weightages, Recommendation } from '../types';

export const calculateScore = (analysis: GeminiAnalysisResult, weightages: Weightages): number => {
  let totalScore = 0;
  totalScore += (analysis.scores.team.score * weightages.team) / 100;
  totalScore += (analysis.scores.market.score * weightages.market) / 100;
  totalScore += (analysis.scores.product.score * weightages.product) / 100;
  totalScore += (analysis.scores.traction.score * weightages.traction) / 100;
  totalScore += (analysis.scores.unitEconomics.score * weightages.unitEconomics) / 100;
  
  // Apply risk penalty
  const riskPenalty = analysis.keyRisks.reduce((penalty, risk) => {
      if (risk.severity === "High") return penalty + 5;
      if (risk.severity === "Medium") return penalty + 2;
      return penalty;
  }, 0);

  totalScore -= riskPenalty;

  return Math.max(0, Math.min(100, Math.round(totalScore)));
};

export const getRecommendation = (score: number, confidence: "High" | "Medium" | "Low"): Recommendation => {
    if (score >= 70 && confidence !== "Low") {
        return Recommendation.INVEST;
    } else if (score >= 50) {
        return Recommendation.WATCHLIST;
    } else {
        return Recommendation.PASS;
    }
};
