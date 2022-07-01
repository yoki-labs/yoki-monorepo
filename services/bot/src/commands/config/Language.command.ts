import { Language } from "@prisma/client";
import { stripIndents } from "common-tags";
import i18n from "i18n";

import { inlineCode } from "../../formatters";
import { languageNames } from "../../language";
import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const allLanguages = Object.keys(languageNames);

const ConfigLanguage: Command = {
    name: "config-language",
    description: "Changes the language of the Yoki's responses.",
    usage: "<language>",
    examples: ["en_us"],
    subCommand: true,
    category: Category.Settings,
    subName: "language",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newSetting", type: "enum", values: Language, optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const newSetting = args.newSetting as Language | null;

        if (!newSetting)
            return ctx.messageUtil.replyWithInfo(
                message,
                "Available languages",
                stripIndents`
                    **Current language:** ${languageNames[commandCtx.server.locale]}

                    **Here are available languages:**
                    ${allLanguages.map((lang) => `${inlineCode(lang)}: ${languageNames[lang]}`).join("\n")}
                `
            );

        await ctx.prisma.server.updateMany({ data: { locale: newSetting }, where: { serverId: message.serverId! } });

        i18n.setLocale(newSetting);

        return ctx.messageUtil.replyWithSuccess(message, i18n.__("config.language.changedTitle"), i18n.__("config.language.changedDescription"));
    },
};

export default ConfigLanguage;
