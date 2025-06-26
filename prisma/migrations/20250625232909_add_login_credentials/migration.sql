-- CreateTable
CREATE TABLE "login_credentials" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "company" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_credentials_email_key" ON "login_credentials"("email");

-- CreateIndex
CREATE INDEX "login_credentials_email_idx" ON "login_credentials"("email");

-- CreateIndex
CREATE INDEX "login_credentials_is_active_idx" ON "login_credentials"("is_active");
