-- CreateTable
CREATE TABLE "ForumTopic" (
    "forumTopicId" INTEGER NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "authorId" VARCHAR(255) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embeds" JSONB,
    "isBot" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ForumTopic_pkey" PRIMARY KEY ("forumTopicId")
);
