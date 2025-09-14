/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "local"."Order" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_slug_key" ON "local"."Order"("slug");
