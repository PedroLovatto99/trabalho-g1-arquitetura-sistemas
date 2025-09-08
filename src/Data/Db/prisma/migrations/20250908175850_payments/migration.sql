/*
  Warnings:

  - You are about to drop the column `client_name` on the `Order` table. All the data in the column will be lost.
  - Added the required column `client_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "local"."ProductsOnOrders" DROP CONSTRAINT "ProductsOnOrders_order_id_fkey";

-- AlterTable
ALTER TABLE "local"."Order" DROP COLUMN "client_name",
ADD COLUMN     "client_id" TEXT NOT NULL,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "local"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local"."Status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local"."TypePayment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TypePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local"."OrderPayment" (
    "id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "order_id" TEXT NOT NULL,
    "type_payment_id" INTEGER NOT NULL,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "local"."Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Status_name_key" ON "local"."Status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TypePayment_name_key" ON "local"."TypePayment"("name");

-- AddForeignKey
ALTER TABLE "local"."Order" ADD CONSTRAINT "Order_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "local"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local"."Order" ADD CONSTRAINT "Order_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "local"."Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local"."OrderPayment" ADD CONSTRAINT "OrderPayment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "local"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local"."OrderPayment" ADD CONSTRAINT "OrderPayment_type_payment_id_fkey" FOREIGN KEY ("type_payment_id") REFERENCES "local"."TypePayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local"."ProductsOnOrders" ADD CONSTRAINT "ProductsOnOrders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "local"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
