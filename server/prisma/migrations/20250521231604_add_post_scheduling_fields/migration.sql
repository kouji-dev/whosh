-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "error" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Post_status_scheduledFor_idx" ON "Post"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");
