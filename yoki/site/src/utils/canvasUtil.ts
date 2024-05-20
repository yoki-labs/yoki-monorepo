import { ServerMember } from "@guildedjs/api/types/generated/router/models/ServerMember";
import { Colors } from "@yokilabs/utils";
import FormData from "form-data";

import rest, { mediaRest } from "../guilded";
import { generateUserJoinBanner } from "../../../common";

export async function handleWelcome(serverId: string, channelId: string, userId: string) {
    const { member } = await rest.router.members.serverMemberRead({ serverId, userId });

    const welcomeUrl = await createWelcomeBanner(member);

    return rest.router.chat.channelMessageCreate({
        channelId,
        requestBody: {
            embeds: [
                {
                    color: Colors.blockBackground,
                    title: `<@${userId}> just joined!`,
                    image: {
                        url: welcomeUrl,
                    },
                },
            ],
        },
    });
}

// Copy-pasted code basically
async function createWelcomeBanner(member: ServerMember) {
    const welcomeBuffer = await generateUserJoinBanner(member.user.name, member.user.avatar);

    return uploadMedia(welcomeBuffer, `welcome-${member.user.id}.png`, `image/png`);
}

async function uploadMedia(buffer: Buffer, filename: string, contentType: string) {
    const formData = new FormData();

    formData.append("uploadTrackingId", `r-${generateFormIdNum()}-${generateFormIdNum()}`);
    formData.append("file", buffer, { filename, contentType });

    const [, response] = await mediaRest.make(
        {
            path: "/upload",
            isFormData: true,
            method: "POST",
            body: formData,
            query: { dynamicMediaTypeId: "ContentMedia" },
        },
        true,
        1,
        { bodyIsJSON: false }
    );

    return ((await response) as { url: string }).url;
}

const generateFormIdNum = () => Math.floor(Math.random() * 9999999) + 1000000;
