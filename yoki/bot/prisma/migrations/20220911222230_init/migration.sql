-- CreateTable
CREATE TABLE "RoleState" (
    "serverId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "roles" INTEGER[] DEFAULT ARRAY[]::INTEGER[]
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleState_serverId_key" ON "RoleState"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleState_serverId_userId_key" ON "RoleState"("serverId", "userId");
