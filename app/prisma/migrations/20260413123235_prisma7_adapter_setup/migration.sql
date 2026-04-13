-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'department_officer', 'field_inspector', 'citizen');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('active', 'inactive', 'under_maintenance', 'decommissioned');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('road', 'streetlight', 'water_pump', 'toilet', 'bench', 'hospital_line', 'other');

-- CreateEnum
CREATE TYPE "ReportSource" AS ENUM ('citizen', 'inspector', 'sensor');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('open', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "department_id" TEXT,
    "state_code" TEXT,
    "district_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "asset_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "department_id" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "district_code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "install_date" TIMESTAMP(3),
    "current_score" DOUBLE PRECISION,
    "last_reported_at" TIMESTAMP(3),
    "status" "AssetStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_reports" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "previous_score" DOUBLE PRECISION,
    "score_delta" DOUBLE PRECISION,
    "notes" TEXT,
    "photo_url" TEXT,
    "source_type" "ReportSource" NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "is_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "trigger_report_id" TEXT NOT NULL,
    "priority" "WorkOrderPriority" NOT NULL,
    "department_id" TEXT NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'open',
    "reason" TEXT NOT NULL,
    "assigned_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "district_metrics_daily" (
    "id" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "district_code" TEXT NOT NULL,
    "metric_date" TIMESTAMP(3) NOT NULL,
    "asset_count" INTEGER NOT NULL,
    "healthy_count" INTEGER NOT NULL,
    "minor_degradation_count" INTEGER NOT NULL,
    "moderate_degradation_count" INTEGER NOT NULL,
    "severe_degradation_count" INTEGER NOT NULL,
    "dead_count" INTEGER NOT NULL,
    "half_step_index" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "district_metrics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assets_asset_code_key" ON "assets"("asset_code");

-- CreateIndex
CREATE UNIQUE INDEX "district_metrics_daily_state_code_district_code_metric_date_key" ON "district_metrics_daily"("state_code", "district_code", "metric_date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_reports" ADD CONSTRAINT "asset_reports_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_reports" ADD CONSTRAINT "asset_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "asset_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_trigger_report_id_fkey" FOREIGN KEY ("trigger_report_id") REFERENCES "asset_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
