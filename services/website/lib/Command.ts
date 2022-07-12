export interface Command {
    name: string;
    category?: string;
    description: string;
    usage?: string;
    args?: { name: string; type: string; optional?: boolean }[];
    examples?: string[];
    requiredRole?: string;
    subCommands?: Command[];
    aliases?: string[];
}
