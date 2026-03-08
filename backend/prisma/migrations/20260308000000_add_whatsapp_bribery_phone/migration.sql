-- AlterTable: add phone and whatsapp_verified to citizen_profiles
ALTER TABLE "citizen_profiles"
    ADD COLUMN "phone" VARCHAR(20),
    ADD COLUMN "whatsapp_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex: phone must be unique when set
CREATE UNIQUE INDEX "citizen_profiles_phone_key" ON "citizen_profiles"("phone");

-- CreateTable: whatsapp_users
CREATE TABLE "whatsapp_users" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chat_id" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "otp" VARCHAR(255),
    "otp_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_users_user_id_key" ON "whatsapp_users"("user_id");

-- AddForeignKey
ALTER TABLE "whatsapp_users" ADD CONSTRAINT "whatsapp_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: bribery_complaints
CREATE TABLE "bribery_complaints" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "badge_number" VARCHAR(50) NOT NULL,
    "complaint_type" VARCHAR(100) NOT NULL,
    "other_complaint_type" VARCHAR(255),
    "description" TEXT NOT NULL,
    "incident_at" TIMESTAMP(3) NOT NULL,
    "location" VARCHAR(255),
    "challan_number" VARCHAR(30),
    "amount_demanded" INTEGER,
    "media_urls" TEXT[],
    "status" VARCHAR(30) NOT NULL DEFAULT 'submitted',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bribery_complaints_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bribery_complaints" ADD CONSTRAINT "bribery_complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
