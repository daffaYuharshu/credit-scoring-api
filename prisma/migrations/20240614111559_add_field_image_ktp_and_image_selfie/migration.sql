/*
  Warnings:

  - You are about to drop the `KTP` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Selfie` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `image_ktp` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_selfie` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "image_ktp" TEXT NOT NULL,
ADD COLUMN     "image_selfie" TEXT NOT NULL;

-- DropTable
DROP TABLE "KTP";

-- DropTable
DROP TABLE "Selfie";
