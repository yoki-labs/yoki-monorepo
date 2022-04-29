import { Embed } from "@guildedjs/embeds";
import type { ChatMessagePayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import type { Command, CommandArgument } from "../commands/Command";
import { Util } from "./util";

export class MessageUtil extends Util {
    // Send a message using either string, embed object, or raw object
    send(channelId: string, content: string | RESTPostChannelMessagesBody | Embed) {
        return this.rest.router
            .createChannelMessage(channelId, content instanceof Embed ? { embeds: [content.toJSON()] } : typeof content === "string" ? { content } : content)
            .then((x) => x.message);
    }

    // Reply to a message
    reply(message: ChatMessagePayload, content: string | RESTPostChannelMessagesBody) {
        const opts: RESTPostChannelMessagesBody | string = typeof content === "string" ? { replyMessageIds: [message.id], content } : content;
        return this.rest.router.createChannelMessage(message.channelId, opts);
    }

    handleBadArg(channelId: string, arg: string | null, commandArg: CommandArgument, command: Command, parentCommand: Command) {
        return this.send(
            channelId,
            stripIndents`
                Sorry, your ${commandArg.name} was not valid! Was expecting a \`${commandArg.type}\`, received \`${arg ?? "nothing"}\`
                **Usage:** \`${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}\``
        );
    }
}
