-- CreateTable
CREATE TABLE "private_room_users" (
    "id" TEXT NOT NULL,
    "privateRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "private_room_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "private_room_users_privateRoomId_userId_key" ON "private_room_users"("privateRoomId", "userId");

-- AddForeignKey
ALTER TABLE "private_room_users" ADD CONSTRAINT "private_room_users_privateRoomId_fkey" FOREIGN KEY ("privateRoomId") REFERENCES "private_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_room_users" ADD CONSTRAINT "private_room_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data from private_rooms.userId to private_room_users
INSERT INTO "private_room_users" ("id", "privateRoomId", "userId", "assignedAt")
SELECT 
    gen_random_uuid(),
    "id",
    "userId",
    "createdAt"
FROM "private_rooms"
WHERE "userId" IS NOT NULL;

-- AlterTable: Make userId nullable in private_rooms (for backward compatibility during transition)
ALTER TABLE "private_rooms" ALTER COLUMN "userId" DROP NOT NULL;

-- DropIndex: Remove unique constraint on userId and name (since rooms can now have multiple users)
DROP INDEX IF EXISTS "private_rooms_userId_name_key";

