/*
  Warnings:

  - You are about to drop the column `type_payment_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_type_payment_id_fkey";

-- DropIndex
DROP INDEX "payments_type_payment_id_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "type_payment_id";

-- CreateTable
CREATE TABLE "_PaymentToTypePayment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PaymentToTypePayment_AB_unique" ON "_PaymentToTypePayment"("A", "B");

-- CreateIndex
CREATE INDEX "_PaymentToTypePayment_B_index" ON "_PaymentToTypePayment"("B");

-- AddForeignKey
ALTER TABLE "_PaymentToTypePayment" ADD CONSTRAINT "_PaymentToTypePayment_A_fkey" FOREIGN KEY ("A") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentToTypePayment" ADD CONSTRAINT "_PaymentToTypePayment_B_fkey" FOREIGN KEY ("B") REFERENCES "type_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
