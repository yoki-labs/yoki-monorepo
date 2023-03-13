import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";
import { Embed, UserType } from "guilded.js";
import { nanoid } from "nanoid";

import boolean from "../../args/boolean";
import channel from "../../args/channel";
import enumArg from "../../args/enum";
import enumList from "../../args/enumList";
import member from "../../args/member";
import number from "../../args/number";
import rest from "../../args/rest";
import string from "../../args/string";
import UUID from "../../args/UUID";
import type { CommandArgType, CommandArgValidator } from "../../commands/Command";
import { FilteredContent } from "../../modules/content-filter";
import type { GEvent, ResolvedArgs, UsedMentions } from "../../typings";
import { Colors } from "../../utils/color";
import { codeBlock, inlineCode, inlineQuote } from "../../utils/formatters";
import { moderateContent } from "../../utils/moderation";
import { roleValues } from "../../utils/util";

const argCast: Record<
	CommandArgType,
	CommandArgValidator
> = {
	string,
	number,
	boolean,
	enum: enumArg,
	enumList,
	rest,
	UUID,
	member,
	channel,
};

export default {
	execute: async ([message, ctx]) => {
		// if the message wasn't sent in a server, or the person was a bot then don't do anything
		if (message.createdByWebhookId || message.authorId === ctx.user!.id || message.authorId === "Ann6LewA" || !message.serverId) return void 0;
		void ctx.amp.logEvent({ event_type: "MESSAGE_CREATE", user_id: message.authorId, event_properties: { serverId: message.serverId! } });

		const isModmailChannel = await ctx.prisma.modmailThread.findFirst({
			where: { serverId: message.serverId!, userFacingChannelId: message.channelId, openerId: message.authorId, closed: false },
		});

		if (isModmailChannel) {
			void ctx.amp.logEvent({ event_type: "MODMAIL_MESSAGE", user_id: message.authorId, event_properties: { serverId: message.serverId!, modmailId: isModmailChannel.id } });
			void ctx.messages.delete(message.channelId, message.id);

			const member = await ctx.members.fetch(message.serverId!, message.authorId).catch(() => null);
			if (!member) return;
			const newModmailMessage = await ctx.messages.send(isModmailChannel.modFacingChannelId,
				new Embed()
					.setDescription(message.content)
					.setAuthor(member.user!.avatar ?? undefined, `${member.user!.name} (${member.user!.id})`)
					.setColor(Colors.yellow)
					.setFooter(message.id)
					.setTimestamp());
			return ctx.prisma.modmailMessage.create({
				data: {
					authorId: message.authorId,
					channelId: message.channelId,
					content: message.content,
					originalMessageId: message.id,
					sentMessageId: newModmailMessage.id,
					modmailThreadId: isModmailChannel.id,
				},
			});
		}

		const server = await ctx.dbUtil.getServer(message.serverId);
		// the prefix of this server, otherwise the fallback default prefix
		const prefix = server.getPrefix();

		// if the message does not start with the prefix
		if (!message.content.startsWith(prefix)) {
			const member = await ctx.members.fetch(message.serverId!, message.authorId).catch(() => null);
			if (member?.user?.type === UserType.Bot) return;

			// store the message in the database
			await ctx.dbUtil.storeMessage(message).catch(console.log);

			await moderateContent(ctx, server, message.channelId, "MESSAGE", FilteredContent.Message, message.authorId, message.content, message.mentions, () =>
				ctx.messages.delete(message.channelId, message.id)
			);

			if (server.scanNSFW) {
				await ctx.contentFilterUtil.scanMessageMedia(message);
			}
			return;
		}

		// parse the message into the command name and args ("?test arg1 arg2 arg3" = [ "test", "arg1", "arg2", "arg3" ])
		let [commandName, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
		// if no command name, don't do anything
		if (!commandName) return void 0;
		// lowercase the command name
		commandName = commandName.toLowerCase();

		// get the command by the name or if it's an alias of a command
		let command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
		// if not a valid command, don't do anything
		if (!command) {
			const customCommand = await ctx.prisma.customTag.findFirst({ where: { serverId: message.serverId!, name: commandName } });
			if (!customCommand) return ctx.amp.logEvent({ event_type: "INVALID_COMMAND", user_id: message.authorId, event_properties: { serverId: message.serverId! } });
			void ctx.amp.logEvent({ event_type: "TAG_RAN", user_id: message.authorId, event_properties: { serverId: message.serverId! } });
			return ctx.messageUtil.send(message.channelId, customCommand.content);
		}

		// fetch the member from either the server or the mem cache
		const member = await ctx.members.fetch(message.serverId!, message.authorId).catch(() => null);
		if (!member) return;

		// check if this user is not an operator
		if (!ctx.operators.includes(message.authorId)) {
			// if this command requires a user to have a specific role, then check if they have it
			if (command.requiredRole && !member.isOwner) {
				// get all the roles of the required type for this command
				const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId! } });
				const userModRoles = modRoles.filter((modRole) => member.roleIds.includes(modRole.roleId));
				const requiredValue = roleValues[command.requiredRole];
				// check if the user has any of the roles of this required type
				if (!userModRoles.some((role) => roleValues[role.type] >= requiredValue)) {
					void ctx.amp.logEvent({
						event_type: "COMMAND_INVALID_USER_PERMISSIONS",
						user_id: message.authorId,
						event_properties: { serverId: message.serverId! },
					});
					return ctx.messageUtil.replyWithUnpermitted(message, `Unfortunately, you are missing the ${inlineCode(command.requiredRole)} role!`);
				}
				// if this command is operator only, then silently ignore because of privacy reasons
			} else if (command.devOnly) return void 0;
		}

		while (command.parentCommand && command.subCommands?.size) {
			// if no sub command, list all the available sub commands
			if (!args[0]) {
				void ctx.amp.logEvent({
					event_type: "COMMAND_MISSING_SUBCOMMAND",
					user_id: message.authorId,
					event_properties: { serverId: message.serverId!, command: command.name },
				});
				const subCommandName = command.subCommands.firstKey();
				const subCommand = command.subCommands.get(subCommandName as string)!;

				return ctx.messageUtil.replyWithInfo(message, `${inlineCode(command.name.split("-").join(" "))} command`, command.description, {
					fields: [...ctx.messageUtil.createSubCommandFields(command.subCommands), ctx.messageUtil.createExampleField(subCommand, prefix)],
				});
			}
			const subCommand = command.subCommands.get(args[0]);
			// if not a valid sub command, list all the proper ones
			if (!subCommand) {
				void ctx.amp.logEvent({
					event_type: "COMMAND_INVALID_SUBCOMMAND",
					user_id: message.authorId,
					event_properties: { serverId: message.serverId!, command: command.name },
				});
				return ctx.messageUtil.replyWithError(message, `No such sub-command`, `The specified sub-command ${inlineQuote(args[0], 100)} could not be found.`, {
					fields: [...ctx.messageUtil.createSubCommandFields(command.subCommands), ctx.messageUtil.createExampleField(command, prefix)],
				});
			}
			command = subCommand;
			// remove the sub command from the list of args, as that's the command name
			args = args.slice(1);
		}

		// the object of casted args casted to their proper types
		const resolvedArgs: Record<string, ResolvedArgs> = {};
		const usedMentions: UsedMentions = { user: 0, role: 0, channel: 0 };
		// if this command has accepts args
		if (command.args?.length) {
			// go through all the specified arguments in the command
			for (let i = 0; i < command.args.length; i++) {
				const commandArg = command.args[i];

				// if the argument is not a rest type, is optional, and the actual argument is undefined, continue next in the args
				if (commandArg.optional && args.length <= i) {
					resolvedArgs[commandArg.name] = null;
					continue;
				}

				const [argValidator, invalidStringGenerator] = argCast[commandArg.type];

				// run the caster and see if the arg is valid
				const castArg = args[i] ? await argValidator(args[i], args, i, message, commandArg, usedMentions) : null;

				// if the arg is not valid, inform the user
				if (castArg === null || (commandArg.max && ((castArg as any).length ?? castArg) > commandArg.max)) {
					void ctx.amp.logEvent({
						event_type: "COMMAND_BAD_ARGS",
						user_id: message.authorId,
						event_properties: { serverId: message.serverId!, command: command.name, trippedArg: commandArg },
					});
					return ctx.messageUtil.replyWithError(message, "Incorrect Command Usage", stripIndents`
					For the argument \`${commandArg.name}\`, ${stripIndents(invalidStringGenerator(commandArg, castArg?.toString()))}
				
					_Need more help? [Join our support server](https://guilded.gg/Yoki)_
				`, {
						fields: [
							{
								name: "Usage",
								value: stripIndents`
								\`\`\`${prefix}${command.name.split("-").join(" ")} ${command.usage}\`\`\`
							`,
							}
						]
					});
				}

				// if the arg is valid, add it to the resolved args obj
				resolvedArgs[commandArg.name] = castArg;
			}
		}

		try {
			void ctx.amp.logEvent({ event_type: "COMMAND_RAN", user_id: message.authorId, event_properties: { serverId: message.serverId!, command: command.name } });
			// run the command with the message object, the casted arguments, the global context object (datbase, rest, ws),
			// and the command context (raw packet, database server entry, member from API or cache)
			await command.execute(message, resolvedArgs, ctx, { message, server, member });
		} catch (e) {
			// ID for error, not persisted in database at all
			const referenceId = nanoid();
			if (e instanceof Error) {
				console.error(e);

				if (e.message.includes("You do not have the correct permissions to perform this request")) return ctx.messageUtil.replyWithError(message, "The bot does not proper permissions!", stripIndents`
				Please ensure the bot has the proper permissions granted to it related to your command, and that **none** of the roles it has denies it.

				If the command you are running is related to channels, make sure that the bot has **read, send, & manage channel** permissions so that it can detect the channel.
			`)

				// send the error to the error channel
				void ctx.errorHandler.send("Error in command usage!", [
					new WebhookEmbed()
						.setDescription(
							stripIndents`
						Reference ID: ${inlineCode(referenceId)}
						Server: ${inlineCode(message.serverId)}
						Channel: ${inlineCode(message.channelId)}
						User: ${inlineCode(message.authorId)} (${inlineCode(member?.user!.name)})
						Error: \`\`\`${e.stack ?? e.message}\`\`\`
					`
						)
						.addField(`Content`, codeBlock(message.content?.length > 1018 ? `${message.content.substring(0, 1018)}...` : message.content))
						.setColor("RED"),
				]);

			}


			// notify the user that there was an error executing the command
			return ctx.messageUtil.replyWithUnexpected(
				message,
				`This is potentially an issue on our end, please join [our server](https://www.guilded.gg/Yoki) and forward the following ID and error: ${inlineCode(
					referenceId
				)} & ${inlineCode((e as any).message)}`
			);
		}
		return void 0;
	}, name: "messageCreated"
} satisfies GEvent<"messageCreated">;
