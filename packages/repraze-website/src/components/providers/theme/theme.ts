export enum ThemeModes {
    Light = "light",
    Dark = "dark",
}

export interface ThemeInterface {
    getMode: () => ThemeModes;
    setMode: (mode: ThemeModes) => void;
}

export class ThemeUnimplemented implements ThemeInterface {
    getMode(): ThemeModes {
        throw new Error("Unimplemented getMode method");
    }
    setMode() {
        throw new Error("Unimplemented setMode method");
    }
}

export class Theme implements ThemeInterface {
    private mode: ThemeModes;
    constructor(mode: ThemeModes) {
        this.mode = mode;
    }
    getMode(): ThemeModes {
        return this.mode;
    }
    setMode(mode: ThemeModes) {
        this.mode = mode;
    }
}
