import { writeFileSync } from "fs";
import { join } from "path";
import recursive from "recursive-readdir";

// import type { Command } from "../src/commands/Command";

const __dirname = join(import.meta.url.substring(7), "..");

/**
 * Sanitizes information about a command.
 * @param {import("../src/commands/commands").Command} command 
 */
function rewriteCommandInfo({ execute, hidden, forceShow, devOnly, rawArgs, subCommands, args, ...command }) {
    return {
        ...command,
        args: args && args.map(rewriteArgInfo),
        subCommands: subCommands && subCommands.map(rewriteCommandInfo),
    }
}

/**
 * Sanitizes information about a command argument.
 * @param {import("@yokilabs/bot").CommandArgument} param0 
 */
function rewriteArgInfo({ values, ...arg }) {
    return {...arg, values: values ? Object.keys(values) : undefined };
}

void (async () => {
    const commandFiles = await recursive(join(__dirname, "..", "dist", "commands"));
    // const commands = commandFiles
    //     .filter((x) => x.endsWith(".command.js"))
    //     .map((x) => require(x).default /*as Command*/)
    /** @type {import("../src/commands/commands").Command[]} */
    const commands = (await Promise.all(
        commandFiles
            .filter((x) => x.endsWith(".command.js"))
            .map((x) => import(x))
    ))
        .map((x) => x.default.default)
        .filter((x) => (!x.hidden && !x.subCommand) || x.forceShow);

    writeFileSync(
        join(__dirname, "..", "..", "site", "commands.json"),
        JSON.stringify(
            commands.map(rewriteCommandInfo)
        )
    );
})();