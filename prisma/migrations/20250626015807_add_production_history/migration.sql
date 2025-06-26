-- CreateTable
CREATE TABLE "production_history" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "production_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "production_history_product_id_idx" ON "production_history"("product_id");

-- CreateIndex
CREATE INDEX "production_history_production_date_idx" ON "production_history"("production_date");

-- AddForeignKey
ALTER TABLE "production_history" ADD CONSTRAINT "production_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
