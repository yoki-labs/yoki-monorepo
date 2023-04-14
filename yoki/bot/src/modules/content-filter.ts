import { ContentFilter, FilterMatching, Preset } from "@prisma/client";
import { Colors } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import { Message, UserType, WebhookEmbed } from "guilded.js";

import { ContentFilterScan, Server, Severity } from "../typings";
import { IMAGE_REGEX } from "../utils/matching";
import { wordPresets } from "../utils/presets";
import BaseFilterUtil from "./base-filter";
import { ImageFilterUtil } from "./image-filter";

export const transformSeverityStringToEnum = (str: string): Severity | undefined => Severity[str.toUpperCase()];
export enum FilteredContent {
	Message = 0,
	Channel = 1,
	ChannelContent = 2,
	ServerContent = 3,
}

export class ContentFilterUtil extends BaseFilterUtil {
	readonly imageFilterUtil = new ImageFilterUtil(this.client);
	readonly presets = wordPresets;

	async scanMessageMedia(message: Message): Promise<void> {
		const { serverId, channelId, content, authorId: userId, id: messageId } = message;
		const matches = [...content.matchAll(IMAGE_REGEX)];
		if (!matches.length) return;

		void this.client.amp.logEvent({
			event_type: "MESSAGE_MEDIA_SCAN",
			user_id: userId,
			event_properties: { serverId },
		});

		for (const [_, url] of matches) {
			const result = await this.imageFilterUtil.scanImage(url).catch(() => void 0);
			if (result) {
				void this.client.amp.logEvent({
					event_type: "MESSAGE_MEDIA_ACTION",
					user_id: userId,
					event_properties: { serverId },
				});

				this.client.messages.delete(channelId, messageId).catch(() => null);
				await this.client.messageUtil.sendWarningBlock(
					channelId,
					"Inappropriate Image!",
					`<@${userId}>, our filters have detected that an image attached to your message is inappropriate and has been deleted.`,
					undefined,
					{ isPrivate: true }
				);
				return;
			}
		}
	}

