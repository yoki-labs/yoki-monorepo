import type Collection from "@discordjs/collection";
import type RestManager from "@guildedjs/rest";
import type { Command } from "commands/Command.spec";

export interface Context {
    rest: RestManager;
    commands: Collection<string, Command>;
}
