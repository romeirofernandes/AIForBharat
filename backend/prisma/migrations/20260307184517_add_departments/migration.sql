-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- AlterTable
ALTER TABLE "issues" ADD COLUMN "department_id" INTEGER;
ALTER TABLE "issues" ADD COLUMN "incident_type" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Default Departments inserted here so they are ready out-of-the-box
INSERT INTO "departments" ("name", "description", "updated_at") VALUES 
('Roads & Transport', 'Issues related to roads, transport, and traffic', CURRENT_TIMESTAMP),
('Sanitation & Cleaning', 'Issues related to cleanliness and waste management', CURRENT_TIMESTAMP),
('Water Supply & Sewerage', 'Issues related to water supply, leaks, and sewage', CURRENT_TIMESTAMP),
('Electricity & Street Lighting', 'Issues related to power and street lights', CURRENT_TIMESTAMP),
('Public Works Department', 'Issues related to public infrastructure and buildings', CURRENT_TIMESTAMP),
('Other', 'Other miscellaneous issues', CURRENT_TIMESTAMP);