	// This will scan any content that is piped into it for breaking the content filter or preset list and will apply the associated punishment in the final param as a callback
	async scanContent({
		userId,
		text,
		filteredContent,
		channelId,
		server,
		presets,
		resultingAction,
	}: {
		userId: string;
		text: string;
		filteredContent: FilteredContent;
		channelId: string | null;
		server: Server;
		presets?: Preset[];
		resultingAction: () => unknown;
	}) {
		// If the bot is the one who did this action, ignore.
		if (userId === this.client.user!.id) return void 0;
		const { serverId } = server;

		// Get all the banned words in this server
		const bannedWordsList = await this.client.dbUtil.getBannedWords(serverId);
		// Get all the enabled presets in this server
		const enabledPresets = (presets ?? (await this.client.dbUtil.getEnabledPresets(serverId))).filter((x) => x.preset in this.presets);

		if (!bannedWordsList.length && !enabledPresets.length) return;
		void this.client.amp.logEvent({ event_type: "MESSAGE_TEXT_SCAN", user_id: userId, event_properties: { serverId: server.serverId } });

		// Sanitize data into standard form
		const lowerCasedMessageContent = text.toLowerCase();
		const split = lowerCasedMessageContent.split(/[ \t\n-.?!,—]/g);
		// Check if any word triggers the content filter (user provided words). Checks if message content includes a word
		const ifTriggersCustom: ContentFilterScan | undefined = bannedWordsList.find((word) => this.tripsFilter(word, split));

		// This will check if the message content contains any words listed in any enabled presets
		let ifTriggersPreset: ContentFilterScan | undefined;
		// ONLY if the content doesn't already violate a custom filter
		if (!ifTriggersCustom) {
			for (const enabledPreset of enabledPresets) {
				// Get the enabled preset list (slurs, etc.)
				const presetPattern = this.presets[enabledPreset.preset as keyof typeof this.presets];
				// Find first word that is matched with preset's regex
				const foundPresetWord = presetPattern.exec(lowerCasedMessageContent);

				if (foundPresetWord !== null) {
					// if the content does violate a preset, hoist the triggering word
					ifTriggersPreset = {
						content: foundPresetWord[0],
						matching: FilterMatching.WORD,
						infractionPoints: enabledPreset.infractionPoints ?? 5,
						severity: enabledPreset.severity ?? Severity.WARN,
					};
					break;
				}
			}
		}

		// Get the triggering word from either a custom filter or from a preset
		const triggeredWord = (ifTriggersCustom ?? ifTriggersPreset) as ContentFilterScan | undefined;

		// If the content does not violate any filters or presets, ignore
		if (!triggeredWord) return void 0;

		// By now, we assume the member has violated a filter or preset
		// Get the member from cache or API
		const member = await this.client.members.fetch(serverId, userId);

		// Don't moderate bots
		if (member.user!.type === UserType.Bot) return;

		// Get all the mod roles in this server
		const modRoles = await this.client.prisma.role.findMany({ where: { serverId } });

		// If the server doesn't have "filterOnMods" setting enabled and a mod violates the filter/preset, ignore
		if (!server.filterOnMods && modRoles.some((modRole) => member.roleIds.includes(modRole.roleId))) return;

		// Check whether this member exceeds the infraction threshold for this server
		const exceededThreshold = await this.getMemberExceedsThreshold(server, userId, triggeredWord.infractionPoints);

		void this.client.amp.logEvent({
			event_type: "AUTOMOD_ACTION",
			user_id: userId,
			event_properties: { serverId, action: exceededThreshold ?? triggeredWord.severity, infractionPoints: triggeredWord.infractionPoints },
		});

		// Add this action to the database
		const createdCase = await this.client.dbUtil.addAction({
			serverId,
			// Whether this action is a result of the threshold exceeding or a severity
			type: exceededThreshold ?? triggeredWord.severity,
			// The bot ID
			executorId: this.client.user!.id,
			// The reason for this action, whether it's the threshold exceeded or a filter was violated
			reason: `[AUTOMOD] Content filter tripped.${exceededThreshold ? ` ${exceededThreshold} threshold exceeded.` : ""}`,
			// The offending content
			triggerContent: triggeredWord.content,
			// The place where unmute messages will happen
			channelId,
			// The offending user
			targetId: userId,
			// Whether this case will expire (mutes)
			expiresAt: (exceededThreshold ?? triggeredWord.severity) === Severity.MUTE ? new Date(server.muteInfractionDuration ? Date.now() + server.muteInfractionDuration : Date.now() + 1000 * 60 * 60 * 12) : null,
			// The amount of infraction points this specific word gives
			infractionPoints: triggeredWord.infractionPoints,
		});

		// If a modlog channel is set
		this.client.emitter.emit("ActionIssued", createdCase, server, this.client);

		try {
			// Perform resulting action, for message filtering it's deleting the original message
			await resultingAction();
		} catch (err: any) {
			if (err instanceof Error) await this.client.errorHandler.send("Error in filtering callback", [new WebhookEmbed().setDescription(stripIndents`${err.stack}`).setColor("RED")]);
		}

		// Execute the punishing action. If this is a threshold exceeding, execute the punishment associated with the exceeded threshold
		// Otherwise, execute the action associated with this specific filter word or preset entry
		return exceededThreshold
			? this.severityAction[exceededThreshold](member.user!.id, server, channelId, filteredContent, null)
			: this.severityAction[triggeredWord.severity]?.(member.user!.id, server, channelId, filteredContent, null);
	}

	tripsFilter(contentFilter: ContentFilter | Omit<ContentFilterScan, "severity">, words: string[]) {
		// return contentFilter.matching === FilterMatching.WORD ? message.includes(contentFilter.content) :
		return words.some((word) => this.matchesFilter(contentFilter, word));
	}

	matchesFilter(contentFilter: ContentFilter | Omit<ContentFilterScan, "severity">, phrase: string) {
		// word -> *word* -> *word => word*
		return contentFilter.matching === FilterMatching.WORD
			? phrase === contentFilter.content
			: contentFilter.matching === FilterMatching.INFIX
				? phrase.includes(contentFilter.content)
				: contentFilter.matching === FilterMatching.POSTFIX
					? phrase.endsWith(contentFilter.content)
					: phrase.startsWith(contentFilter.content);
	}

	override onUserWarn(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
		// When channels and messages get filtered
		if (filteredContent < FilteredContent.ChannelContent)
			return this.client.messageUtil.sendWarningBlock(
				channelId!,
				`Cannot use that word`,
				`**Alert:** <@${userId}>, you have used a filtered word. This is a warning for you to not use it again, otherwise moderation actions may be taken against you.`,
				undefined,
				{ isPrivate: true }
			);
		// TODO: DM user
		return 0;
	}

	override onUserMute(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
		// When channels and messages get filtered
		if (filteredContent < FilteredContent.ChannelContent)
			return this.client.messageUtil.sendEmbed(
				channelId!,
				{
					title: `:mute: You have been muted`,
					description: `**Alert:** <@${userId}>, you have been muted for using a filtered word excessively. Please reach out to staff if this was in error.`,
					color: Colors.red,
				},
				{
					isPrivate: true,
				}
			);
		// TODO: DM user
		return 0;
	}
}
