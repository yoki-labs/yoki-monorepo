import { extendTheme } from "@mui/joy";
import { themeFontCss } from "./themes/util";
import { labsDarkTheme } from "./themes/dark";
import { labsLightTheme } from "./themes/light";

declare module "@mui/joy/styles" {
    interface TypographySystemOverrides {
        code: true;
    }
    interface PaletteTextOverrides {
        code: true;
    }
    interface PaletteRangeOverrides {
        950: true;
    }
    interface PaletteBackgroundOverrides {
        embedded: true;
        embeddedfooter: true;
        skeleton0: true;
        skeleton1: true;
    }
}

export const theme = extendTheme({
    typography: {
        "body-xs": themeFontCss,
        "body-sm": themeFontCss,
        "body-md": themeFontCss,
        "body-lg": themeFontCss,
        "title-sm": themeFontCss,
        "title-md": themeFontCss,
        "title-lg": themeFontCss,
        code: {
            backgroundColor: `var(--labs-palette-background-body)`,
            color: `var(--labs-palette-text-code)`,
            // Doesn't make the text break, so it isn't recommended.
            // width: "max-content",
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
    radius: {
        xs: "6px",
        sm: "10px",
        md: "16px",
        lg: "20px",
        xl: "24px",
    },
    colorSchemes: {
        light: labsLightTheme,
        dark: labsDarkTheme,
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
                thumb: ({ theme }) => ({
                    background: theme.vars.palette.background.body,
                }),
                // track: ({ ownerState, theme }) => ({
                //     background: ownerState.checked ? "#FF0000" : labsTheme.spacedark.background[600],
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
                    }
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
            }
        },
    },
});
