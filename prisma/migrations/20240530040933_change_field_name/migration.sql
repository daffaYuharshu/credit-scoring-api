/*
  Warnings:

  - You are about to drop the column `hasil` on the `MyRequest` table. All the data in the column will be lost.
  - Added the required column `skor` to the `MyRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MyRequest" DROP COLUMN "hasil",
ADD COLUMN     "skor" TEXT NOT NULL;
