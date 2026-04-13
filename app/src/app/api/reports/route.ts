import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { evaluateReport, isValidScore } from "@/lib/scoring";
import { ReportSource } from "@prisma/client";
import { hasRoleAccess, MANAGEMENT_ROLES } from "@/lib/access";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assetId, score, notes, latitude, longitude, photoUrl, sourceType } = body;

    if (!assetId || typeof score !== "number") {
      return NextResponse.json(
        { error: "Asset ID and score are required" },
        { status: 400 }
      );
    }

    if (!isValidScore(score)) {
      return NextResponse.json(
        { error: "Score must be one of 0.0, 0.5, 1.0, 1.5, 2.0" },
        { status: 400 }
      );
    }

    // Get asset and its latest report
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        reports: {
          orderBy: { reportedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const previousScore = asset.currentScore;

    // Create report
    const reportSource = hasRoleAccess(session.user.role, MANAGEMENT_ROLES)
      ? sourceType === ReportSource.sensor
        ? ReportSource.sensor
        : ReportSource.inspector
      : ReportSource.citizen;

    const evaluation = evaluateReport(previousScore, score, asset.name);

    const report = await prisma.$transaction(async (tx) => {
      const createdReport = await tx.assetReport.create({
        data: {
          assetId,
          reporterId: session.user.id,
          score,
          previousScore,
          scoreDelta: previousScore !== null ? score - previousScore : null,
          notes,
          photoUrl: typeof photoUrl === "string" && photoUrl.trim() ? photoUrl.trim() : null,
          latitude: typeof latitude === "number" ? latitude : null,
          longitude: typeof longitude === "number" ? longitude : null,
          sourceType: reportSource,
        },
      });

      await tx.asset.update({
        where: { id: assetId },
        data: {
          currentScore: score,
          lastReportedAt: new Date(),
        },
      });

      if (evaluation.alert) {
        await tx.alert.create({
          data: {
            assetId,
            reportId: createdReport.id,
            alertType: evaluation.alert.type,
            severity: evaluation.alert.severity,
            message: evaluation.alert.message,
          },
        });
      }

      if (evaluation.workOrder) {
        await tx.workOrder.create({
          data: {
            assetId,
            triggerReportId: createdReport.id,
            priority: evaluation.workOrder.priority,
            departmentId: asset.departmentId,
            reason: evaluation.workOrder.reason,
          },
        });
      }

      return createdReport;
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.assetReport.findMany({
      include: {
        asset: { select: { name: true, assetCode: true } },
        reporter: { select: { name: true } },
      },
      orderBy: { reportedAt: "desc" },
      take: 50,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
