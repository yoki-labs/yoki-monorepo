import { Language } from "@prisma/client";
import i18n from "i18n";
import path from "path";

export const languageNames: Record<Language, string> = {
    EN_US: "English (USA)",
    LT_LT: "Lietuvių",
};

i18n.configure({
    locales: [Language.EN_US, Language.LT_LT],
    directory: path.join(__dirname, "lang"),
});
