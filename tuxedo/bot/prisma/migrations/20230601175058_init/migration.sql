-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('MINIMOD', 'MOD', 'ADMIN');

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "RoleType" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_serverId_roleId_type_key" ON "Role"("serverId", "roleId", "type");
