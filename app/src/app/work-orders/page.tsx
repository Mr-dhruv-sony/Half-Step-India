import { prisma } from "@/lib/db";
import Link from "next/link";
import { WorkOrderStatus, WorkOrderPriority } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getWorkOrders() {
  return prisma.workOrder.findMany({
    include: {
      asset: true,
      triggerReport: true,
      assignedUser: { select: { name: true } },
      department: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function WorkOrdersPage() {
  const workOrders = await getWorkOrders();

  const statusColors: Record<WorkOrderStatus, string> = {
    open: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  const priorityColors: Record<WorkOrderPriority, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Work Orders
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Track maintenance and repair tasks
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
                  Reason
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Priority
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Department
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Assigned To
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {workOrders.map((wo) => (
                <tr
                  key={wo.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/assets/${wo.assetId}`}
                      className="font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {wo.asset.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 max-w-xs truncate">
                    {wo.reason}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${priorityColors[wo.priority]}`}
                    >
                      {wo.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[wo.status]}`}
                    >
                      {wo.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {wo.department?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {wo.assignedUser?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {new Date(wo.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {workOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No work orders found</p>
            <p className="text-sm text-zinc-400 mt-2">
              Work orders are created automatically when critical thresholds are crossed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
