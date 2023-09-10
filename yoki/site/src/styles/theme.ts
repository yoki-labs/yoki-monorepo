import { extendTheme } from "@mui/joy";

import labsTheme from "./theme.json";
import { greyscaleHexColour, mixHexColours } from "../utils/colorUtil";

const mostDark = labsTheme.spacedark[950];
const mostLight = labsTheme.spacelight[950];

export const labsSecondaryColour: [string, string] = ["#f87edd", "#715be9"];
export const labsSecondaryColourHover: [string, string] = [mixHexColours(labsSecondaryColour[0], mostLight, 0.5), mixHexColours(labsSecondaryColour[1], mostLight, 0.5)];

const bodyFont = {
    fontFamily: [
        `"Montserrat"`,
        `"Public Sans"`,
        `var(--labs-fontFamily-fallback, var(--labs--apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"))`,
    ].join(", "),
};

const generateColourScheme = (typicalColour: string) => ({
    950: mixHexColours(typicalColour, mostDark, 0.9),
    900: mixHexColours(typicalColour, mostDark, 0.8),
    800: mixHexColours(typicalColour, mostDark, 0.6),
    700: mixHexColours(typicalColour, mostDark, 0.4),
    600: mixHexColours(typicalColour, mostDark, 0.2),
    500: typicalColour,
    400: mixHexColours(typicalColour, mostLight, 0.2),
    300: mixHexColours(typicalColour, mostLight, 0.4),
    200: mixHexColours(typicalColour, mostLight, 0.6),
    100: mixHexColours(typicalColour, mostLight, 0.8),
    // Solid
    solidBg: typicalColour,
    solidHoverBg: mixHexColours(typicalColour, mostLight, 0.2),
    // Plain
    plainHoverBg: mixHexColours(typicalColour, mostDark, 0.9),
    plainActiveBg: mixHexColours(typicalColour, mostDark, 0.7),
    // Outlined
    outlinedDisabledColor: mixHexColours(greyscaleHexColour(typicalColour, 0.7), mostDark, 0.5),
    outlinedDisabledBorder: mixHexColours(typicalColour, mostDark, 0.7),
    // Soft
    softBg: mixHexColours(typicalColour, mostDark, 0.8),
});

const dark = {
    shadowRing: "#000",
    shadowChannel: "#000",
    fontFamily: {
        display: "Lexend",
        body: "Montserrat",
    },
    palette: {
        divider: labsTheme.spacedark[800],
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
            solidActiveBg: labsTheme.spacedark[400],
            // Plain components
            plainColor: labsTheme.spacedark[300],
            plainHoverBg: labsTheme.spacedark[900],
            plainActiveBg: labsTheme.spacedark[800],
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
            code: mixHexColours(labsTheme.spacelight[800], labsSecondaryColour[0], 0.75),
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

declare module '@mui/joy/styles' {
    interface TypographySystemOverrides {
        "code": true;
    }
}

export const theme = extendTheme({
    typography: {
        "body-xs": bodyFont,
        "body-sm": bodyFont,
        "body-md": bodyFont,
        "body-lg": bodyFont,
        "code": {
            backgroundColor: `var(--labs-palette-background-body)`,
            color: `var(--labs-palette-text-code)`,
            width: "max-content",
            borderRadius: `var(--labs-radius-sm)`,
            padding: `2px 4px`,
            fontFamily: ["'Space Mono'"],
        },
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
        JoyLink: {
            styleOverrides: {
                root: {
                    userSelect: "all",
                },
            },
        },
        JoyButton: {
            styleOverrides: {
                root: {
                    transition: "0.2s ease-out",
                    transitionProperty: "border, background-color, color",
                },
            },
        },
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
        JoyTable: {
            styleOverrides: {
                root: {
                    "--Table-headerUnderlineThickness": "1px",
                    "th": {
                        "--TableCell-headBackground": "transparent",
                    }
                }
            }
        },
        JoySkeleton: {
            styleOverrides: {
                root: `
                    overflow: hidden;
                    position: relative !important;
                `
            }
        }
    },
});
