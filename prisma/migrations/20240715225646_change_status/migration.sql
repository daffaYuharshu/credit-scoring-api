/*
  Warnings:

  - You are about to drop the column `hasil` on the `MyRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MyRequest" DROP COLUMN "hasil",
ADD COLUMN     "status" TEXT;
