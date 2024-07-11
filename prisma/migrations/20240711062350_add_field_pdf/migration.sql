/*
  Warnings:

  - Added the required column `jenis_permintaan` to the `MyRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MyRequest" ADD COLUMN     "jenis_permintaan" TEXT NOT NULL,
ADD COLUMN     "pdf" TEXT;
