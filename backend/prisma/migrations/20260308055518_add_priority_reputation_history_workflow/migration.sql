-- AlterTable
ALTER TABLE "issues" ADD COLUMN     "priority_score" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reputation_score" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "issue_history" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "actor_role" VARCHAR(20) NOT NULL,
    "actor_id" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_workflows" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER,
    "cluster_key" VARCHAR(500),
    "flow_json" JSONB NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "step_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "evidence_url" TEXT,
    "assigned_to" VARCHAR(255),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "issue_history" ADD CONSTRAINT "issue_history_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_history" ADD CONSTRAINT "issue_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_workflows" ADD CONSTRAINT "issue_workflows_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "issue_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
