-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "antiRaidChallengeChannel" VARCHAR(255);

-- CreateTable
CREATE TABLE "Captcha" (
    "id" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "triggeringUser" VARCHAR(255) NOT NULL,

    CONSTRAINT "Captcha_pkey" PRIMARY KEY ("id")
);
