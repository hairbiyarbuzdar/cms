-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('COMPLETED', 'VOID', 'REFUNDED');

-- CreateTable
CREATE TABLE "patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stockOnHand" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale" (
    "id" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SaleStatus" NOT NULL DEFAULT 'COMPLETED',
    "patientId" TEXT,

    CONSTRAINT "sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "saleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_registeredAt_idx" ON "patient"("registeredAt");

-- CreateIndex
CREATE INDEX "sale_status_soldAt_idx" ON "sale"("status", "soldAt");

-- CreateIndex
CREATE INDEX "sale_patientId_idx" ON "sale"("patientId");

-- CreateIndex
CREATE INDEX "saleItem_saleId_idx" ON "saleItem"("saleId");

-- CreateIndex
CREATE INDEX "saleItem_medicineId_idx" ON "saleItem"("medicineId");

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saleItem" ADD CONSTRAINT "saleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saleItem" ADD CONSTRAINT "saleItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "medicine" ADD CONSTRAINT "medicine_stock_nonnegative" CHECK ("stockOnHand" >= 0 AND "reorderLevel" >= 0);
ALTER TABLE "saleItem" ADD CONSTRAINT "saleItem_positive_quantity" CHECK ("quantity" > 0);
ALTER TABLE "saleItem" ADD CONSTRAINT "saleItem_nonnegative_price" CHECK ("unitPrice" >= 0);
