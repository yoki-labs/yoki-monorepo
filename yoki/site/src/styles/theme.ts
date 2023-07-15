import { extendTheme } from "@mui/joy";

import labsTheme from "./theme.json";
import { mixHexColours } from "../utils/colorUtil";

const mostPrimary = "#8a6fef";
const mostDark = labsTheme.spacedark[950];
const mostLight = labsTheme.spacelight[950];

// Since this is a dark theme, 90 is the darkest and 900 is the lightest
const primary = {
    100: mixHexColours(mostPrimary, mostDark, 0.8),
    200: mixHexColours(mostPrimary, mostDark, 0.6),
    300: mixHexColours(mostPrimary, mostDark, 0.4),
    400: mixHexColours(mostPrimary, mostDark, 0.2),
    500: mostPrimary,
    600: mixHexColours(mostPrimary, mostLight, 0.2),
    700: mixHexColours(mostPrimary, mostLight, 0.4),
    800: mixHexColours(mostPrimary, mostLight, 0.6),
    900: mixHexColours(mostPrimary, mostLight, 0.8),
};

export const labsSecondaryColour: [string, string] = ["#f87edd", "#715be9"];
export const labsSecondaryColourHover: [string, string] = [mixHexColours(labsSecondaryColour[0], mostLight, 0.5), mixHexColours(labsSecondaryColour[1], mostLight, 0.5)];

const bodyFont = {
    fontFamily: [
        `"Inter"`,
        `"Public Sans"`,
        `var(--labs-fontFamily-fallback, var(--labs--apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"))`
    ].join(", "),
};

export const theme = extendTheme({
    typography: {
        body1: bodyFont,
        body2: bodyFont,
        body3: bodyFont,
        body4: bodyFont,
        body5: bodyFont,
    },
    cssVarPrefix: "labs",
    shadow: {
        md: ``
    },
    colorSchemes: {
        light: {
            shadowRing: "#000",
            shadowChannel: "#000",
            palette: {
                neutral: {
                    50: labsTheme.spacedark[950],
                    100: labsTheme.spacedark[900],
                    200: labsTheme.spacedark[800],
                    300: labsTheme.spacedark[700],
                    400: labsTheme.spacedark[600],
                    500: labsTheme.spacedark[500],
                    600: labsTheme.spacedark[400],
                    700: labsTheme.spacedark[300],
                    800: labsTheme.spacedark[300],
                    900: labsTheme.spacedark[300],
                },
                primary,
                text: {
                    primary: labsTheme.spacelight[900],
                    secondary: labsTheme.spacelight[700],
                    tertiary: labsTheme.spacelight[500],
                },
                background: {
                    body: labsTheme.spacedark[950],
                    level1: labsTheme.spacedark[900],
                    level2: labsTheme.spacedark[800],
                    level3: labsTheme.spacedark[700],

                    surface: labsTheme.spacedark[900],
                    backdrop: labsTheme.spacedark[900],
                    popup: "#000",
                    tooltip: "#000",
                },
            },
        },
    },
    components: {
        JoyInput: {
            styleOverrides: {
                input: {
                    outline: "none",
                    ":focus": {
                        outline: "none",
                    },
                },
            },
        },
        JoySelect: {
            defaultProps: {},
        },
        JoySwitch: {
            styleOverrides: {
                thumb: {
                    background: labsTheme.spacedark[950],
                },
            },
        },
        // JoyChip: {
        //   defaultProps: {
        //     size: 'sm',
        //   },
        //   styleOverrides: {
        //     root: {
        //       borderRadius: '4px',
        //     },
        //   },
        // },
    },
});
