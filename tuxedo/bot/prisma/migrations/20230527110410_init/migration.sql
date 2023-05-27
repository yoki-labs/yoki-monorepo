-- CreateTable
CREATE TABLE "Currency" (
    "id" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "tag" VARCHAR(16) NOT NULL,
    "startingBalance" INTEGER,
    "maximumBalance" INTEGER,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerMember" (
    "id" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "balance" JSONB NOT NULL,

    CONSTRAINT "ServerMember_pkey" PRIMARY KEY ("id")
);
