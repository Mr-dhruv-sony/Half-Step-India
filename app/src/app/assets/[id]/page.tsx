import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";
import AssetTrendChart from "@/components/AssetTrendChart";

export const dynamic = "force-dynamic";

interface AssetDetailPageProps {
  params: { id: string };
}

async function getAsset(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      department: true,
      reports: {
        include: { reporter: { select: { name: true } } },
        orderBy: { reportedAt: "desc" },
      },
    },
  });
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const asset = await getAsset(params.id);

  if (!asset) {
    notFound();
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    under_maintenance: "bg-yellow-100 text-yellow-800",
    decommissioned: "bg-red-100 text-red-800",
  };

  const trendData = [...asset.reports]
    .reverse()
    .map((report) => ({
      id: report.id,
      score: report.score,
      reportedAt: report.reportedAt.toISOString(),
      reporterName: report.reporter?.name || "Unknown",
    }));

  return (
    <div>
      <header className="mb-8">
        <Link
          href="/assets"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 inline-block"
        >
          ← Back to Assets
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {asset.name}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Asset Code: {asset.assetCode}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Asset Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-500">Type</p>
                <p className="font-medium text-zinc-900 dark:text-white capitalize">
                  {asset.assetType.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Department</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {asset.department?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    statusColors[asset.status]
                  }`}
                >
                  {asset.status.replace("_", " ")}
                </span>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Install Date</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {asset.installDate
                    ? new Date(asset.installDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">State</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {asset.stateCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">District</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {asset.districtCode}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-zinc-500">Address</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {asset.address}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Score Trend
                </h2>
                <p className="text-sm text-zinc-500">
                  Historical condition movement for this asset.
                </p>
              </div>
              <span className="text-xs text-zinc-500">
                {trendData.length} reports
              </span>
            </div>
            <AssetTrendChart data={trendData} />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Report History
              </h2>
              <Link
                href={`/assets/${asset.id}/report`}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                + New Report
              </Link>
            </div>

            {asset.reports.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">
                No reports yet. Submit the first report.
              </p>
            ) : (
              <ul className="space-y-3">
                {asset.reports.map((report) => (
                  <li
                    key={report.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-lg font-bold"
                            style={{ color: getScoreColor(report.score) }}
                          >
                            {report.score.toFixed(1)}
                          </span>
                          <span className="text-sm text-zinc-500">
                            {getScoreLabel(report.score)}
                          </span>
                        </div>
                        {report.notes && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            {report.notes}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 mt-2">
                          By {report.reporter?.name || "Unknown"} on{" "}
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {report.previousScore !== null && (
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Previous</p>
                          <p className="font-medium">{report.previousScore.toFixed(1)}</p>
                          {report.scoreDelta && (
                            <span
                              className={`text-xs ${
                                report.scoreDelta < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {report.scoreDelta > 0 ? "+" : ""}
                              {report.scoreDelta.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
            <p className="text-sm text-zinc-500 mb-2">Current Score</p>
            <div
              className="text-5xl font-bold mb-2"
              style={{
                color: asset.currentScore
                  ? getScoreColor(asset.currentScore)
                  : "#9ca3af",
              }}
            >
              {asset.currentScore?.toFixed(1) || "-"}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {asset.currentScore ? getScoreLabel(asset.currentScore) : "No score recorded"}
            </p>
            {asset.lastReportedAt && (
              <p className="text-xs text-zinc-500 mt-2">
                Last reported: {new Date(asset.lastReportedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-medium text-zinc-900 dark:text-white mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href={`/assets/${asset.id}/report`}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
