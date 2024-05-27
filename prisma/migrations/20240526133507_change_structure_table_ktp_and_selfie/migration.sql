/*
  Warnings:

  - Added the required column `updated_at` to the `KTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Selfie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KTP" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_name" TEXT NOT NULL DEFAULT 'no_name';

-- AlterTable
ALTER TABLE "Selfie" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_name" TEXT NOT NULL DEFAULT 'no_name';
