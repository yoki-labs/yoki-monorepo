import { extendTheme } from "@mui/joy";

import labsTheme from "./theme.json";
import { mixHexColours } from "../utils/colorUtil";

const mostPrimary = "#8a6fef";
const mostDark = labsTheme.spacedark[950];
const mostLight = labsTheme.spacelight[950];

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
        dark: {
            shadowRing: "#000",
            shadowChannel: "#000",
            palette: {
                neutral: {
                    900: labsTheme.spacedark[950],
                    800: labsTheme.spacedark[900],
                    700: labsTheme.spacedark[800],
                    600: labsTheme.spacedark[700],
                    500: labsTheme.spacedark[600],
                    400: labsTheme.spacedark[500],
                    300: labsTheme.spacedark[400],
                    200: labsTheme.spacedark[300],
                    100: labsTheme.spacedark[300],
                    50: labsTheme.spacedark[300],
                    solidBg: labsTheme.spacedark[600],
                    solidHoverBg: labsTheme.spacedark[500],
                    outlinedBorder: labsTheme.spacedark[700],
                },
                primary: {
                    900: mixHexColours(mostPrimary, mostDark, 0.8),
                    800: mixHexColours(mostPrimary, mostDark, 0.6),
                    700: mixHexColours(mostPrimary, mostDark, 0.4),
                    600: mixHexColours(mostPrimary, mostDark, 0.2),
                    500: mostPrimary,
                    400: mixHexColours(mostPrimary, mostLight, 0.2),
                    300: mixHexColours(mostPrimary, mostLight, 0.4),
                    200: mixHexColours(mostPrimary, mostLight, 0.6),
                    100: mixHexColours(mostPrimary, mostLight, 0.8),
                    solidBg: mostPrimary,
                    plainHoverBg: mixHexColours(mostPrimary, mostDark, 0.9),
                    solidHoverBg: mixHexColours(mostPrimary, mostLight, 0.2),
                },
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
                // track: ({ ownerState, theme }) => ({
                //     background: ownerState.checked ? "#FF0000" : labsTheme.spacedark[600],
                // })
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
