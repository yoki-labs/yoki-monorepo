export function cutArray<T>(array: T[]): [T[], T[]] {
    const halfLength = Math.round(array.length / 2);

    return [array.slice(0, halfLength), array.slice(halfLength, array.length)];
}
// Stolen from StackOverflow with some changes to not modify original array
export function shuffleArray<T>(array: T[]) {
    const newArray: T[] = [...array];

    for (let i = array.length, r: number; i > 0; i--) {
        r = Math.floor(Math.random() * i);

        [newArray[i - 1], newArray[r]] = [newArray[r], newArray[i - 1]];
    }

    return newArray;
}
export const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(str);
export const isHashId = (str: string) => /^[0-9A-Za-z]{8,}$/.test(str);
