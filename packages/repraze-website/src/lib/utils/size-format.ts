const FORMATS = ["bytes", "KB", "MB", "GB", "TB", "PB"];

export function bytesFormat(bytes: number): string {
    let i = 0;

    while (1023 < bytes) {
        bytes /= 1024;
        ++i;
    }

    const fraction = bytes < 10 ? 2 : bytes < 100 ? 1 : 0;

    return (i ? bytes.toFixed(fraction) : bytes) + " " + FORMATS[i];
}
