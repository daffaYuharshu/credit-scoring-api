/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Person` table. All the data in the column will be lost.
  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `finishedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_permintaan` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `no` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `no_permintaan` on the `Report` table. All the data in the column will be lost.
  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `finishedAt` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `no` on the `Request` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_at` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Made the column `nama` on table `Person` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `created_at` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finished_at` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skor_asid` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skor_fr` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skor_ocr` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finished_at` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_no_permintaan_fkey";

-- DropIndex
DROP INDEX "Report_no_key";

-- DropIndex
DROP INDEX "Request_no_key";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TEXT NOT NULL,
ADD COLUMN     "updated_at" TEXT NOT NULL,
ALTER COLUMN "nama" SET NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP CONSTRAINT "Report_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "finishedAt",
DROP COLUMN "jenis_permintaan",
DROP COLUMN "nama",
DROP COLUMN "no",
DROP COLUMN "no_permintaan",
ADD COLUMN     "created_at" TEXT NOT NULL,
ADD COLUMN     "finished_at" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "id_permintaan" TEXT,
ADD COLUMN     "skor_asid" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "skor_fr" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "skor_ocr" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Request" DROP CONSTRAINT "Request_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "finishedAt",
DROP COLUMN "no",
ADD COLUMN     "created_at" TEXT NOT NULL,
ADD COLUMN     "finished_at" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Request_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_id_key" ON "Report"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Request_id_key" ON "Request"("id");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_id_permintaan_fkey" FOREIGN KEY ("id_permintaan") REFERENCES "Request"("id") ON DELETE SET NULL ON UPDATE CASCADE;
