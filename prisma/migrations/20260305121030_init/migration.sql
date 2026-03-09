-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7');

-- CreateEnum
CREATE TYPE "JobTitle" AS ENUM ('SOFTWARE_ENGINEER', 'SENIOR_ENGINEER', 'TECH_LEAD', 'ENGINEERING_MANAGER', 'DIRECTOR', 'HR_MANAGER', 'FINANCE_MANAGER', 'PRODUCT_MANAGER', 'CEO');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ENGINEERING', 'FINANCE', 'HR', 'SALES', 'MARKETING', 'PRODUCT', 'OPERATIONS', 'LEGAL');

-- CreateEnum
CREATE TYPE "PerformanceRating" AS ENUM ('0', '1', '2', '3', '4', '5');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PotentialLevel" AS ENUM ('UNKNOWN', 'LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(10) NOT NULL,
    "job_title" "JobTitle" NOT NULL,
    "department" "Department" NOT NULL,
    "report_to_id" INTEGER,
    "grade" "Grade" NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "emergency_contact_name" VARCHAR(100) NOT NULL,
    "emergency_contact_phone" VARCHAR(10) NOT NULL,
    "salary" DECIMAL(12,2) NOT NULL,
    "performance_rating" "PerformanceRating" NOT NULL DEFAULT '0',
    "attrition_risk" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "potential_rating" "PotentialLevel" NOT NULL DEFAULT 'UNKNOWN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");
