interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

const colorClasses = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
}: DashboardCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={`text-xs mt-2 font-medium ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}%
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
