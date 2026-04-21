"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertSeverity } from "@prisma/client";

interface Alert {
  id: string;
  assetId: string;
  reportId: string;
  alertType: string;
  severity: AlertSeverity;
  message: string;
  isAcknowledged: boolean;
  createdAt: string;
  asset: {
    name: string;
  };
}

const severityColors: Record<AlertSeverity, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export const dynamic = "force-dynamic";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const response = await fetch("/api/alerts");
      if (!response.ok) throw new Error("Failed to fetch alerts");
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError("Failed to load alerts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function acknowledgeAlert(id: string, acknowledge: boolean) {
    setUpdating(id);
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAcknowledged: acknowledge }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update alert");
      }

      // Update local state
      setAlerts((prev) => {
        return prev.map((alert) =>
          alert.id === id ? { ...alert, isAcknowledged: acknowledge } : alert
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alert");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Loading alerts...</div>
      </div>
    );
  }

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

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

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
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
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
                  <td className="px-6 py-4 text-center">
                    {!alert.isAcknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id, true)}
                        disabled={updating === alert.id}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                      >
                        {updating === alert.id ? "..." : "Acknowledge"}
                      </button>
                    ) : (
                      <button
                        onClick={() => acknowledgeAlert(alert.id, false)}
                        disabled={updating === alert.id}
                        className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:bg-zinc-400 transition-colors"
                      >
                        {updating === alert.id ? "..." : "Unacknowledge"}
                      </button>
                    )}
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
              Alerts will be created automatically when scores drop across
              thresholds
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
