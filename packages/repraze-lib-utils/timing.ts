export async function delay(ms: number): Promise<void> {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res();
        }, ms);
    });
}

export async function delayValue<T>(ms: number, value: T): Promise<T> {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(value);
        }, ms);
    });
}

export function debounce<FN extends (...args: any[]) => any>(
    ms: number,
    fn: FN
): (...args: Parameters<FN>) => Promise<Awaited<ReturnType<FN>>> {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;
    return (...args: Parameters<FN>) => {
        return new Promise((resolve) => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                resolve(fn(...args));
            }, ms);
        });
    };
}
