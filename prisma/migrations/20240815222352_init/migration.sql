-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "learningPlan" JSONB,
    "creatorAddress" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_id_key" ON "Course"("id");
