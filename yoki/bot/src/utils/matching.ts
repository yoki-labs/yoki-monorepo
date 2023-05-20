// --- MISC ---
export const IMAGE_REGEX = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;

// --- URL matching ---
const routeSymbol = "[^?#&\\s/]";
const domainSymbol = "[^!@#$%^&*()?<>.,~`'\":;\\\\\\/|\\s()\\[\\]]";

// // URL parts
// const URL_QUERY = `(?:[?](?:${routeSymbol}[=]${routeSymbol}(?:[&]${routeSymbol}[=]${routeSymbol})*)?)?`;
// const URL_ANCHOR = `(?:[#]${routeSymbol}*)?`;

const URL_PROTOCOL = "(?:(?:[A-Za-z]+)?:/{2,3})";
const URL_SUBDOMAIN = (name: string) => `(?<${name}>(?:${domainSymbol}+[.])+)`;
const URL_DOMAIN = (name: string) => `(?<${name}>${domainSymbol}+[.][A-Za-z]{2,})`;
const URL_ROUTE = (name: string) => `(?<${name}>(?:[/]${routeSymbol}+)+)?[/]`;

const URL_FULL = `${URL_PROTOCOL}${URL_SUBDOMAIN("full_subdomain")}?${URL_DOMAIN("full_domain")}${URL_ROUTE("full_route")}?`;
const URL_ROUTED = `${URL_SUBDOMAIN("routed_subdomain")}?${URL_DOMAIN("routed_domain")}${URL_ROUTE("routed_route")}`;
const URL_SHORT_COM = `(?<short_domain>${domainSymbol}+[.]com)`;

const URL_REGEX_RAW = `(?:${URL_FULL}|${URL_ROUTED}|${URL_SHORT_COM})`;

export interface UrlRegexGroups {
    full_subdomain?: string;
    full_domain?: string;
    full_route?: string;
    routed_subdomain?: string;
    routed_domain?: string;
    routed_route?: string;
    short_domain?: string;
}

export const URL_REGEX = new RegExp(URL_REGEX_RAW, "gi");
export const ONLY_URL_REGEX = new RegExp(`^${URL_REGEX_RAW}$`, "i");

// Domain, route, subdomain, / ? #, https://
export const MAX_URL_LENGTH = 255 + 200 + 100 + 3 + 8;
