import { extendTheme } from "@mui/joy";

import { mixHexColours } from "../utils/colorUtil";
import labsTheme from "./theme.json";

const mostDark = labsTheme.spacedark[950];
const mostLight = labsTheme.spacelight[950];

export const labsSecondaryColour: [string, string] = ["#f87edd", "#715be9"];
export const labsSecondaryColourHover: [string, string] = [mixHexColours(labsSecondaryColour[0], mostLight, 0.5), mixHexColours(labsSecondaryColour[1], mostLight, 0.5)];

const bodyFont = {
    fontFamily: [
        `"Inter"`,
        `"Public Sans"`,
        `var(--labs-fontFamily-fallback, var(--labs--apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"))`,
    ].join(", "),
};

const generateColourScheme = (typicalColour: string) => ({
    900: mixHexColours(typicalColour, mostDark, 0.8),
    800: mixHexColours(typicalColour, mostDark, 0.6),
    700: mixHexColours(typicalColour, mostDark, 0.4),
    600: mixHexColours(typicalColour, mostDark, 0.2),
    500: typicalColour,
    400: mixHexColours(typicalColour, mostLight, 0.2),
    300: mixHexColours(typicalColour, mostLight, 0.4),
    200: mixHexColours(typicalColour, mostLight, 0.6),
    100: mixHexColours(typicalColour, mostLight, 0.8),
    solidBg: typicalColour,
    plainHoverBg: mixHexColours(typicalColour, mostDark, 0.9),
    solidHoverBg: mixHexColours(typicalColour, mostLight, 0.2),
});

const dark = {
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
            // Solid components
            solidBg: labsTheme.spacedark[600],
            solidHoverBg: labsTheme.spacedark[500],
            // Outlined components
            outlinedBorder: labsTheme.spacedark[700],
            outlinedColor: labsTheme.spacelight[600],

            outlinedHoverBorder: labsTheme.spacedark[600],
            outlinedHoverColor: labsTheme.spacelight[700],

            outlinedDisabledBorder: labsTheme.spacedark[600],
            outlinedDisabledColor: labsTheme.spacelight[500],
        },
        primary: generateColourScheme(labsTheme.primary),
        danger: generateColourScheme(labsTheme.danger),
        warning: generateColourScheme(labsTheme.warning),
        success: generateColourScheme(labsTheme.success),
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
            backdrop: `${mostDark}AA`,
            popup: "#000",
            tooltip: "#000",
        },
    },
};
const light = dark;

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
        md: ``,
    },
    focus: {
        thickness: "1px",
    },
    colorSchemes: {
        light,
        dark,
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
            defaultProps: {
                variant: "outlined",
            },
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
        JoyListItemDecorator: {
            styleOverrides: {
                root: {
                    color: "inherit",
                },
            },
        },
        JoyChip: {
            defaultProps: {
                variant: "outlined",
            },
        },
        JoyModal: {
            styleOverrides: {
                backdrop: {
                    backdropFilter: "none",
                },
            },
        },
    },
});
