import { prisma } from "@/lib/db";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";
import FilterSelect from "@/components/FilterSelect";
import { forecastAssetRisk } from "@/lib/forecast";
import { AlertSeverity, AssetType, Prisma, WorkOrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type DashboardSearchParams = Promise<{
  district?: string;
  assetType?: string;
  scoreBand?: string;
}>;

function buildAssetWhere(filters: {
  district?: string;
  assetType?: string;
  scoreBand?: string;
}): Prisma.AssetWhereInput {
  const where: Prisma.AssetWhereInput = {};

  if (filters.district) {
    where.districtCode = filters.district;
  }

  if (filters.assetType && Object.values(AssetType).includes(filters.assetType as AssetType)) {
    where.assetType = filters.assetType as AssetType;
  }

  if (filters.scoreBand === "healthy") {
    where.currentScore = { gte: 1.5 };
  } else if (filters.scoreBand === "watch") {
    where.currentScore = { equals: 1.0 };
  } else if (filters.scoreBand === "critical") {
    where.currentScore = { lte: 0.5 };
  }

  return where;
}

async function getDashboardStats(assetWhere: Prisma.AssetWhereInput) {
  const [
    totalAssets,
    filteredAssetCount,
    activeAlerts,
    openWorkOrders,
    criticalAlerts,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: assetWhere }),
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

  return {
    totalAssets,
    filteredAssetCount,
    activeAlerts,
    openWorkOrders,
    criticalAlerts,
  };
}

async function getRecentAlerts(assetWhere: Prisma.AssetWhereInput) {
  return prisma.alert.findMany({
    where: {
      isAcknowledged: false,
      asset: { is: assetWhere },
    },
    include: { asset: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

async function getLowScoreAssets(assetWhere: Prisma.AssetWhereInput) {
  return prisma.asset.findMany({
    where: {
      ...assetWhere,
      currentScore: { lte: 1.0 },
    },
    orderBy: { currentScore: "asc" },
    take: 5,
    include: { department: true },
  });
}

async function getDashboardFilterOptions() {
  const [districts] = await Promise.all([
    prisma.asset.findMany({
      select: { districtCode: true },
      distinct: ["districtCode"],
      orderBy: { districtCode: "asc" },
    }),
  ]);

  return {
    districts: districts.map((item) => ({
      label: item.districtCode,
      value: item.districtCode,
    })),
    assetTypes: Object.values(AssetType).map((item) => ({
      label: item.replace("_", " "),
      value: item,
    })),
  };
}

async function getForecastAssets(assetWhere: Prisma.AssetWhereInput) {
  const assets = await prisma.asset.findMany({
    where: assetWhere,
    include: {
      department: true,
      reports: {
        select: { id: true, score: true, reportedAt: true },
        orderBy: { reportedAt: "desc" },
        take: 3,
      },
    },
    take: 20,
  });

  return assets
    .map((asset) => {
      const forecast = forecastAssetRisk(asset.currentScore, asset.reports);
      return { asset, forecast };
    })
    .filter(({ forecast }) => forecast.projectedScore90d !== null)
    .sort((a, b) => {
      const aScore = a.forecast.projectedScore90d ?? 2;
      const bScore = b.forecast.projectedScore90d ?? 2;
      return aScore - bScore;
    })
    .slice(0, 5);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const filters = await searchParams;
  const assetWhere = buildAssetWhere(filters);

  const [stats, recentAlerts, lowScoreAssets, filterOptions, forecastAssets] =
    await Promise.all([
      getDashboardStats(assetWhere),
      getRecentAlerts(assetWhere),
      getLowScoreAssets(assetWhere),
      getDashboardFilterOptions(),
      getForecastAssets(assetWhere),
    ]);

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

      <form
        action="/dashboard"
        method="get"
        className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-4"
      >
        <FilterSelect
          label="District"
          name="district"
          value={filters.district}
          options={filterOptions.districts}
          allLabel="All districts"
        />
        <FilterSelect
          label="Asset Type"
          name="assetType"
          value={filters.assetType}
          options={filterOptions.assetTypes}
          allLabel="All asset types"
        />
        <FilterSelect
          label="Score Band"
          name="scoreBand"
          value={filters.scoreBand}
          options={[
            { label: "healthy", value: "healthy" },
            { label: "watchlist", value: "watch" },
            { label: "critical", value: "critical" },
          ]}
          allLabel="All score bands"
        />
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Filtered Assets"
          value={stats.filteredAssetCount}
          subtitle={`${stats.totalAssets} total in system`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              90-Day Failure Watch
            </h2>
            <p className="text-sm text-zinc-500">
              Rule-based forecast from recent report decline velocity.
            </p>
          </div>
          <Link
            href="/assets"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Explore assets →
          </Link>
        </div>

        {forecastAssets.length === 0 ? (
          <p className="py-8 text-center text-zinc-500">
            No forecast risk detected for the current filter set.
          </p>
        ) : (
          <ul className="space-y-3">
            {forecastAssets.map(({ asset, forecast }) => (
              <li
                key={asset.id}
                className="flex items-center justify-between rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {asset.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {asset.department?.name} • projected 90-day score{" "}
                    {forecast.projectedScore90d?.toFixed(1)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    forecast.riskLevel === "high"
                      ? "bg-red-100 text-red-800"
                      : forecast.riskLevel === "watch"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {forecast.riskLevel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
