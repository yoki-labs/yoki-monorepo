import { RoleType } from "@prisma/client";
import { CommandArgumentInfo } from "@yokilabs/utils";

export interface Command {
    name: string;
    category?: string;
    description: string;
    args?: CommandArgumentInfo[];
    examples?: string[];
    requiredRole?: RoleType;
    subCommands?: Command[];
    aliases?: string[];
}
