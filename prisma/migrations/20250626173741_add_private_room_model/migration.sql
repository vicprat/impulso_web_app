-- CreateTable
CREATE TABLE "private_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "private_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_room_products" (
    "id" TEXT NOT NULL,
    "privateRoomId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "private_room_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "private_rooms_userId_name_key" ON "private_rooms"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "private_room_products_privateRoomId_productId_key" ON "private_room_products"("privateRoomId", "productId");

-- AddForeignKey
ALTER TABLE "private_rooms" ADD CONSTRAINT "private_rooms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_room_products" ADD CONSTRAINT "private_room_products_privateRoomId_fkey" FOREIGN KEY ("privateRoomId") REFERENCES "private_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
