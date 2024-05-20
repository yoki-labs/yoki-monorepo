import FormData from "form-data";
import rest, { mediaRest } from "../guilded";
import { generateUserJoinBanner } from "../../../common";
import { ServerMember } from "@guildedjs/api/types/generated/router/models/ServerMember";
import { Colors } from "@yokilabs/utils";

export async function handleWelcome(serverId: string, channelId: string, userId: string) {
    console.log("A");
    const { member } = await rest.router.members.serverMemberRead({ serverId, userId });

    console.log("Member", member);
    const welcomeUrl = await createWelcomeBanner(member);

    console.log("Welcome URL", { welcomeUrl });
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
    
    const [, response] = await mediaRest.make({
        path: "/upload",
        isFormData: true,
        method: "POST",
        body: formData,
        query: { dynamicMediaTypeId: "ContentMedia" },
    }, true, 1, { bodyIsJSON: false });
    
    return (await response as { url: string }).url;
}

const generateFormIdNum = () => Math.floor(Math.random() * 9999999) + 1000000;