import { prisma } from "@/lib/db";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";
import { AlertSeverity, WorkOrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [
    totalAssets,
    activeAlerts,
    openWorkOrders,
    criticalAlerts,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.alert.count({ where: { isAcknowledged: false } }),
    prisma.workOrder.count({
      where: {
        status: { in: [WorkOrderStatus.open, WorkOrderStatus.in_progress] },
      },
    }),
    prisma.alert.count({
      where: {
        severity: AlertSeverity.critical,
        isAcknowledged: false,
      },
    }),
  ]);

  return { totalAssets, activeAlerts, openWorkOrders, criticalAlerts };
}

async function getRecentAlerts() {
  return prisma.alert.findMany({
    where: { isAcknowledged: false },
    include: { asset: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

async function getLowScoreAssets() {
  return prisma.asset.findMany({
    where: {
      currentScore: { lte: 1.0 },
    },
    orderBy: { currentScore: "asc" },
    take: 5,
    include: { department: true },
  });
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentAlerts = await getRecentAlerts();
  const lowScoreAssets = await getLowScoreAssets();

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
          Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Overview of infrastructure health and alerts
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Assets"
          value={stats.totalAssets}
          icon="🏗️"
          color="blue"
        />
        <DashboardCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon="🔔"
          color="yellow"
        />
        <DashboardCard
          title="Open Work Orders"
          value={stats.openWorkOrders}
          icon="🔧"
          color="purple"
        />
        <DashboardCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          icon="🚨"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Recent Alerts
            </h2>
            <Link
              href="/alerts"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all →
            </Link>
          </div>

          {recentAlerts.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No active alerts</p>
          ) : (
            <ul className="space-y-3">
              {recentAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {alert.asset.name}
                    </p>
                    <p className="text-sm text-zinc-500">{alert.message}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${severityColors[alert.severity]}`}
                  >
                    {alert.severity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Low Score Assets
            </h2>
            <Link
              href="/assets"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all →
            </Link>
          </div>

          {lowScoreAssets.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No low score assets</p>
          ) : (
            <ul className="space-y-3">
              {lowScoreAssets.map((asset) => (
                <li
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {asset.name}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {asset.department?.name} • {asset.assetType}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${
                        asset.currentScore && asset.currentScore <= 0.5
                          ? "text-red-600"
                          : asset.currentScore === 1.0
                          ? "text-yellow-600"
                          : "text-zinc-600"
                      }`}
                    >
                      {asset.currentScore?.toFixed(1)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
