-- CreateTable
CREATE TABLE "payments"."type_payments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "type_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type_payment_id" TEXT NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "type_payments_name_key" ON "payments"."type_payments"("name");

-- CreateIndex
CREATE INDEX "payments_type_payment_id_idx" ON "payments"."payments"("type_payment_id");

-- AddForeignKey
ALTER TABLE "payments"."payments" ADD CONSTRAINT "payments_type_payment_id_fkey" FOREIGN KEY ("type_payment_id") REFERENCES "payments"."type_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
