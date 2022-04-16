/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `referenceId` on the `Action` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
DROP COLUMN "referenceId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Action_id_seq";
