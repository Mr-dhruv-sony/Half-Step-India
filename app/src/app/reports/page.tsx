import { prisma } from "@/lib/db";
import Link from "next/link";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";

export const dynamic = "force-dynamic";

async function getReports() {
  return prisma.assetReport.findMany({
    include: {
      asset: { select: { name: true, assetCode: true } },
      reporter: { select: { name: true } },
    },
    orderBy: { reportedAt: "desc" },
    take: 100,
  });
}

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Reports
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          View all condition reports submitted
        </p>
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Asset
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Score
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Previous
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Change
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notes
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Reporter
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/assets/${report.assetId}`}
                        className="font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {report.asset.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{report.asset.assetCode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className="text-lg font-bold"
                        style={{ color: getScoreColor(report.score) }}
                      >
                        {report.score.toFixed(1)}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {getScoreLabel(report.score)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-700 dark:text-zinc-300">
                    {report.previousScore?.toFixed(1) || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {report.scoreDelta !== null ? (
                      <span
                        className={`text-sm font-medium ${
                          report.scoreDelta < 0
                            ? "text-red-600"
                            : report.scoreDelta > 0
                            ? "text-green-600"
                            : "text-zinc-600"
                        }`}
                      >
                        {report.scoreDelta > 0 ? "+" : ""}
                        {report.scoreDelta.toFixed(1)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 max-w-xs truncate">
                    {report.notes || "-"}
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {report.reporter?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No reports found</p>
          </div>
        )}
      </div>
    </div>
  );
}
