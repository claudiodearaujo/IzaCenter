-- CreateIndex
CREATE INDEX "appointments_client_id_idx" ON "appointments"("client_id");

-- CreateIndex
CREATE INDEX "appointments_scheduled_date_idx" ON "appointments"("scheduled_date");

-- CreateIndex
CREATE INDEX "appointments_client_id_scheduled_date_idx" ON "appointments"("client_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "appointments_scheduled_date_status_idx" ON "appointments"("scheduled_date", "status");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "orders_client_id_idx" ON "orders"("client_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_client_id_status_idx" ON "orders"("client_id", "status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");

-- CreateIndex
CREATE INDEX "products_product_type_idx" ON "products"("product_type");

-- CreateIndex
CREATE INDEX "products_is_active_is_featured_idx" ON "products"("is_active", "is_featured");

-- CreateIndex
CREATE INDEX "readings_client_id_idx" ON "readings"("client_id");

-- CreateIndex
CREATE INDEX "readings_status_idx" ON "readings"("status");

-- CreateIndex
CREATE INDEX "readings_client_id_status_idx" ON "readings"("client_id", "status");

-- CreateIndex
CREATE INDEX "readings_published_at_idx" ON "readings"("published_at");

-- CreateIndex
CREATE INDEX "readings_reading_date_idx" ON "readings"("reading_date");
