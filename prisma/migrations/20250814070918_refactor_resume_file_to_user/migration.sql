/*
  Warnings:

  - You are about to drop the column `resumeId` on the `ResumeFile` table. All the data in the column will be lost.
  - Added the required column `userId` to the `ResumeFile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ResumeFile" DROP CONSTRAINT "ResumeFile_resumeId_fkey";

-- AlterTable
ALTER TABLE "public"."ResumeFile" DROP COLUMN "resumeId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ResumeFile" ADD CONSTRAINT "ResumeFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
