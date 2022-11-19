/*
  Warnings:

  - A unique constraint covering the columns `[serverId,content,matching]` on the table `ContentFilter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serverId,name,content]` on the table `CustomTag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serverId,forumTopicId]` on the table `ForumTopic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serverId,targetServerId]` on the table `InviteFilter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serverId,channelId,type]` on the table `LogChannel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[messageId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serverId,channelId,messageId,emoteId,actionType]` on the table `ReactionAction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serverId,roleId,type]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serverId,domain]` on the table `UrlFilter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ContentFilter_serverId_content_matching_key" ON "ContentFilter"("serverId", "content", "matching");

-- CreateIndex
CREATE UNIQUE INDEX "CustomTag_serverId_name_content_key" ON "CustomTag"("serverId", "name", "content");

-- CreateIndex
CREATE UNIQUE INDEX "ForumTopic_serverId_forumTopicId_key" ON "ForumTopic"("serverId", "forumTopicId");

-- CreateIndex
CREATE UNIQUE INDEX "InviteFilter_serverId_targetServerId_key" ON "InviteFilter"("serverId", "targetServerId");

-- CreateIndex
CREATE UNIQUE INDEX "LogChannel_serverId_channelId_type_key" ON "LogChannel"("serverId", "channelId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Message_messageId_key" ON "Message"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "ReactionAction_serverId_channelId_messageId_emoteId_actionT_key" ON "ReactionAction"("serverId", "channelId", "messageId", "emoteId", "actionType");

-- CreateIndex
CREATE UNIQUE INDEX "Role_serverId_roleId_type_key" ON "Role"("serverId", "roleId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "UrlFilter_serverId_domain_key" ON "UrlFilter"("serverId", "domain");
