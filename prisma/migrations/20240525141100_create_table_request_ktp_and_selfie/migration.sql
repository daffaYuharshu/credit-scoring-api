/*
  Warnings:

  - You are about to drop the column `ttl` on the `Person` table. All the data in the column will be lost.
  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `detail` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `nik` on the `Request` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[no]` on the table `Request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gol_darah` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kecamatan` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kelurahan` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rt` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rw` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggal_lahir` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tempat_lahir` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenis_permintaan` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jumlah_customer` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_nik_fkey";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "ttl",
ADD COLUMN     "gol_darah" TEXT NOT NULL,
ADD COLUMN     "kecamatan" TEXT NOT NULL,
ADD COLUMN     "kelurahan" TEXT NOT NULL,
ADD COLUMN     "rt" TEXT NOT NULL,
ADD COLUMN     "rw" TEXT NOT NULL,
ADD COLUMN     "tanggal_lahir" TEXT NOT NULL,
ADD COLUMN     "tempat_lahir" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Request" DROP CONSTRAINT "Request_pkey",
DROP COLUMN "detail",
DROP COLUMN "id",
DROP COLUMN "nama",
DROP COLUMN "nik",
ADD COLUMN     "jenis_permintaan" TEXT NOT NULL,
ADD COLUMN     "jumlah_customer" INTEGER NOT NULL,
ADD COLUMN     "no" TEXT NOT NULL,
ADD CONSTRAINT "Request_pkey" PRIMARY KEY ("no");

-- CreateTable
CREATE TABLE "MyRequest" (
    "no" INTEGER NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "hasil" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3) NOT NULL,
    "no_permintaan" TEXT NOT NULL,

    CONSTRAINT "MyRequest_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "KTP" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "nik" TEXT NOT NULL,

    CONSTRAINT "KTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Selfie" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "nik" TEXT NOT NULL,

    CONSTRAINT "Selfie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MyRequest_no_key" ON "MyRequest"("no");

-- CreateIndex
CREATE UNIQUE INDEX "Request_no_key" ON "Request"("no");

-- AddForeignKey
ALTER TABLE "MyRequest" ADD CONSTRAINT "MyRequest_nik_fkey" FOREIGN KEY ("nik") REFERENCES "Person"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyRequest" ADD CONSTRAINT "MyRequest_no_permintaan_fkey" FOREIGN KEY ("no_permintaan") REFERENCES "Request"("no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KTP" ADD CONSTRAINT "KTP_nik_fkey" FOREIGN KEY ("nik") REFERENCES "Person"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Selfie" ADD CONSTRAINT "Selfie_nik_fkey" FOREIGN KEY ("nik") REFERENCES "Person"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;
