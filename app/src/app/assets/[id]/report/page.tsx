"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ReportPageProps {
  params: { id: string };
}

const scores = [
  { value: 2.0, label: "Perfect", color: "#22c55e" },
  { value: 1.5, label: "Minor Degradation", color: "#84cc16" },
  { value: 1.0, label: "Moderate Degradation", color: "#eab308" },
  { value: 0.5, label: "Severe Degradation", color: "#f97316" },
  { value: 0.0, label: "Non-Functional", color: "#ef4444" },
];

export default function ReportPage({ params }: ReportPageProps) {
  const [score, setScore] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === null) {
      setError("Please select a score");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: params.id,
          score,
          notes,
          photoUrl: photoUrl.trim() || null,
          latitude: latitude.trim() ? Number(latitude) : null,
          longitude: longitude.trim() ? Number(longitude) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      router.push(`/assets/${params.id}`);
      router.refresh();
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <Link
          href={`/assets/${params.id}`}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 inline-block"
        >
          ← Back to Asset
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Submit Condition Report
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Record the current condition of this asset
        </p>
      </header>

      <div className="max-w-2xl">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
              Select Asset Condition Score *
            </label>
            <div className="grid grid-cols-5 gap-3">
              {scores.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setScore(s.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    score === s.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: s.color }}
                  >
                    {s.value.toFixed(1)}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {s.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the current condition, issues observed, etc."
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/report-photo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="19.0760"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="72.8777"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
            <Link
              href={`/assets/${params.id}`}
              className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
