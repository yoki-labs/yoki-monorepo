import { ColorSystemOptions } from "@mui/joy/styles/extendTheme";

import { labsSecondaryColour } from "./secondary";
import labsTheme from "./theme.json";
import { generateColourScheme } from "./util";
import { mixHexColours } from "../../utils/colorUtil";

const brightest = labsTheme.spacelight.background[950];
const darkest = labsTheme.spacelight.foreground[950];

export const labsLightTheme: ColorSystemOptions = {
    shadowRing: "#000",
    shadowChannel: "#000",
    // fontFamily: {
    //     display: "Lexend",
    //     body: "Montserrat",
    // },
    palette: {
        divider: labsTheme.spacelight.background[700],
        neutral: {
            900: labsTheme.spacelight.background[950],
            800: labsTheme.spacelight.background[900],
            700: labsTheme.spacelight.background[800],
            600: labsTheme.spacelight.background[700],
            500: labsTheme.spacelight.background[600],
            400: labsTheme.spacelight.background[500],
            300: labsTheme.spacelight.background[400],
            200: labsTheme.spacelight.background[300],
            100: labsTheme.spacelight.background[300],
            50: labsTheme.spacelight.background[300],
            // Solid components
            solidColor: labsTheme.spacelight.foreground[900],
            solidBg: labsTheme.spacelight.background[600],
            solidDisabledBg: labsTheme.spacelight.background[800],
            solidBorder: labsTheme.spacelight.background[700],
            solidHoverBg: labsTheme.spacelight.background[500],
            solidActiveBg: labsTheme.spacelight.background[400],
            // Plain components
            plainColor: labsTheme.spacelight.foreground[300],
            plainHoverBg: labsTheme.spacelight.background[900],
            plainHoverColor: labsTheme.spacelight.foreground[400],
            plainActiveBg: labsTheme.spacelight.background[950],
            plainActiveColor: labsTheme.primary,
            // Soft components
            softColor: labsTheme.spacelight.foreground[300],
            softBg: labsTheme.spacelight.background[900],
            softHoverBg: labsTheme.spacelight.background[950],
            softActiveBg: labsTheme.spacelight.background[950],

            softDisabledBg: labsTheme.spacelight.background[700],
            softDisabledColor: labsTheme.spacelight.foreground[300],
            // Outlined components
            outlinedBorder: labsTheme.spacelight.background[700],
            outlinedColor: labsTheme.spacelight.foreground[500],

            outlinedHoverBg: labsTheme.spacelight.background[900],
            outlinedHoverBorder: labsTheme.spacelight.background[700],
            outlinedHoverColor: labsTheme.spacelight.foreground[600],

            outlinedActiveBg: labsTheme.spacelight.background[800],
            outlinedActiveBorder: labsTheme.spacelight.background[600],
            outlinedActiveColor: labsTheme.spacelight.foreground[500],

            outlinedDisabledBorder: labsTheme.spacelight.background[600],
            outlinedDisabledColor: labsTheme.spacelight.foreground[300],
        },
        primary: generateColourScheme(labsTheme.primary, brightest, darkest),
        danger: generateColourScheme(labsTheme.danger, brightest, darkest),
        warning: generateColourScheme(labsTheme.warning, brightest, darkest),
        success: generateColourScheme(labsTheme.success, brightest, darkest),
        text: {
            primary: labsTheme.spacelight.foreground[900],
            secondary: labsTheme.spacelight.foreground[400],
            tertiary: labsTheme.spacelight.foreground[200],
            code: mixHexColours(labsTheme.spacelight.foreground[800], labsSecondaryColour[0], 0.75),
            reverse: "#FFF",
        },
        background: {
            body: labsTheme.spacelight.background[800],
            level0: mixHexColours(labsTheme.spacelight.background[800], labsTheme.spacelight.background[900], 0.5),
            level1: mixHexColours(labsTheme.spacelight.background[800], labsTheme.spacelight.background[900], 0.8),
            level2: mixHexColours(labsTheme.spacelight.background[900], labsTheme.spacelight.background[950], 0.1),
            level3: labsTheme.spacelight.background[950],

            surface: mixHexColours(labsTheme.spacelight.background[900], labsTheme.spacelight.background[950], 0.1),
            backdrop: `${labsTheme.spacelight.background[800]}DF`,
            embedded: mixHexColours(labsTheme.spacelight.background[900], labsTheme.spacelight.background[800], 0.7),
            embeddedfooter: mixHexColours(labsTheme.spacelight.background[800], labsTheme.spacelight.background[700], 0.3),
            skeleton0: labsTheme.spacelight.background[700],
            skeleton1: `linear-gradient(90deg, transparent, ${labsTheme.spacelight.background[600]}, transparent)`,
            popup: "#FFFFFF",
            tooltip: "#FFFFFF",
        },
    },
};
