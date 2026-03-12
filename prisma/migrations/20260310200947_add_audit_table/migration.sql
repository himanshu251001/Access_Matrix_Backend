-- CreateEnum
CREATE TYPE "ImpersonationAction" AS ENUM ('IMPERSONATE', 'UPDATE', 'REVERT_IMPERSONATE');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedBy" INTEGER;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "action" "ImpersonationAction" NOT NULL,
    "actorId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
