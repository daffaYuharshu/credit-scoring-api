/*
  Warnings:

  - The primary key for the `Person` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nik` on the `Report` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_person` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_nik_fkey";

-- DropIndex
DROP INDEX "Person_nik_key";

-- AlterTable
ALTER TABLE "Person" DROP CONSTRAINT "Person_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Person_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "nik",
ADD COLUMN     "id_person" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Person_id_key" ON "Person"("id");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_id_person_fkey" FOREIGN KEY ("id_person") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
