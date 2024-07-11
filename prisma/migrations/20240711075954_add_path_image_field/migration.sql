/*
  Warnings:

  - You are about to drop the column `image_ktp` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `image_selfie` on the `Person` table. All the data in the column will be lost.
  - Added the required column `path_image_ktp` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path_image_selfie` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_image_ktp` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_image_selfie` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Person" DROP COLUMN "image_ktp",
DROP COLUMN "image_selfie",
ADD COLUMN     "path_image_ktp" TEXT NOT NULL,
ADD COLUMN     "path_image_selfie" TEXT NOT NULL,
ADD COLUMN     "url_image_ktp" TEXT NOT NULL,
ADD COLUMN     "url_image_selfie" TEXT NOT NULL;
