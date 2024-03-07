import { extendTheme } from "@mui/joy";

import { labsDarkTheme } from "./themes/dark";
import { labsLightTheme } from "./themes/light";
import { bodyFontFamily, themeFontCss, themeTitleFontCss, titleFontFamily } from "./themes/util";

declare module "@mui/joy/styles" {
    interface TypographySystemOverrides {
        code: true;
        reverse: true;
    }
    interface ListItemButtonPropsVariantOverrides {
        indented: true;
    }

    interface PaletteTextOverrides {
        code: true;
        reverse: true;
    }
    interface PaletteRangeOverrides {
        950: true;
    }
    interface PaletteBackgroundOverrides {
        level0: true;
        embedded: true;
        embeddedfooter: true;
        skeleton0: true;
        skeleton1: true;
    }
}

export const theme = extendTheme({
    fontFamily: {
        body: bodyFontFamily,
        display: titleFontFamily,
        fallback: bodyFontFamily,
        code: "'Space Mono'",
    },
    typography: {
        "body-xs": themeFontCss,
        "body-sm": themeFontCss,
        "body-md": themeFontCss,
        "body-lg": themeFontCss,
        "title-sm": themeFontCss,
        "title-md": themeFontCss,
        "title-lg": themeFontCss,
        h1: themeTitleFontCss,
        h2: themeTitleFontCss,
        h3: themeTitleFontCss,
        h4: themeTitleFontCss,
        code: {
            backgroundColor: `var(--labs-palette-background-body)`,
            color: `var(--labs-palette-text-code)`,
            // Doesn't make the text break, so it isn't recommended.
            // width: "max-content",
            borderRadius: `var(--labs-radius-sm)`,
            padding: `2px 8px`,
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
    radius: {
        xs: "10px",
        sm: "16px",
        md: "22px",
        lg: "28px",
        xl: "34px",
    },
    colorSchemes: {
        light: labsLightTheme,
        dark: labsDarkTheme,
    },
    components: {
        JoyMenuItem: {
            defaultProps: {
                className: "px-4 py-2 md:px-2 md:py-1"
            },
            styleOverrides: {
                root: {
                    margin: "5px 8px",
                },
            },
        },
        JoyCard: {
            defaultProps: {
                variant: "plain",
            },
        },
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
                    "--Select-inlinePadding": "1rem",
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
                thumb: ({ theme }) => ({
                    background: theme.vars.palette.background.body,
                }),
                track: {
                    border: "none",
                },
                // track: ({ ownerState, theme }) => ({
                //     background: ownerState.checked ? "#FF0000" : labsTheme.spacedark.background[600],
                // })
            },
            defaultProps: {
                size: "lg",
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
            styleOverrides: {
                root: {
                    paddingBlock: "var(--_Chip-paddingBlock)",
                },
            },
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
                    th: {
                        "--TableCell-headBackground": "transparent",
                    },
                },
            },
        },
        JoySkeleton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    overflow: "hidden",
                    position: "relative !important" as "relative",
                    background: theme.vars.palette.background.skeleton0,
                    "::after": {
                        background: theme.vars.palette.background.skeleton1,
                    },
                    "::before": {
                        backgroundColor: theme.vars.palette.background.skeleton0,
                    },
                }),
            },
        },
        JoyOption: {
            styleOverrides: {
                root: {
                    maxWidth: "90vw",
                },
            },
        },
        JoyFormLabel: {
            styleOverrides: {
                root: {
                    userSelect: "inherit",
                    cursor: "text",
                },
            },
        },
        JoyTooltip: {
            defaultProps: {
                variant: "outlined",
                arrow: true,
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.vars.palette.background.tooltip,
                    padding: "8px 12px",
                }),
                arrow: ({ theme }) => ({
                    "::before": {
                        borderTopColor: theme.vars.palette.background.tooltip,
                        borderRightColor: theme.vars.palette.background.tooltip,
                    },
                }),
            },
        },
    },
});
