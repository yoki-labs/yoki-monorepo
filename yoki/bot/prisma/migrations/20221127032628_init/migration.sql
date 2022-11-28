-- CreateTable
CREATE TABLE "Appeal" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serverId" VARCHAR(255) NOT NULL,
	"creatorId" VARCHAR(255) NOT NULL,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);
