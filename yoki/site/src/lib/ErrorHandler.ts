import { WebhookClient, WebhookEmbed } from "@guildedjs/api";
import { stripIndents } from "common-tags";

if (!process.env.ERROR_WEBHOOK) throw new Error("Missing guilded error handler.");
const errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK, {});
export default errorHandler;

export const errorEmbed = (err: string, additional_details?: Record<string, string | number | null>) => {
    const details = additional_details
        ? Object.keys(additional_details)
              .map((key) => `${key}: \`${additional_details[key]}\``)
              .join("\n")
        : "";
    return new WebhookEmbed()
        .setDescription(
            stripIndents`
				${details}
				${err.slice(0, 1350)}
            `
        )
        .setColor("RED");
};
