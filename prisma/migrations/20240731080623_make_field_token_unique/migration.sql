/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Authentication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Authentication_token_key" ON "Authentication"("token");
