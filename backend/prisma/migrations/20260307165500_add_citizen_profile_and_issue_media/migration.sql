-- AlterTable
ALTER TABLE "issues" DROP COLUMN "location",
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "video_url" TEXT;

-- CreateTable
CREATE TABLE "citizen_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "age" INTEGER,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizen_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "citizen_profiles_user_id_key" ON "citizen_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "citizen_profiles" ADD CONSTRAINT "citizen_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
