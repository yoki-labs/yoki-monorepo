import { Embed, WebhookClient } from "@guildedjs/webhook-client";

if (!process.env.ERROR_WEBHOOK) throw new Error("Missing guilded error handler.");
const errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK, {});
export default errorHandler;

export const errorEmbed = (err: Error, additional_details?: Record<string, string | number | null>) =>
    new Embed()
        .setDescription(
            `${Object.keys(additional_details as object)
                .map((key) => `${key}: \`${additional_details?.[key]}\``)
                .join("\n")}\n${err.stack ?? err.message ?? JSON.stringify(err).slice(0, 1350)}`
        )
        .setColor("RED");
