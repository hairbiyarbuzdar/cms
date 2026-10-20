-- AlterTable
ALTER TABLE "patient" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" DATE,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "patientNumber" SERIAL NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "registrationKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "patient_patientNumber_key" ON "patient"("patientNumber");

-- CreateIndex
CREATE UNIQUE INDEX "patient_registrationKey_key" ON "patient"("registrationKey");
