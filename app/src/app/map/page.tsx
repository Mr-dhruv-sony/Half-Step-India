"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AssetType } from "@prisma/client";

const AssetMap = dynamic(() => import("@/components/AssetMap"), {
  ssr: false,
});

interface Asset {
  id: string;
  name: string;
  assetCode: string;
  assetType: string;
  latitude: number;
  longitude: number;
  currentScore: number | null;
  status: string;
  districtCode: string;
  stateCode: string;
  department?: { name: string } | null;
}

export default function MapPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    district: "",
    assetType: "",
    status: "",
    scoreBand: "",
  });

  useEffect(() => {
    async function fetchAssets() {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.district) params.set("district", filters.district);
      if (filters.assetType) params.set("assetType", filters.assetType);
      if (filters.status) params.set("status", filters.status);
      if (filters.scoreBand) params.set("scoreBand", filters.scoreBand);

      const response = await fetch(`/api/assets?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
      setLoading(false);
    }
    fetchAssets();
  }, [filters]);

  const assetsWithLocation = assets.filter(
    (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Asset Map</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          View infrastructure assets on an interactive map
        </p>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-5">
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">District</label>
          <select
            value={filters.district}
            onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">All</option>
            {Array.from(new Set(assets.map((a) => a.districtCode))).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">Asset Type</label>
          <select
            value={filters.assetType}
            onChange={(e) => setFilters((f) => ({ ...f, assetType: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">All</option>
            {Object.values(AssetType).map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">Score Band</label>
          <select
            value={filters.scoreBand}
            onChange={(e) => setFilters((f) => ({ ...f, scoreBand: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">All</option>
            <option value="healthy">Healthy (1.5-2.0)</option>
            <option value="watch">Watch (1.0)</option>
            <option value="critical">Critical (0.0-0.5)</option>
          </select>
        </div>
        <div className="flex items-end gap-2 md:col-span-2">
          <button
            type="button"
            onClick={() => setFilters({ district: "", assetType: "", status: "", scoreBand: "" })}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Healthy (1.5-2.0)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-yellow-500"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Watch (1.0)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-orange-500"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Degraded (0.5)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Critical (0.0)</span>
          </span>
        </div>
        <p className="text-sm text-zinc-500">
          {loading ? "Loading..." : `${assetsWithLocation.length} of ${assets.length} assets shown`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-zinc-200 p-12 dark:border-zinc-800">
          <p className="text-zinc-500">Loading map...</p>
        </div>
      ) : (
        <AssetMap assets={assets} height="600px" showAll />
      )}
    </div>
  );
}
