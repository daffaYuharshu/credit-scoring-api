-- DropForeignKey
ALTER TABLE "MyRequest" DROP CONSTRAINT "MyRequest_no_permintaan_fkey";

-- AlterTable
ALTER TABLE "MyRequest" ALTER COLUMN "no_permintaan" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MyRequest" ADD CONSTRAINT "MyRequest_no_permintaan_fkey" FOREIGN KEY ("no_permintaan") REFERENCES "Request"("no") ON DELETE SET NULL ON UPDATE CASCADE;
