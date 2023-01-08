export class Random {
    private rng: () => number;

    constructor(rng: () => number) {
        this.rng = rng;
    }

    static default(): Random {
        return new Random(Math.random);
    }

    use(rng: () => number): void {
        this.rng = rng;
    }

    int(min: number, max: number): number {
        return Math.floor(this.rng() * (max - min + 1)) + min;
    }

    float(min: number, max: number): number {
        return this.rng() * (max - min) + min;
    }

    boolean(): boolean {
        return this.rng() < 0.5;
    }

    item<T>(list: T[]): T {
        return list[this.int(0, list.length - 1)];
    }

    // Fisher-Yates
    shuffle<T>(inList: T[]): T[] {
        // copy to not touch original
        const list = [...inList];
        let current = list.length - 1;
        let pos;
        let item;
        while (current) {
            // pick random
            pos = this.int(0, current);
            // swap
            item = list[pos];
            list[pos] = list[current];
            list[current] = item;
            current -= 1;
        }
        return list;
    }
}
