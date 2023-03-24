export function cutArray<T>(array: T[]): [T[], T[]] {
    const halfLength = Math.round(array.length / 2);

    return [array.slice(0, halfLength), array.slice(halfLength, array.length)];
}
export const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(str);
export const isHashId = (str: string) => /^[0-9A-Za-z]{8,}$/.test(str);
