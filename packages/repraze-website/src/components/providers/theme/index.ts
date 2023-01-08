import {useContext} from "react";

import {ThemeContext} from "./theme-context";

export {ThemeProvider} from "./theme-provider";
export {ThemeContext} from "./theme-context";
export {ThemeUnimplemented, ThemeModes} from "./theme";

export function useTheme() {
    const theme = useContext(ThemeContext);
    return theme;
}
