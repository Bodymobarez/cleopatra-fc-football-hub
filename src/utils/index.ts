export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

/** When the backend API fails or returns a non-list, avoid calling .filter on non-arrays. */
export function ensureArray<T = unknown>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}