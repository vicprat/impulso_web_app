-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "shopifyGid" TEXT NOT NULL,
    "title" TEXT,
    "handle" TEXT,
    "vendor" TEXT,
    "currentLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."location_history" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "location_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_shopifyGid_key" ON "public"."products"("shopifyGid");

-- CreateIndex
CREATE INDEX "products_currentLocationId_idx" ON "public"."products"("currentLocationId");

-- CreateIndex
CREATE INDEX "location_history_productId_idx" ON "public"."location_history"("productId");

-- CreateIndex
CREATE INDEX "location_history_locationId_idx" ON "public"."location_history"("locationId");

-- CreateIndex
CREATE INDEX "location_history_changedAt_idx" ON "public"."location_history"("changedAt");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."location_history" ADD CONSTRAINT "location_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."location_history" ADD CONSTRAINT "location_history_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
