import { extendTheme } from "@mui/joy";
import labsTheme from "./theme.json";

export const theme = extendTheme({
    cssVarPrefix: "labs",
    colorSchemes: {
        light: {
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
                }
            }
        },
    },
    components: {
        JoyInput: {
            styleOverrides: {
                input: {
                    outline: "none",
                    ":focus": {
                        outline: "none"
                    },
                }
            }
        },
        JoySelect: {
            defaultProps: {
            },
        },
        // JoySwitch: {
        //     defaultProps: {
        //         size: "sm",
                
        //     }
        // },
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
    }
});
