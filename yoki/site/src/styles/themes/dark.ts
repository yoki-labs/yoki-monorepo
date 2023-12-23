import { ColorSystemOptions } from "@mui/joy/styles/extendTheme";
import { mixHexColours } from "../../utils/colorUtil";
import { labsSecondaryColour } from "./secondary";
import labsTheme from "./theme.json";
import { generateColourScheme } from "./util";

const darkest = labsTheme.spacedark.background[950];
const brightest = labsTheme.spacedark.foreground[950];

export const labsDarkTheme: ColorSystemOptions = {
    shadowRing: "#000",
    shadowChannel: "#000",
    // fontFamily: {
    //     display: "Lexend",
    //     body: "Montserrat",
    // },
    palette: {
        divider: labsTheme.spacedark.background[800],
        neutral: {
            900: labsTheme.spacedark.background[950],
            800: labsTheme.spacedark.background[900],
            700: labsTheme.spacedark.background[800],
            600: labsTheme.spacedark.background[700],
            500: labsTheme.spacedark.background[600],
            400: labsTheme.spacedark.background[500],
            300: labsTheme.spacedark.background[400],
            200: labsTheme.spacedark.background[300],
            100: labsTheme.spacedark.background[300],
            50: labsTheme.spacedark.background[300],
            // Solid components
            solidColor: labsTheme.spacedark.foreground[900],
            solidBg: labsTheme.spacedark.background[700],
            solidHoverBg: labsTheme.spacedark.background[500],
            solidActiveBg: labsTheme.spacedark.background[400],
            // Plain components
            plainColor: labsTheme.spacedark.foreground[300],
            plainHoverBg: labsTheme.spacedark.background[900],
            plainActiveBg: labsTheme.spacedark.background[800],
            // Soft components
            softColor: labsTheme.spacedark.foreground[400],
            softBg: labsTheme.spacedark.background[900],
            softHoverBg: labsTheme.spacedark.background[800],
            softActiveBg: labsTheme.spacedark.background[700],
            // Outlined components
            outlinedBorder: labsTheme.spacedark.background[700],
            outlinedColor: labsTheme.spacedark.foreground[500],
            
            outlinedActiveBorder: labsTheme.spacedark.background[600],
            outlinedActiveColor: labsTheme.spacedark.foreground[700],

            outlinedHoverBorder: labsTheme.spacedark.background[600],
            outlinedHoverColor: labsTheme.spacedark.foreground[600],

            outlinedDisabledBorder: labsTheme.spacedark.background[600],
            outlinedDisabledColor: labsTheme.spacedark.foreground[300],
        },
        primary: generateColourScheme(labsTheme.primary, darkest, brightest),
        danger: generateColourScheme(labsTheme.danger, darkest, brightest),
        warning: generateColourScheme(labsTheme.warning, darkest, brightest),
        success: generateColourScheme(labsTheme.success, darkest, brightest),
        text: {
            primary: labsTheme.spacedark.foreground[900],
            secondary: labsTheme.spacedark.foreground[400],
            tertiary: labsTheme.spacedark.foreground[200],
            code: mixHexColours(labsTheme.spacedark.foreground[800], labsSecondaryColour[0], 0.75),
            reverse: "#000",
        },
        background: {
            body: labsTheme.spacedark.background[950],
            level0: mixHexColours(labsTheme.spacedark.background[900], labsTheme.spacedark.background[950], 0.5),
            level1: labsTheme.spacedark.background[900],
            level2: labsTheme.spacedark.background[800],
            level3: labsTheme.spacedark.background[700],

            surface: labsTheme.spacedark.background[900],
            embedded: mixHexColours(labsTheme.spacedark.background[900], labsTheme.spacedark.background[950], 0.45),
            embeddedfooter: mixHexColours(labsTheme.spacedark.background[950], "#000000", 0.5),
            skeleton0: labsTheme.spacedark.background[700],
            skeleton1: `linear-gradient(90deg, transparent, ${labsTheme.spacedark.background[600]}, transparent)`,
            backdrop: `${darkest}DF`,
            popup: "#000",
            tooltip: "#000",
        },
    },
};