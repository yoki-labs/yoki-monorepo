import { Colors } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { Embed } from "guilded.js";

import type { GEvent } from "../../typings";

export default {
    execute: ([server, user, ctx]) => {
        const createdBy = user;
        void ctx.amp.logEvent({ event_type: "YOKI_SERVER_JOIN", user_id: server.id });

        if (!server.defaultChannelId) return;
        return ctx.messageUtil.sendEmbed(
            server.defaultChannelId,
            new Embed()
                .setTitle("Welcome to Yoki!")
                .setColor(Colors.green)
                .setDescription(
                    stripIndents`
  <@${createdBy}> Thank you for inviting Yoki, your moderation companion! Yoki has numerous features to help make your community safer.
  Features: \`automod\`, \`antiraid\`, \`image filter\`, \`modmail\`, \`log channels\`, \`custom commands\`, and more!

  **Getting started guides:**
  - [Configure mod roles & automod](https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/0a2069b9-2e7d-45da-9121-ab3b463f9af2/docs/318919) 🤖
  - [Set up modmail](https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/0a2069b9-2e7d-45da-9121-ab3b463f9af2/docs/324894) 📧
  - [Enable antiraid & captchas](https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/0a2069b9-2e7d-45da-9121-ab3b463f9af2/docs/343700) 🛑
  - [Filter invites & links](https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/0a2069b9-2e7d-45da-9121-ab3b463f9af2/docs/347910) 🔗
  - [Scan NSFW images](https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/0a2069b9-2e7d-45da-9121-ab3b463f9af2/docs/348823)

  Want to explore more commands? Run the \`?help\` command!
  🔗[Support Server](https://yoki.gg/support) • 🖥️ [Website](https://yoki.gg)"

  `
                )
                .toJSON(),
            { isPrivate: true }
        );
    },
    name: "botServerCreated",
} satisfies GEvent<"botServerCreated">;
