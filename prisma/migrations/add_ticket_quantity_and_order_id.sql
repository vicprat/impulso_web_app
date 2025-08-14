-- Agregar campos quantity y orderId a la tabla tickets
ALTER TABLE "tickets" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "tickets" ADD COLUMN "orderId" TEXT;

-- Crear índice para mejorar el rendimiento de consultas por orderId
CREATE INDEX "tickets_orderId_idx" ON "tickets"("orderId");

-- Actualizar tickets existentes para tener quantity = 1
UPDATE "tickets" SET "quantity" = 1 WHERE "quantity" IS NULL;
