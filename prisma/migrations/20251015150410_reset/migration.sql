-- CreateEnum
CREATE TYPE "public"."ArtistsEnum" AS ENUM ('IMPULSO', 'COLLECTIVE');

-- AlterTable
ALTER TABLE "public"."Artist" ADD COLUMN     "artistType" "public"."ArtistsEnum" NOT NULL DEFAULT 'IMPULSO';
