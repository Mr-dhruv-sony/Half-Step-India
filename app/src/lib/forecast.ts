import { AssetReport } from "@prisma/client";

export interface ForecastResult {
  projectedScore90d: number | null;
  dailyDeclineRate: number;
  riskLevel: "stable" | "watch" | "high";
}

function clampScore(score: number) {
  return Math.max(0, Math.min(2, score));
}

export function forecastAssetRisk(
  currentScore: number | null,
  reports: Pick<AssetReport, "score" | "reportedAt">[]
): ForecastResult {
  if (currentScore === null || reports.length < 2) {
    return {
      projectedScore90d: null,
      dailyDeclineRate: 0,
      riskLevel: "stable",
    };
  }

  const sortedReports = [...reports].sort(
    (a, b) => a.reportedAt.getTime() - b.reportedAt.getTime()
  );
  const oldest = sortedReports[0];
  const newest = sortedReports[sortedReports.length - 1];
  const elapsedDays = Math.max(
    1,
    (newest.reportedAt.getTime() - oldest.reportedAt.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const scoreDrop = oldest.score - newest.score;
  const dailyDeclineRate = scoreDrop > 0 ? scoreDrop / elapsedDays : 0;

  if (dailyDeclineRate === 0) {
    return {
      projectedScore90d: clampScore(currentScore),
      dailyDeclineRate: 0,
      riskLevel: "stable",
    };
  }

  const projectedScore90d = clampScore(currentScore - dailyDeclineRate * 90);
  const riskLevel =
    projectedScore90d <= 0.5 ? "high" : projectedScore90d <= 1.0 ? "watch" : "stable";

  return {
    projectedScore90d,
    dailyDeclineRate,
    riskLevel,
  };
}
