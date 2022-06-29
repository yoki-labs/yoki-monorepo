import { Language } from "@prisma/client";

import { getTerm, languages } from "../../language";
import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const ConfigLanguage: Command = {
    name: "config-language",
    description: "Changes the language of the Yoki's responses.",
    usage: "<language>",
    examples: ["en_us"],
    subCommand: true,
    category: Category.Settings,
    subName: "language",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newSetting", type: "enum", values: Language }],
    execute: async (message, args, ctx) => {
        const newSetting = args.newSetting as Language;

        await ctx.prisma.server.updateMany({ data: { locale: newSetting }, where: { serverId: message.serverId! } });

        const newLanguage = languages[newSetting];

        return ctx.messageUtil.replyWithSuccess(message, getTerm(newLanguage, "languageChangedTitle"), getTerm(newLanguage, "languageChangedDescription"));
    },
};

export default ConfigLanguage;
