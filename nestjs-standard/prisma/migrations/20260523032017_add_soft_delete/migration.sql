-- AlterTable
ALTER TABLE "posts" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "deletedAt" DATETIME;
