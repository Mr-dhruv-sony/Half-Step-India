import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasRoleAccess, MANAGEMENT_ROLES } from "@/lib/access";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await prisma.asset.findMany({
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasRoleAccess(session.user.role, MANAGEMENT_ROLES)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      assetCode,
      assetType,
      departmentId,
      stateCode,
      districtCode,
      address,
      latitude,
      longitude,
      installDate,
    } = body;

    if (!name || !assetCode || !assetType || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        assetCode,
        assetType,
        departmentId,
        stateCode: stateCode || "MH",
        districtCode: districtCode || "MUM",
        address: address || "",
        latitude: latitude || 0,
        longitude: longitude || 0,
        installDate: installDate ? new Date(installDate) : null,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
