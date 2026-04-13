import { prisma } from "@/lib/db";
import Link from "next/link";
import { AlertSeverity } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getAlerts() {
  return prisma.alert.findMany({
    include: {
      asset: true,
      report: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  const severityColors: Record<AlertSeverity, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Alerts
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Monitor threshold alerts and degradation warnings
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
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Alert Type
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Severity
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Message
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/assets/${alert.assetId}`}
                      className="font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {alert.asset.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 capitalize">
                    {alert.alertType.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${severityColors[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {alert.message}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        alert.isAcknowledged
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {alert.isAcknowledged ? "Acknowledged" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No alerts found</p>
            <p className="text-sm text-zinc-400 mt-2">
              Alerts will be created automatically when scores drop across thresholds
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
