/*
  Warnings:

  - You are about to drop the column `urlFilterInfractionPoints` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `urlFilterSeverity` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "urlFilterInfractionPoints",
DROP COLUMN "urlFilterSeverity",
ADD COLUMN     "linkInfractionPoints" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "linkSeverity" "Severity" NOT NULL DEFAULT 'WARN';
