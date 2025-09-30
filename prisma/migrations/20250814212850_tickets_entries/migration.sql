-- CreateEnum (only if not exists)
DO $$ BEGIN
    CREATE TYPE "PostType" AS ENUM ('BLOG', 'EVENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable (only if columns don't exist)
DO $$ BEGIN
    ALTER TABLE "blog_posts" ADD COLUMN "date" TIMESTAMP(3);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "blog_posts" ADD COLUMN "location" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "blog_posts" ADD COLUMN "postType" "PostType" NOT NULL DEFAULT 'BLOG';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- CreateIndex (only if not exists)
DO $$ BEGIN
    CREATE INDEX "blog_posts_postType_idx" ON "blog_posts"("postType");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- AlterTable tickets (only if columns don't exist)
DO $$ BEGIN
    ALTER TABLE "tickets" ADD COLUMN "orderId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tickets" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
