"use client";

import { useSyncExternalStore } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Asset {
  id: string;
  name: string;
  assetCode: string;
  assetType: string;
  latitude: number;
  longitude: number;
  currentScore: number | null;
  status: string;
  department?: { name: string } | null;
}

interface AssetMapProps {
  assets: Asset[];
  height?: string;
  showAll?: boolean;
}

function subscribe() {
  return () => {};
}

function getScoreColor(score: number | null): string {
  if (score === null) return "#9ca3af";
  if (score >= 1.5) return "#22c55e";
  if (score >= 1.0) return "#eab308";
  if (score >= 0.5) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score: number | null): string {
  if (score === null) return "No score";
  if (score >= 1.5) return "Healthy";
  if (score >= 1.0) return "Watch";
  if (score >= 0.5) return "Degraded";
  return "Critical";
}

function createCustomIcon(score: number | null, status: string) {
  const color = status === "under_maintenance" ? "#6b7280" : getScoreColor(score);

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

export default function AssetMap({ assets, height = "500px", showAll = false }: AssetMapProps) {
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);

  const validAssets = assets.filter(
    (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
  );

  if (!isMounted) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900"
        style={{ height }}
      >
        <p className="text-zinc-500">Loading map...</p>
      </div>
    );
  }

  if (validAssets.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900"
        style={{ height }}
      >
        <div>
          <p className="text-lg font-medium text-zinc-900 dark:text-white">No location data</p>
          <p className="text-sm text-zinc-500 mt-1">
            Assets need latitude and longitude to appear on the map.
          </p>
        </div>
      </div>
    );
  }

  const center: [number, number] = showAll
    ? [20.5937, 78.9629]
    : validAssets.length === 1
      ? [validAssets[0].latitude, validAssets[0].longitude]
      : [
          validAssets.reduce((sum, a) => sum + a.latitude, 0) / validAssets.length,
          validAssets.reduce((sum, a) => sum + a.longitude, 0) / validAssets.length,
        ];

  const zoom = showAll ? 5 : validAssets.length <= 3 ? 13 : 11;

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden dark:border-zinc-800">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full"
        style={{ height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validAssets.map((asset) => (
          <Marker
            key={asset.id}
            position={[asset.latitude, asset.longitude]}
            icon={createCustomIcon(asset.currentScore, asset.status)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-zinc-900">{asset.name}</h3>
                <p className="text-xs text-zinc-500">{asset.assetCode}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {asset.assetType.replace("_", " ")}
                  </p>
                  <p>
                    <span className="font-medium">Department:</span>{" "}
                    {asset.department?.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Score:</span>{" "}
                    <span
                      style={{ color: getScoreColor(asset.currentScore) }}
                      className="font-bold"
                    >
                      {asset.currentScore?.toFixed(1) || "N/A"}
                    </span>{" "}
                    ({getScoreLabel(asset.currentScore)})
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {asset.status.replace("_", " ")}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
