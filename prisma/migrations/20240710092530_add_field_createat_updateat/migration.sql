/*
  Warnings:

  - Added the required column `updatedAt` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "nama" DROP NOT NULL,
ALTER COLUMN "jenis_kelamin" DROP NOT NULL,
ALTER COLUMN "tanggal_lahir" DROP NOT NULL,
ALTER COLUMN "tempat_lahir" DROP NOT NULL;
