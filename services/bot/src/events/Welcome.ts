import type { WSWelcomePayload } from "@guildedjs/guilded-api-typings";

import type Client from "../Client";

export default (data: WSWelcomePayload["d"]["user"], client: Client) => {
    // user ID of bot
    client.userId = data.id;

    // creator of the bot
    client.ownerId = data.createdBy;

    // parsing the env variable of operators (string1,string2,string3) and setting to array
    client.operators = process.env.OPERATOR_IDS?.split(",") ?? [];

    // add owner of bot to operators list
    client.operators.push(client.ownerId);
};
