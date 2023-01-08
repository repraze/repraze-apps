import React, {useRef} from "react";

import {Theme, ThemeInterface, ThemeModes} from "./theme";
import {ThemeContext} from "./theme-context";

const THEME_MODE_TO_STYLE: {[key in ThemeModes]: () => any} = {
    [ThemeModes.Light]: async () => (await import("../../style/theme-light.sass")).default,
    [ThemeModes.Dark]: async () => (await import("../../style/theme-dark.sass")).default,
};

const THEME_STORAGE_KEY = "theme";

function getUserMode(): ThemeModes {
    const isDefaultDarkMode = true; // controls the default theme if OS not set
    const isOSInDarkMode = window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : isDefaultDarkMode;
    const isStorageSet = window.localStorage ? window.localStorage.getItem(THEME_STORAGE_KEY) !== null : false;
    const isStorageInDarkMode = window.localStorage
        ? window.localStorage.getItem(THEME_STORAGE_KEY) === ThemeModes.Dark
        : isDefaultDarkMode;
    return isStorageSet
        ? isStorageInDarkMode
            ? ThemeModes.Dark
            : ThemeModes.Light
        : isOSInDarkMode
        ? ThemeModes.Dark
        : ThemeModes.Light;
}

export interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
    const themeRef = useRef<ThemeInterface>();

    //TODO: revamp theming

    if (!themeRef.current) {
        const theme = new Theme(ThemeModes.Light);
        const prevSetMode = theme.setMode;
        let inited = false;
        theme.setMode = async (mode: ThemeModes) => {
            const style = await THEME_MODE_TO_STYLE[mode]();
            if (style) {
                if (inited) {
                    const previousStyle = await THEME_MODE_TO_STYLE[theme.getMode()]();
                    if (previousStyle) {
                        previousStyle.unuse();
                    }
                } else {
                    inited = true;
                }
                style.use();
                if (window.localStorage) {
                    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
                }
                prevSetMode.apply(theme, [mode]);
            }
        };

        // init
        theme.setMode(getUserMode());
        themeRef.current = theme;
    }

    return <ThemeContext.Provider value={themeRef.current}>{children}</ThemeContext.Provider>;
}
