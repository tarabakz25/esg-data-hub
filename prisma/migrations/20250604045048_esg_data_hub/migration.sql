-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('parsed', 'errored');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('compliant', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "ComplianceSeverity" AS ENUM ('critical', 'warning');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('compliance_missing', 'compliance_warning', 'system_alert');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('high', 'medium', 'low');

-- CreateTable
CREATE TABLE "DataSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRecord" (
    "id" BIGSERIAL NOT NULL,
    "dataRecordId" BIGINT NOT NULL,

    CONSTRAINT "DataRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "baseUnit" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MappingRule" (
    "id" SERIAL NOT NULL,
    "dataRecordId" BIGINT NOT NULL,
    "kpiId" INTEGER NOT NULL,
    "mappingRuleId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MappingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" BIGSERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" BIGINT NOT NULL,
    "action" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "prevHash" TEXT,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormalizedRecord" (
    "id" BIGSERIAL NOT NULL,
    "dataRecordId" BIGINT NOT NULL,
    "kpiId" INTEGER NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "originalValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NormalizedRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTask" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIRequirement" (
    "id" SERIAL NOT NULL,
    "kpiId" INTEGER NOT NULL,
    "regulation" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "dueDate" TIMESTAMP(3),
    "department" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" BIGSERIAL NOT NULL,
    "alertType" TEXT NOT NULL,
    "kpiId" INTEGER,
    "regulation" TEXT,
    "department" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "slackMessageTs" TEXT,

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kpi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Data" (
    "id" SERIAL NOT NULL,
    "kpiId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataVersion" (
    "id" SERIAL NOT NULL,
    "dataId" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "diff" JSONB NOT NULL,
    "userId" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" SERIAL NOT NULL,
    "uri" TEXT NOT NULL,
    "uploaderId" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'parsed',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" INTEGER,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRow" (
    "id" SERIAL NOT NULL,
    "uploadId" INTEGER NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "raw" JSONB NOT NULL,
    "checksum" TEXT NOT NULL,
    "embedding" vector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" INTEGER,

    CONSTRAINT "DataRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIValue" (
    "id" SERIAL NOT NULL,
    "kpiId" TEXT NOT NULL,
    "dataRowId" INTEGER NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,

    CONSTRAINT "KPIValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCheckResult" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalKpis" INTEGER NOT NULL,
    "criticalMissing" INTEGER NOT NULL,
    "warningMissing" INTEGER NOT NULL,
    "complianceRate" DOUBLE PRECISION NOT NULL,
    "status" "ComplianceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceCheckResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissingKpi" (
    "id" SERIAL NOT NULL,
    "complianceCheckResultId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "kpiName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" "ComplianceSeverity" NOT NULL,
    "expectedUnit" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissingKpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "ComplianceSeverity",
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "complianceCheckResultId" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_name_key" ON "DataSource"("name");

-- CreateIndex
CREATE INDEX "DataSource_name_idx" ON "DataSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KPI_code_key" ON "KPI"("code");

-- CreateIndex
CREATE INDEX "MappingRule_dataRecordId_idx" ON "MappingRule"("dataRecordId");

-- CreateIndex
CREATE INDEX "MappingRule_kpiId_idx" ON "MappingRule"("kpiId");

-- CreateIndex
CREATE INDEX "AuditTrail_tableName_recordId_idx" ON "AuditTrail"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "AuditTrail_createdAt_idx" ON "AuditTrail"("createdAt");

-- CreateIndex
CREATE INDEX "NormalizedRecord_dataRecordId_idx" ON "NormalizedRecord"("dataRecordId");

-- CreateIndex
CREATE INDEX "NormalizedRecord_kpiId_idx" ON "NormalizedRecord"("kpiId");

-- CreateIndex
CREATE INDEX "NormalizedRecord_createdAt_idx" ON "NormalizedRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTask_name_key" ON "WorkflowTask"("name");

-- CreateIndex
CREATE INDEX "WorkflowTask_name_idx" ON "WorkflowTask"("name");

-- CreateIndex
CREATE INDEX "KPIRequirement_regulation_isRequired_idx" ON "KPIRequirement"("regulation", "isRequired");

-- CreateIndex
CREATE UNIQUE INDEX "KPIRequirement_kpiId_regulation_key" ON "KPIRequirement"("kpiId", "regulation");

-- CreateIndex
CREATE INDEX "AlertLog_alertType_status_idx" ON "AlertLog"("alertType", "status");

-- CreateIndex
CREATE INDEX "AlertLog_sentAt_idx" ON "AlertLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Data_kpiId_period_key" ON "Data"("kpiId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Source_uri_key" ON "Source"("uri");

-- CreateIndex
CREATE UNIQUE INDEX "Upload_s3Key_key" ON "Upload"("s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "KPIValue_kpiId_period_dataRowId_key" ON "KPIValue"("kpiId", "period", "dataRowId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceCheckResult_period_standard_key" ON "ComplianceCheckResult"("period", "standard");

-- CreateIndex
CREATE UNIQUE INDEX "MissingKpi_complianceCheckResultId_kpiId_key" ON "MissingKpi"("complianceCheckResultId", "kpiId");

-- CreateIndex
CREATE INDEX "Notification_isRead_createdAt_idx" ON "Notification"("isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "Kpi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data" ADD CONSTRAINT "Data_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataVersion" ADD CONSTRAINT "DataVersion_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "Data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataVersion" ADD CONSTRAINT "DataVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRow" ADD CONSTRAINT "DataRow_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRow" ADD CONSTRAINT "DataRow_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIValue" ADD CONSTRAINT "KPIValue_dataRowId_fkey" FOREIGN KEY ("dataRowId") REFERENCES "DataRow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIValue" ADD CONSTRAINT "KPIValue_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "Kpi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingKpi" ADD CONSTRAINT "MissingKpi_complianceCheckResultId_fkey" FOREIGN KEY ("complianceCheckResultId") REFERENCES "ComplianceCheckResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_complianceCheckResultId_fkey" FOREIGN KEY ("complianceCheckResultId") REFERENCES "ComplianceCheckResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
