/*
  Warnings:

  - Added the required column `passwordHash` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "passwordHash" TEXT NOT NULL;
