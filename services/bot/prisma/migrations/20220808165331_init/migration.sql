-- CreateTable
CREATE TABLE "LinkFilter" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "severity" "Severity" NOT NULL,
    "creatorId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "infractionPoints" INTEGER NOT NULL,

    CONSTRAINT "LinkFilter_pkey" PRIMARY KEY ("id")
);
