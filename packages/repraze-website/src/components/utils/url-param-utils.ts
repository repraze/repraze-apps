import {useCallback} from "react";
import {useHistory, useLocation} from "react-router-dom";

export type URLParamParser<T> = {
    stringToParam: (rawParam: string | null, defaultParam: T | null) => T | null;
    paramToString: (param: T) => string;
};

export function createBooleanURLParamParser(): URLParamParser<boolean> {
    return {
        stringToParam: (rawParam, defaultParam) => {
            if (rawParam !== null) {
                if (rawParam === "" || rawParam === "true" || rawParam === "1") {
                    return true;
                }
                if (rawParam === "false" || rawParam === "0") {
                    return false;
                }
            }
            return defaultParam;
        },
        paramToString: (param) => {
            return param ? "1" : "0";
        },
    };
}

export function createIntegerURLParamParser(): URLParamParser<number> {
    return {
        stringToParam: (rawParam, defaultParam) => {
            if (rawParam !== null) {
                const num = parseInt(rawParam);
                if (num !== NaN) {
                    return num;
                }
            }
            return defaultParam;
        },
        paramToString: (param) => {
            return param.toString();
        },
    };
}

export function createStringURLParamParser(): URLParamParser<string> {
    return {
        stringToParam: (rawParam, defaultParam) => {
            if (rawParam !== null) {
                return rawParam;
            }
            return defaultParam;
        },
        paramToString: (param) => {
            return param.toString();
        },
    };
}

export function createStringArrayURLParamParser(separator = ","): URLParamParser<string[]> {
    return {
        stringToParam: (rawParam, defaultParam) => {
            if (rawParam !== null) {
                return rawParam.split(separator).filter((t) => t.length > 0);
            }
            return defaultParam;
        },
        paramToString: (param) => {
            return param.join(separator);
        },
    };
}

export function useURLParam<T>(name: string, parser: URLParamParser<T>): [T | null, (param: T | null) => void];

export function useURLParam<T>(
    name: string,
    parser: URLParamParser<T>,
    defaultParam: null
): [T | null, (param: T | null) => void];

export function useURLParam<T>(
    name: string,
    parser: URLParamParser<T>,
    defaultParam: T
): [T, (param: T | null) => void];

export function useURLParam<T>(
    name: string,
    parser: URLParamParser<T>,
    defaultParam: T | null = null
): [T | null, (param: T) => void] {
    const location = useLocation();
    const history = useHistory();

    const setParam = useCallback(
        (param: T | null) => {
            const params = new URLSearchParams(window.location.search); // don't use location to avoid race
            if (param === null) {
                params.delete(name);
            } else {
                params.set(name, parser.paramToString(param));
            }
            history.replace({search: params.toString()});
        },
        [history, name]
    );

    const params = new URLSearchParams(location.search);
    const param = parser.stringToParam(params.get(name), defaultParam);

    return [param, setParam];
}
