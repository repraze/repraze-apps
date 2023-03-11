export function extractSearchString(str: string) {
    const index = str.indexOf("?");
    if (index !== -1) {
        return str.substring(index);
    }
    return "";
}

export function removeSearchString(str: string) {
    const index = str.indexOf("?");
    if (index !== -1) {
        return str.substring(0, index);
    }
    return str;
}
