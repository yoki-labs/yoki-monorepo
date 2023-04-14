export const IMAGE_REGEX = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;

const routeSymbol = "[^s?#&/\\(\\)\\[\\]]";
const domainSymbol = "[^!@#$%^&*()?<>.,~`'\":;\\\\\\/|\\s()\\[\\]]";

// // URL parts
// const URL_QUERY = `(?:[?](?:${routeSymbol}[=]${routeSymbol}(?:[&]${routeSymbol}[=]${routeSymbol})*)?)?`;
// const URL_ANCHOR = `(?:[#]${routeSymbol}*)?`;

const URL_PROTOCOL = "(?:(?:[A-Za-z]+)?:/{2,3})?";
const URL_SUBDOMAIN = `(?<subdomain>(?:${domainSymbol}+[.])+)?`;
const URL_DOMAIN = `(?<domain>${domainSymbol}+[.]${domainSymbol}+)`;
const URL_ROUTE = `(?<route>(?:[/]${routeSymbol}+)+)?[/]?`;

export const URL_REGEX = new RegExp(URL_PROTOCOL + URL_SUBDOMAIN + URL_DOMAIN + URL_ROUTE, "g");
export const ONLY_URL_REGEX = new RegExp(`^${URL_SUBDOMAIN}${URL_DOMAIN}${URL_ROUTE}$`);

// Domain, route, subdomain, / ? #, https://
export const MAX_URL_LENGTH = 255 + 200 + 100 + 3 + 8;
