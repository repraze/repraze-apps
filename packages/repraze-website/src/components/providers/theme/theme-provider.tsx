import Head from "next/head";
import React, {createContext, useCallback, useEffect, useState} from "react";

export type ThemeScheme = {
    colorScheme: string;
    primaryColor: string;
    backgroundColor: string;
    containerColor: string;
    componentColor: string;
    componentSecondaryColor: string;
    fontColor: string;
    fontLightColor: string;
    fontLighterColor: string;
    headingFontColor: string;
    transparentColor: string;
};

export enum ThemeModes {
    Dark = "dark",
    Light = "light",
}

export const ThemeModeSchemes: {[key in ThemeModes]: ThemeScheme} = {
    [ThemeModes.Dark]: {
        colorScheme: "dark",
        primaryColor: "rgb(68, 65, 243)",
        backgroundColor: "rgb(255, 255, 255)",
        containerColor: "rgb(248, 249, 252)",
        componentColor: "rgb(248, 249, 252)",
        componentSecondaryColor: "#dfe4f1",
        fontColor: "rgb(36, 44, 62)",
        fontLightColor: "#53658f",
        fontLighterColor: "#acb7cf",
        headingFontColor: "rgb(8, 8, 12)",
        transparentColor: "rgba(255, 255, 255, 0)",
    },
    [ThemeModes.Light]: {
        colorScheme: "light",
        primaryColor: "rgb(68, 65, 243)",
        backgroundColor: "rgb(255, 255, 255)",
        containerColor: "rgb(248, 249, 252)",
        componentColor: "rgb(248, 249, 252)",
        componentSecondaryColor: "#dfe4f1",
        fontColor: "rgb(36, 44, 62)",
        fontLightColor: "#53658f",
        fontLighterColor: "#acb7cf",
        headingFontColor: "rgb(8, 8, 12)",
        transparentColor: "rgba(255, 255, 255, 0)",
    },
};

export function makeSchemeCss(scheme: ThemeScheme) {
    return `
    :root {
        --color-scheme: ${scheme.colorScheme};
        --primaryColor: ${scheme.primaryColor};
        --white: #ffffff;
      }
    `;
}

export const ThemeContext = createContext({
    mode: ThemeModes.Light,
    scheme: ThemeModeSchemes[ThemeModes.Light],
    setMode: (mode: ThemeModes): void => {
        throw new Error("Unimplemented setMode method");
    },
});

const THEME_STORAGE_KEY = "theme";

function getUserModeFromStorage(): ThemeModes {
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

function setUserModeFromStorage(mode: ThemeModes) {
    if (window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
}

export interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
    const [mode, setMode] = useState<ThemeModes>(ThemeModes.Light);
    const [scheme, setScheme] = useState<ThemeScheme>(ThemeModeSchemes[mode]);
    const [schemeCss, setSchemeCss] = useState<string>(makeSchemeCss(scheme));

    const setModeHandler = useCallback((mode: ThemeModes) => {
        setMode(mode);
        if (mode === ThemeModes.Dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        setScheme(ThemeModeSchemes[mode]);
        setSchemeCss(makeSchemeCss(ThemeModeSchemes[mode]));
        setUserModeFromStorage(mode);
    }, []);

    useEffect(() => {
        setModeHandler(getUserModeFromStorage());
    }, [setModeHandler]);

    return (
        <ThemeContext.Provider
            value={{
                mode: mode,
                scheme: scheme,
                setMode: setModeHandler,
            }}
        >
            <Head>
                <style>{schemeCss}</style>
            </Head>
            {children}
        </ThemeContext.Provider>
    );
}
