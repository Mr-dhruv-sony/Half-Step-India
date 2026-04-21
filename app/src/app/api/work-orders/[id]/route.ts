import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasRoleAccess, MANAGEMENT_ROLES } from "@/lib/access";
import { WorkOrderStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only management roles can update work orders
    if (!hasRoleAccess(session.user.role, MANAGEMENT_ROLES)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, assignedToId } = body;

    // Check if work order exists
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!existingWorkOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: {
      status?: WorkOrderStatus;
      assignedTo?: string | null;
      resolvedAt?: Date | null;
    } = {};

    if (status && Object.values(WorkOrderStatus).includes(status)) {
      updateData.status = status;
      // Set resolvedAt when status is completed
      if (status === WorkOrderStatus.completed) {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }
    }

    if (assignedToId !== undefined) {
      updateData.assignedTo = assignedToId || null;
    }

    // Update the work order
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        asset: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        department: true,
      },
    });

    return NextResponse.json({
      success: true,
      workOrder: updatedWorkOrder,
      message: "Work order updated successfully",
    });
  } catch (error) {
    console.error("Error updating work order:", error);
    return NextResponse.json(
      { error: "Failed to update work order" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        asset: true,
        triggerReport: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        department: true,
      },
    });

    if (!workOrder) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error fetching work order:", error);
    return NextResponse.json(
      { error: "Failed to fetch work order" },
      { status: 500 }
    );
  }
}
