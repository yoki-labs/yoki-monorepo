import { mixHexColours } from "../../utils/colorUtil";

// Old: #f87edd #715be9
// 
export const labsSecondaryColour: [string, string] = ["#e268ec", "#9c63ea"];
export const labsSecondaryColourHover: [string, string] = [mixHexColours(labsSecondaryColour[0], "#FFFFFF", 0.5), mixHexColours(labsSecondaryColour[1], "#FFFFFF", 0.5)];
