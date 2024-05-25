/*
  Warnings:

  - You are about to drop the column `nik` on the `KTP` table. All the data in the column will be lost.
  - You are about to drop the column `nik` on the `Selfie` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "KTP" DROP CONSTRAINT "KTP_nik_fkey";

-- DropForeignKey
ALTER TABLE "Selfie" DROP CONSTRAINT "Selfie_nik_fkey";

-- AlterTable
ALTER TABLE "KTP" DROP COLUMN "nik";

-- AlterTable
ALTER TABLE "Selfie" DROP COLUMN "nik";
