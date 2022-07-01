import { Language } from "@prisma/client";
import { stripIndents } from "common-tags";
import i18next from "i18next";

import { inlineCode } from "../../formatters";
import { RoleType } from "../../typings";
import { languageNames } from "../../util";
import { Category } from "../Category";
import type { Command } from "../Command";

const allLanguages = Object.keys(Language);

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
                i18next.t("config.language.unspecifiedTitle"),
                stripIndents`
                    **${i18next.t("config.language.unspecifiedCurrent")}:** ${languageNames[commandCtx.server.locale]}

                    **${i18next.t("config.language.unspecifiedAll")}:**
                    ${allLanguages.map((lang) => `${inlineCode(lang)}: ${languageNames[lang]}`).join("\n")}
                `
            );

        await ctx.prisma.server.updateMany({ data: { locale: newSetting }, where: { serverId: message.serverId! } });

        return ctx.messageUtil.replyWithSuccess(message, i18next.t("config.language.changedTitle"), i18next.t("config.language.changedDescription"));
    },
};

export default ConfigLanguage;
