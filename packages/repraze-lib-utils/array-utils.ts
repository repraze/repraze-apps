export function dedupeArray<T>(array: T[]): T[] {
    return [...new Set(array)];
}
