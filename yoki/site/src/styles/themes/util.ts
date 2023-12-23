import { PaletteOptions } from "@mui/joy/styles/types";
import { greyscaleHexColour, mixHexColours } from "../../utils/colorUtil";

export const bodyFontFamily = [
    `"Montserrat"`,
    `"Public Sans"`,
    `var(--labs-fontFamily-fallback, var(--labs--apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"))`,
].join(", ");

export const themeFontCss = {
    fontFamily: bodyFontFamily,
};

export const generateColourScheme = (typicalColour: string, background: string, counter: string): Partial<PaletteOptions["primary" | "neutral" | "success" | "danger"]> => ({
    950: mixHexColours(typicalColour, background, 0.88),
    900: mixHexColours(typicalColour, background, 0.8),
    800: mixHexColours(typicalColour, background, 0.6),
    700: mixHexColours(typicalColour, background, 0.4),
    600: mixHexColours(typicalColour, background, 0.2),
    500: typicalColour,
    400: mixHexColours(typicalColour, counter, 0.2),
    300: mixHexColours(typicalColour, counter, 0.4),
    200: mixHexColours(typicalColour, counter, 0.6),
    100: mixHexColours(typicalColour, counter, 0.8),
    // Solid
    solidBg: typicalColour,
    solidHoverBg: mixHexColours(typicalColour, counter, 0.2),
    // Plain
    plainHoverBg: mixHexColours(typicalColour, background, 0.9),
    plainActiveBg: mixHexColours(typicalColour, background, 0.7),
    // Outlined
    outlinedColor: mixHexColours(typicalColour, counter, 0.4),
    outlinedBorder: mixHexColours(typicalColour, background, 0.55),

    outlinedHoverBg: mixHexColours(typicalColour, background, 0.9),
    outlinedHoverColor: mixHexColours(typicalColour, counter, 0.6),
    outlinedHoverBorder: mixHexColours(typicalColour, background, 0.45),
    
    outlinedActiveBg: mixHexColours(typicalColour, background, 0.8),
    outlinedActiveColor: mixHexColours(typicalColour, counter, 0.7),
    outlinedActiveBorder: mixHexColours(typicalColour, background, 0.35),

    outlinedDisabledColor: mixHexColours(greyscaleHexColour(typicalColour, 0.7), background, 0.5),
    outlinedDisabledBorder: mixHexColours(typicalColour, background, 0.85),
    // Soft
    softBg: mixHexColours(typicalColour, background, 0.8),
    softColor: mixHexColours(typicalColour, counter, 0.6),

    softHoverBg: mixHexColours(typicalColour, background, 0.7),
    softHoverColor: mixHexColours(typicalColour, counter, 0.7),

    softActiveBg: mixHexColours(typicalColour, background, 0.6),
    softActiveColor: mixHexColours(typicalColour, counter, 0.8),
    // // Transparency
    // "sm-opacity": `${typicalColour}55`,
});