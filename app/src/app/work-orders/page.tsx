"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WorkOrderStatus, WorkOrderPriority } from "@prisma/client";

interface User {
  id: string;
  name: string;
  email: string;
}

interface WorkOrder {
  id: string;
  assetId: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  reason: string;
  createdAt: string;
  asset: {
    name: string;
  };
  assignedUser?: {
    id: string;
    name: string;
  } | null;
  department?: {
    name: string;
  } | null;
}

const priorityColors: Record<WorkOrderPriority, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrders();
    fetchUsers();
  }, []);

  async function fetchWorkOrders() {
    try {
      const response = await fetch("/api/work-orders");
      if (!response.ok) throw new Error("Failed to fetch work orders");
      const data = await response.json();
      setWorkOrders(data);
    } catch (err) {
      setError("Failed to load work orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch {
      console.error("Failed to fetch users");
    }
  }

  async function updateWorkOrder(
    id: string,
    updates: { status?: WorkOrderStatus; assignedToId?: string | null }
  ) {
    setUpdating(id);
    try {
      const response = await fetch(`/api/work-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update work order");
      }

      const { workOrder } = await response.json();
      setWorkOrders((prev) =>
        prev.map((wo) => (wo.id === id ? { ...wo, ...workOrder } : wo))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update work order");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Loading work orders...</div>
      </div>
    );
  }

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

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-sm underline">
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
                <th className="text-center px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
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
                    <select
                      value={wo.status}
                      onChange={(e) =>
                        updateWorkOrder(wo.id, {
                          status: e.target.value as WorkOrderStatus,
                        })
                      }
                      disabled={updating === wo.id}
                      className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {wo.department?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={wo.assignedUser?.id || ""}
                      onChange={(e) =>
                        updateWorkOrder(wo.id, {
                          assignedToId: e.target.value || null,
                        })
                      }
                      disabled={updating === wo.id}
                      className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    >
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/work-orders/${wo.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      View →
                    </Link>
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
              Work orders are created automatically when critical thresholds are
              crossed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
