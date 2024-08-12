/*
  Warnings:

  - Added the required column `ip_address` to the `Authentication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_agent` to the `Authentication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Authentication" ADD COLUMN     "ip_address" TEXT NOT NULL,
ADD COLUMN     "user_agent" TEXT NOT NULL;
