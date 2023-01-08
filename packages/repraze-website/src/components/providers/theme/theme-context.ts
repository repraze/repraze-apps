import {createContext} from "react";

import {ThemeInterface, ThemeUnimplemented} from "./theme";

export const ThemeContext = createContext<ThemeInterface>(new ThemeUnimplemented());
