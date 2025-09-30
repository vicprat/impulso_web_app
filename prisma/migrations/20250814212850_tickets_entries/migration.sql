-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('BLOG', 'EVENT');

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "postType" "PostType" NOT NULL DEFAULT 'BLOG';

-- CreateIndex
CREATE INDEX "blog_posts_postType_idx" ON "blog_posts"("postType");

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
