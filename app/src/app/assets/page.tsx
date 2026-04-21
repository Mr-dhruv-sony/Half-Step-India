import { prisma } from "@/lib/db";
import Link from "next/link";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";
import FilterSelect from "@/components/FilterSelect";
import { AssetStatus, AssetType, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type AssetsSearchParams = Promise<{
  district?: string;
  assetType?: string;
  status?: string;
  scoreBand?: string;
}>;

function buildAssetWhere(filters: {
  district?: string;
  assetType?: string;
  status?: string;
  scoreBand?: string;
}): Prisma.AssetWhereInput {
  const where: Prisma.AssetWhereInput = {};

  if (filters.district) {
    where.districtCode = filters.district;
  }

  if (filters.status) {
    where.status = filters.status as AssetStatus;
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

async function getAssets(where: Prisma.AssetWhereInput) {
  return prisma.asset.findMany({
    where,
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getAssetFilterOptions() {
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

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: AssetsSearchParams;
}) {
  const filters = await searchParams;
  const where = buildAssetWhere(filters);
  const [assets, filterOptions] = await Promise.all([
    getAssets(where),
    getAssetFilterOptions(),
  ]);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    under_maintenance: "bg-yellow-100 text-yellow-800",
    decommissioned: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Assets
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage and monitor public infrastructure
          </p>
        </div>
        <Link
          href="/assets/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Asset
        </Link>
      </header>

      <form
        action="/assets"
        method="get"
        className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-5"
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
          label="Status"
          name="status"
          value={filters.status}
          options={[
            { label: "active", value: "active" },
            { label: "inactive", value: "inactive" },
            { label: "under maintenance", value: "under_maintenance" },
            { label: "decommissioned", value: "decommissioned" },
          ]}
          allLabel="All statuses"
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
            href="/assets"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Asset
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Department
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Location
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Score
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {asset.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{asset.assetCode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 capitalize">
                    {asset.assetType.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {asset.department?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    <div className="text-sm">
                      <p>
                        {asset.districtCode}, {asset.stateCode}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="inline-flex flex-col items-center"
                      title={asset.currentScore ? getScoreLabel(asset.currentScore) : "No score"}
                    >
                      <span
                        className="text-lg font-bold"
                        style={{
                          color: asset.currentScore
                            ? getScoreColor(asset.currentScore)
                            : "#9ca3af",
                        }}
                      >
                        {asset.currentScore?.toFixed(1) || "-"}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[asset.status]
                      }`}
                    >
                      {asset.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/assets/${asset.id}/report`}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Submit Report →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No assets found</p>
            <Link
              href="/assets/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              Add your first asset
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
