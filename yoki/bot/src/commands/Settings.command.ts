import { Embed } from "@guildedjs/embeds";

import { RoleType } from "../typings";
import { Colors } from "../utils/color";
import { bold, inlineCode } from "../utils/formatters";
import { Category } from "./Category";
import type { Command } from "./Command";

const viewSettings = [
	["id", "string"],
	["prefix", "string"],
	["locale", "string"],
	["timezone", "string"],

	["muteRoleId", "string"],
	["linkSeverity", "string"],

	["muteInfractionThreshold", "string"],
	["muteInfractionDuration", "string"],

	["kickInfractionThreshold", "string"],
	["banInfractionThreshold", "string"],
	["softbanInfractionThreshold", "string"],

	["antiRaidEnabled", "boolean"],
	["antiRaidAgeFilter", "string"],
	["antiRaidChallengeChannel", "string"],
	["memberRoleId", "string"],

	["appealsEnabled", "boolean"],
	["appealChannelId", "string"],

	["modmailEnabled", "boolean"],
	["modmailGroupId", "string"],
	["modmailGroupCategoryId", "string"],

	["filterEnabled", "boolean"],
	["filterOnMods", "boolean"],
	["filterInvites", "boolean"],
	["antiHoistEnabled", "boolean"],
	["scanNSFW", "boolean"],

	["spamFrequency", "string"],
	["spamMentionFrequency", "string"]
] as const;
const Settings: Command = {
	name: "settings",
	description: "View the settings of this server",
	usage: "",
	examples: [""],
	category: Category.Settings,
	requiredRole: RoleType.ADMIN,
	args: [],
	execute: async (message, _args, ctx, commandCtx) => {
		const embed = new Embed();
		let description = "";

		for (const [propKey, type] of viewSettings) {
			description += `${bold(propKey)} - `;
			if (type === "string") description += commandCtx.server[propKey] ? inlineCode(commandCtx.server[propKey]) : "not set";
			else if (type === "boolean") description += bold(commandCtx.server[propKey] ? ":x:" : ":check:");
			description += "\n";
		}

		embed.setTitle("Settings for this server");
		embed.setColor(Colors.blockBackground);
		embed.setDescription(description);

		return ctx.messageUtil.send(message.channelId, embed);
	},
};

export default Settings;
