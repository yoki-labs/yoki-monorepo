export function cutArray<T>(array: T[]): [T[], T[]] {
    const halfLength = Math.round(array.length / 2);

    return [array.slice(0, halfLength), array.slice(halfLength, array.length)];
}
export function cutArrayOddEven<T>(array: T[]): [T[], T[]] {
    return [array.filter((_, i) => !(i % 2)), array.filter((_, i) => i % 2)];
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

// REGEX Matching
const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const regexHashId = /^[0-9A-Za-z]{8,16}$/;

export const isUUID = (str: string) => regexUUID.test(str);
export const isHashId = (str: string) => regexHashId.test(str);
