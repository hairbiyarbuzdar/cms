-- AlterTable
ALTER TABLE "patient" ADD COLUMN     "ageAtRegistration" INTEGER,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "patient_externalId_key" ON "patient"("externalId");

ALTER TABLE "patient" ADD CONSTRAINT "patient_age_range" CHECK ("ageAtRegistration" IS NULL OR "ageAtRegistration" BETWEEN 0 AND 130);
