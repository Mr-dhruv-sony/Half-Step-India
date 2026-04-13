import "dotenv/config";
import { PrismaClient, AssetType, UserRole, AssetStatus, ReportSource } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.alert.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.assetReport.deleteMany();
  await prisma.districtMetricsDaily.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Create departments
  console.log("Creating departments...");
  const publicWorks = await prisma.department.upsert({
    where: { code: "PWD" },
    update: {},
    create: {
      name: "Public Works Department",
      code: "PWD",
    },
  });

  const electricity = await prisma.department.upsert({
    where: { code: "MSEB" },
    update: {},
    create: {
      name: "Maharashtra State Electricity Board",
      code: "MSEB",
    },
  });

  const water = await prisma.department.upsert({
    where: { code: "WRD" },
    update: {},
    create: {
      name: "Water Resources Department",
      code: "WRD",
    },
  });

  const municipal = await prisma.department.upsert({
    where: { code: "MCGM" },
    update: {},
    create: {
      name: "Municipal Corporation",
      code: "MCGM",
    },
  });

  // Create users
  console.log("Creating users...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const inspectorPassword = await bcrypt.hash("inspector123", 10);
  const citizenPassword = await bcrypt.hash("citizen123", 10);

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@halfstep.in",
      passwordHash: adminPassword,
      role: UserRole.admin,
      stateCode: "MH",
      districtCode: "MUM",
      isActive: true,
    },
  });

  const inspector1 = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "rajesh@halfstep.in",
      passwordHash: inspectorPassword,
      role: UserRole.field_inspector,
      departmentId: municipal.id,
      stateCode: "MH",
      districtCode: "MUM",
      isActive: true,
    },
  });

  const inspector2 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@halfstep.in",
      passwordHash: inspectorPassword,
      role: UserRole.field_inspector,
      departmentId: electricity.id,
      stateCode: "MH",
      districtCode: "MUM",
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Amit Patel",
      email: "amit@halfstep.in",
      passwordHash: adminPassword,
      role: UserRole.department_officer,
      departmentId: publicWorks.id,
      stateCode: "MH",
      districtCode: "MUM",
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Neha Verma",
      email: "citizen@halfstep.in",
      passwordHash: citizenPassword,
      role: UserRole.citizen,
      stateCode: "MH",
      districtCode: "MUM",
      isActive: true,
    },
  });

  // Create assets
  console.log("Creating assets...");
  const assets = await Promise.all([
    // Streetlights
    prisma.asset.create({
      data: {
        name: "Marine Drive Streetlight 1",
        assetCode: "SL-MUM-001",
        assetType: AssetType.streetlight,
        departmentId: electricity.id,
        stateCode: "MH",
        districtCode: "MUM",
        address: "Marine Drive, Near Nariman Point, Mumbai",
        latitude: 18.9442,
        longitude: 72.8235,
        currentScore: 1.5,
        status: AssetStatus.active,
      },
    }),
    prisma.asset.create({
      data: {
        name: "Bandra West Streetlight 5",
        assetCode: "SL-MUM-002",
        assetType: AssetType.streetlight,
        departmentId: electricity.id,
        stateCode: "MH",
        districtCode: "MUM",
        address: "Linking Road, Bandra West, Mumbai",
        latitude: 19.0596,
        longitude: 72.8295,
        currentScore: 1.0,
        status: AssetStatus.active,
      },
    }),
    // Roads
    prisma.asset.create({
      data: {
        name: "SV Road Section A",
        assetCode: "RD-MUM-001",
        assetType: AssetType.road,
        departmentId: publicWorks.id,
        stateCode: "MH",
        districtCode: "MUM",
        address: "SV Road, Andheri West, Mumbai",
        latitude: 19.1351,
        longitude: 72.8147,
        currentScore: 1.5,
        status: AssetStatus.active,
      },
    }),
    prisma.asset.create({
      data: {
        name: "LBS Marg Section B",
        assetCode: "RD-MUM-002",
        assetType: AssetType.road,
        departmentId: publicWorks.id,
        stateCode: "MH",
        districtCode: "MUM",
        address: "LBS Marg, Ghatkopar, Mumbai",
        latitude: 19.0863,
        longitude: 72.9065,
        currentScore: 0.5,
        status: AssetStatus.active,
      },
    }),
    // Water Pumps
    prisma.asset.create({
      data: {
        name: "Mahim Water Pump Station",
        assetCode: "WP-MUM-001",
        assetType: AssetType.water_pump,
        departmentId: water.id,
        stateCode: "MH",
        districtCode: "MUM",
        address: "Mahim Causeway, Mumbai",
        latitude: 19.035,
        longitude: 72.84,
        currentScore: 2.0,
        status: AssetStatus.active,
      },
    }),
    // Public Toilets
    prisma.asset.create({
      data: {
        name: "Churchgate Station Toilet",
        assetCode: "PT-MUM-001",
        assetType: AssetType.toilet,
        departmentId: municipal.id,
        stateCode: "MH",
        districtCode: "MUM",
        address: "Churchgate Station, Mumbai",
        latitude: 18.9352,
        longitude: 72.8277,
        currentScore: 1.0,
        status: AssetStatus.active,
      },
    }),
    // Benches
    prisma.asset.create({
      data: {
        name: "Marine Drive Bench 1",
        assetCode: "PB-MUM-001",
        assetType: AssetType.bench,
        departmentId: municipal.id,
        stateCode: "MH",
        districtCode: "MUM",
        address: "Marine Drive, Near Chowpatty, Mumbai",
        latitude: 18.9542,
        longitude: 72.8155,
        currentScore: 1.5,
        status: AssetStatus.active,
      },
    }),
    // Hospital Lines
    prisma.asset.create({
      data: {
        name: "JJ Hospital Water Line",
        assetCode: "HL-MUM-001",
        assetType: AssetType.hospital_line,
        departmentId: water.id,
        stateCode: "MH",
        districtCode: "MUM",
        address: "JJ Hospital, Byculla, Mumbai",
        latitude: 18.9647,
        longitude: 72.8325,
        currentScore: 0.5,
        status: AssetStatus.under_maintenance,
      },
    }),
  ]);

  // Create report history for demo story
  console.log("Creating report history...");
  const streetlight = assets[1]; // Bandra West Streetlight
  const road = assets[3]; // LBS Marg
  // Create report history showing degradation
  await prisma.assetReport.createMany({
    data: [
      // Streetlight: 2.0 -> 1.5 -> 1.0 (creates alert)
      {
        assetId: streetlight.id,
        reporterId: inspector2.id,
        score: 2.0,
        sourceType: ReportSource.inspector,
        notes: "Initial inspection - working perfectly",
        reportedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        assetId: streetlight.id,
        reporterId: inspector2.id,
        score: 1.5,
        previousScore: 2.0,
        scoreDelta: -0.5,
        sourceType: ReportSource.inspector,
        notes: "Flickering observed, minor degradation",
        reportedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        assetId: streetlight.id,
        reporterId: inspector2.id,
        score: 1.0,
        previousScore: 1.5,
        scoreDelta: -0.5,
        sourceType: ReportSource.inspector,
        notes: "Significant dimming, moderate degradation",
        reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      // Road: 1.5 -> 0.5 (creates alert + work order)
      {
        assetId: road.id,
        reporterId: inspector1.id,
        score: 1.5,
        sourceType: ReportSource.inspector,
        notes: "Potholes developing on surface",
        reportedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        assetId: road.id,
        reporterId: inspector1.id,
        score: 0.5,
        previousScore: 1.5,
        scoreDelta: -1.0,
        sourceType: ReportSource.inspector,
        notes: "Multiple large potholes, dangerous condition",
        reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Update assets with current scores
  await prisma.asset.update({
    where: { id: streetlight.id },
    data: { currentScore: 1.0 },
  });
  await prisma.asset.update({
    where: { id: road.id },
    data: { currentScore: 0.5 },
  });

  await prisma.districtMetricsDaily.create({
    data: {
      stateCode: "MH",
      districtCode: "MUM",
      metricDate: new Date(),
      assetCount: 8,
      healthyCount: 1,
      minorDegradationCount: 3,
      moderateDegradationCount: 2,
      severeDegradationCount: 2,
      deadCount: 0,
      halfStepIndex: 1.125,
    },
  });

  // Create alerts based on degradation
  const streetlightReport = await prisma.assetReport.findFirst({
    where: { assetId: streetlight.id, score: 1.0 },
    orderBy: { reportedAt: "desc" },
  });
  const roadReport = await prisma.assetReport.findFirst({
    where: { assetId: road.id, score: 0.5 },
    orderBy: { reportedAt: "desc" },
  });

  if (streetlightReport) {
    await prisma.alert.create({
      data: {
        assetId: streetlight.id,
        reportId: streetlightReport.id,
        alertType: "threshold_drop",
        severity: "medium",
        message: `${streetlight.name} degraded from minor to moderate degradation`,
        isAcknowledged: false,
      },
    });
  }

  if (roadReport) {
    await prisma.alert.create({
      data: {
        assetId: road.id,
        reportId: roadReport.id,
        alertType: "rapid_decline",
        severity: "high",
        message: `${road.name} declined rapidly from 1.5 to 0.5`,
        isAcknowledged: false,
      },
    });

    // Create work order for the road
    await prisma.workOrder.create({
      data: {
        assetId: road.id,
        triggerReportId: roadReport.id,
        priority: "high",
        departmentId: road.departmentId,
        status: "open",
        reason: "Rapid decline of 1.0 points - road requires immediate repair",
      },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log("\nDemo Credentials:");
  console.log("  Admin: admin@halfstep.in / admin123");
  console.log("  Department Officer: amit@halfstep.in / admin123");
  console.log("  Inspector: rajesh@halfstep.in / inspector123");
  console.log("  Inspector: priya@halfstep.in / inspector123");
  console.log("  Citizen: citizen@halfstep.in / citizen123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
