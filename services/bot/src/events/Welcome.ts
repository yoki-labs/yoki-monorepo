import type { WSWelcomePayload } from "@guildedjs/guilded-api-typings";

import type Client from "../Client";

export default (data: WSWelcomePayload["d"]["user"], client: Client) => {
    client.userId = data.id;
    client.ownerId = data.createdBy;
};
