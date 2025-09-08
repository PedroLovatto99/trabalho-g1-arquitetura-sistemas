/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `OrderPayment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ProductsOnOrders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `OrderPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ProductsOnOrders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "local"."Client" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "local"."OrderPayment" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "local"."ProductsOnOrders" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "local"."Client"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_slug_key" ON "local"."OrderPayment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductsOnOrders_slug_key" ON "local"."ProductsOnOrders"("slug");
