import { Action, PrismaClient } from "@prisma/client";
import { AbstractClient, RoleUtil } from "@yokilabs/bot";
import { S3 } from "aws-sdk";
import EventEmitter from "node:events";
import type TypedEmitter from "typed-emitter";

import type { Command } from "./commands/commands";
import CalendarEventCommentDeleted from "./events/guilded/CalendarEventCommentDeleted.ignore";
import CalendarEventCommentEvent from "./events/guilded/CalendarEventCommentEvent.ignore";
import ChannelArchived from "./events/guilded/ChannelArchived.ignore";
import DocCommentDeleted from "./events/guilded/DocCommentDeleted.ignore";
import DocCommentEvent from "./events/guilded/DocCommentEvent.ignore";
import ForumTopicCommentDeleted from "./events/guilded/ForumTopicCommentDeleted.ignore";
import ForumTopicCommentEvent from "./events/guilded/ForumTopicCommentEvent.ignore";
import RoleDeleted from "./events/guilded/RoleDeleted.ignore";
import ActionIssued from "./events/other/ActionIssued";
import { DatabaseUtil } from "./helpers/database";
import { MessageUtil } from "./helpers/message";
// import { MessageUtil } from "./helpers/message";
// import { RoleUtil } from "./helpers/role";
import { MuteScheduler } from "./jobs/MuteScheduler";
import { ContentFilterUtil } from "./modules/content-filter";
import { LinkFilterUtil } from "./modules/link-filter";
import { SpamFilterUtil } from "./modules/spam-filter";
import SupportUtil from "./modules/support";
import type { Context, Server } from "./typings";
import { ImageFilterUtil } from "./modules/image-filter";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export default class YokiClient extends AbstractClient<YokiClient, Server, Command> {
    // database connection
    readonly prisma = new PrismaClient();

    // s3 bucket
    readonly s3 = new S3({
        credentials: {
            accessKeyId: process.env.S3_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_KEY,
        },
    });

    // utility methods for database interactions
    readonly dbUtil = new DatabaseUtil(this);

    // utility methods for message interactions
    readonly messageUtil: MessageUtil = new MessageUtil(this);

    // utility methods for server interactions
    readonly roleUtil: RoleUtil<YokiClient> = new RoleUtil<YokiClient>(this);

    // utility methods for server interactions
    readonly supportUtil: SupportUtil = new SupportUtil(this);

    // utility methods for content filtering
    readonly contentFilterUtil = new ContentFilterUtil(this);

    // utility methods for preventing spam
    readonly spamFilterUtil = new SpamFilterUtil(this);

    // utility methods for preventing NSFW images
    readonly imageFilterUtil = new ImageFilterUtil(this);

    // utility methods for filtering invites and blacklisted domains
    readonly linkFilterUtil = new LinkFilterUtil(this);

    // scheduler that will check for (impending) expired mutes and remove them
    readonly muteHandler = new MuteScheduler(this, 15 * 60);

    // events that this bot handles that aren't supported by g.js yet, directly from the ws manager.
    readonly eventHandler: { [x: string]: (packet: any, ctx: Context, server: Server) => Promise<any> } = {
        ForumTopicCommentCreated: ForumTopicCommentEvent,
        ForumTopicCommentUpdated: ForumTopicCommentEvent,
        ForumTopicCommentDeleted,
        DocCommentCreated: DocCommentEvent,
        DocCommentUpdated: DocCommentEvent,
        RoleDeleted,
        DocCommentDeleted,
        ChannelArchived,

        CalendarEventCommentCreated: CalendarEventCommentEvent,
        CalendarEventCommentUpdated: CalendarEventCommentEvent,
        CalendarEventCommentDeleted,
    };

    readonly emitter = new EventEmitter() as TypedEmitter<ClientCustomEvents>;

    readonly customEventHandler = {
        ActionIssued,
    };

    init() {
        // starting the sweeper for mute scheduler
        this.muteHandler.init();

        return super.init();
    }
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ClientCustomEvents = {
    ActionIssued: (data: Action, server: Server, client: YokiClient) => unknown;
};
