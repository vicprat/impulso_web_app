/*
  Warnings:

  - A unique constraint covering the columns `[cartId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cartId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_cartId_key" ON "users"("cartId");
