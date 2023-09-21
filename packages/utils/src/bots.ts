export type CommandArgType = "string" | "UUID" | "member" | "number" | "boolean" | "enum" | "time" | "rest" | "enumList" | "channel" | "emote" | "role";

export interface CommandArgumentInfo {
    // In-code basics
    name: string;
    type: CommandArgType;
    optional?: boolean;
    allowDecimal?: boolean;

    // Display
    display?: string;

    // Type-based
    separator?: string;
    max?: number;
    min?: number;
    values?: any;
}