"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AssetTrendPoint {
  id: string;
  score: number;
  reportedAt: string;
  reporterName: string;
}

interface AssetTrendChartProps {
  data: AssetTrendPoint[];
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function AssetTrendChart({ data }: AssetTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-sm text-zinc-500">
        No trend data yet. Submit more reports to see score movement over time.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.12} />
          <XAxis
            dataKey="reportedAt"
            tickFormatter={formatDateLabel}
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 2]}
            ticks={[0, 0.5, 1, 1.5, 2]}
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? value.toFixed(1) : String(value ?? ""),
              "Score",
            ]}
            labelFormatter={(label) =>
              new Date(label).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #27272a",
              backgroundColor: "#18181b",
              color: "#fafafa",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4, fill: "#2563eb" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
