/*
  Warnings:

  - You are about to drop the `MyRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MyRequest" DROP CONSTRAINT "MyRequest_nik_fkey";

-- DropForeignKey
ALTER TABLE "MyRequest" DROP CONSTRAINT "MyRequest_no_permintaan_fkey";

-- DropTable
DROP TABLE "MyRequest";

-- CreateTable
CREATE TABLE "Report" (
    "no" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis_permintaan" TEXT NOT NULL,
    "skor" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "finishedAt" TEXT NOT NULL,
    "kendala_proses" TEXT,
    "status" TEXT,
    "pdf" TEXT,
    "nik" TEXT NOT NULL,
    "no_permintaan" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("no")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_no_key" ON "Report"("no");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_nik_fkey" FOREIGN KEY ("nik") REFERENCES "Person"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_no_permintaan_fkey" FOREIGN KEY ("no_permintaan") REFERENCES "Request"("no") ON DELETE SET NULL ON UPDATE CASCADE;
