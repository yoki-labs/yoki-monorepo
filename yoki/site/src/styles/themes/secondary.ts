import { mixHexColours } from "../../utils/colorUtil";

export const labsSecondaryColour: [string, string] = ["#f87edd", "#715be9"];
export const labsSecondaryColourHover: [string, string] = [mixHexColours(labsSecondaryColour[0], "#FFFFFF", 0.5), mixHexColours(labsSecondaryColour[1], "#FFFFFF", 0.5)];