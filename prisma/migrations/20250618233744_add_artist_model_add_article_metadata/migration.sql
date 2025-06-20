/*
  Warnings:

  - A unique constraint covering the columns `[artistId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "artistId" TEXT;

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "portfolioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleMetadata" (
    "id" TEXT NOT NULL,
    "shopifyArticleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "customCategory" TEXT,
    "seoScore" INTEGER,
    "estimatedReadTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleMetadata_shopifyArticleId_key" ON "ArticleMetadata"("shopifyArticleId");

-- CreateIndex
CREATE INDEX "ArticleMetadata_authorId_idx" ON "ArticleMetadata"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "users_artistId_key" ON "users"("artistId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleMetadata" ADD CONSTRAINT "ArticleMetadata_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
