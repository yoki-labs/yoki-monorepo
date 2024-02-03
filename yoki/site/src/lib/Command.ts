import { RoleType } from "@prisma/client";
import { CommandArgumentInfo } from "@yokilabs/utils";

export interface CommandArgument extends CommandArgumentInfo {
    values?: string[];
}

export interface Command {
    name: string;
    category?: string;
    description: string;
    args?: CommandArgument[];
    examples?: string[];
    requiredRole?: RoleType;
    subCommands?: Command[];
    aliases?: string[];
}
