/*
  Warnings:

  - A unique constraint covering the columns `[prompt]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_prompt_key" ON "Course"("prompt");
