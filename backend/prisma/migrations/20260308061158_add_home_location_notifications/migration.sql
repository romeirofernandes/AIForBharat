-- AlterTable
ALTER TABLE "citizen_profiles" ADD COLUMN     "email_notifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "home_latitude" DOUBLE PRECISION,
ADD COLUMN     "home_longitude" DOUBLE PRECISION;
