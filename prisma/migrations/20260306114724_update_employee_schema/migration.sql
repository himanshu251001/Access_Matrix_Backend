/*
  Warnings:

  - You are about to alter the column `passwordHash` on the `employees` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "employees" ALTER COLUMN "passwordHash" SET DATA TYPE VARCHAR(255);
