-- AlterTable
ALTER TABLE "PlatformConnection" ADD COLUMN     "parentConnectionId" TEXT;

-- AddForeignKey
ALTER TABLE "PlatformConnection" ADD CONSTRAINT "PlatformConnection_parentConnectionId_fkey" FOREIGN KEY ("parentConnectionId") REFERENCES "PlatformConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
