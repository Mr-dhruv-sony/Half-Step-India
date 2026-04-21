import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkOrderPriority, WorkOrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface WorkOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const priorityColors: Record<WorkOrderPriority, string> = {
  low: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
};

const statusColors: Record<WorkOrderStatus, string> = {
  open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  cancelled: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
};

async function getWorkOrder(id: string) {
  return prisma.workOrder.findUnique({
    where: { id },
    include: {
      asset: true,
      triggerReport: {
        include: {
          reporter: {
            select: { name: true, email: true },
          },
        },
      },
      assignedUser: {
        select: { id: true, name: true, email: true, role: true },
      },
      department: true,
    },
  });
}

export default async function WorkOrderDetailPage({
  params,
}: WorkOrderDetailPageProps) {
  const { id } = await params;
  const workOrder = await getWorkOrder(id);

  if (!workOrder) {
    notFound();
  }

  return (
    <div>
      <header className="mb-8">
        <Link
          href="/work-orders"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 inline-block"
        >
          ← Back to Work Orders
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Work Order Details
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Track the repair trigger, assignment, and asset context.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${priorityColors[workOrder.priority]}`}
              >
                {workOrder.priority} priority
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[workOrder.status]}`}
              >
                {workOrder.status.replace("_", " ")}
              </span>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-zinc-500">Work Order ID</dt>
                <dd className="font-medium text-zinc-900 dark:text-white break-all">
                  {workOrder.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Department</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.department.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Created</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {new Date(workOrder.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Resolved</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.resolvedAt
                    ? new Date(workOrder.resolvedAt).toLocaleString()
                    : "Not resolved"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-zinc-500">Reason</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.reason}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Triggering Asset
              </h2>
              <Link
                href={`/assets/${workOrder.assetId}`}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View asset →
              </Link>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-zinc-500">Asset Name</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.asset.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Asset Code</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.asset.assetCode}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Type</dt>
                <dd className="font-medium capitalize text-zinc-900 dark:text-white">
                  {workOrder.asset.assetType.replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Current Score</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.asset.currentScore?.toFixed(1) ?? "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-zinc-500">Address</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.asset.address || "No address recorded"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Trigger Report
            </h2>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-zinc-500">Reported Score</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.triggerReport.score.toFixed(1)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Previous Score</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.triggerReport.previousScore?.toFixed(1) ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Score Delta</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.triggerReport.scoreDelta?.toFixed(1) ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Reported At</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {new Date(workOrder.triggerReport.reportedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Reporter</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.triggerReport.reporter.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Source Type</dt>
                <dd className="font-medium capitalize text-zinc-900 dark:text-white">
                  {workOrder.triggerReport.sourceType}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-zinc-500">Notes</dt>
                <dd className="font-medium text-zinc-900 dark:text-white">
                  {workOrder.triggerReport.notes || "No notes provided"}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Assignment
            </h2>
            <p className="text-sm text-zinc-500 mb-2">Assigned To</p>
            <p className="font-medium text-zinc-900 dark:text-white">
              {workOrder.assignedUser?.name || "Unassigned"}
            </p>
            <p className="text-sm text-zinc-500 mt-4">
              Update assignment and status from the work-orders list view.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/work-orders"
                className="block rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
              >
                Manage Work Orders
              </Link>
              <Link
                href={`/assets/${workOrder.assetId}/report`}
                className="block rounded-lg border border-zinc-300 px-4 py-2 text-center font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Submit Follow-up Report
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
