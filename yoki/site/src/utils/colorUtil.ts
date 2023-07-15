const getRedChannel = (value: number) => value >> 16;
const getGreenChannel = (value: number) => (value >> 8) % 0x100;
const getBlueChannel = (value: number) => value % 0x100;
const decimalifyColour = (r: number, g: number, b: number) => (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);

/**
 * Mixes two decimal colours by the given opacity.
 * @param c1 First colour to mix in
 * @param c2 Second colour to mix in
 * @param p2 The floating number that represents percentage of second colour to put in the mix. `1` is `100%`
 */
export function mixColours(c1: number, c2: number, p2: number) {
    const p1 = 1 - p2;

    return decimalifyColour(
        (getRedChannel(c1) * p1) + (getRedChannel(c2) * p2),
        (getGreenChannel(c1) * p1) + (getGreenChannel(c2) * p2),
        (getBlueChannel(c1) * p1) + (getBlueChannel(c2) * p2),
    );
}

export const mixHexColours = (c1: string, c2: string, p1: number) =>
    getHexString(mixColours(getDecimalValue(c1), getDecimalValue(c2), p1));

export const getDecimalValue = (colour: string) => parseInt(colour.slice(1), 16);
export const getHexString = (colour: number) => `#${colour.toString(16)}`; 