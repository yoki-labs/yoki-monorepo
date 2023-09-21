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

export type Lookup<TKey extends string | number | symbol, TValue> = Partial<Record<TKey, TValue[]>>;

/**
 * Gets keys of all values and returns map of keys and arrays of values that returned that key. This is similar to C#'s `IEnumerable<T>.ToLookup(...)`.
 * @param array The array to lookup values of
 * @param getLookupKey Get the key to assign value to
 * @returns Record of keys and value arrays assigned to the key.
 */
export function toLookup<TValue, TKey extends string | number | symbol>(array: TValue[], getLookupKey: (value: TValue) => TKey): Lookup<TKey, TValue> {
    const lookup: Lookup<TKey, TValue> = {};

    for (const value of array) {
        const key = getLookupKey(value);

        lookup[key] = (lookup[key] ?? []).concat(value);
    }

    return lookup;
}

// REGEX Matching
const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const regexHashId = /^[0-9A-Za-z]{8,16}$/;

export const isUUID = (str: string) => regexUUID.test(str);
export const isHashId = (str: string) => regexHashId.test(str);
