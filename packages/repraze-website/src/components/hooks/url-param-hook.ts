import {extractSearchString} from "@repraze/lib-ui/utils/url-utils";
import {useRouter} from "next/router";
import {useCallback} from "react";

export type URLParamParser<T> = {
    stringToParam: (rawParam: string | undefined, defaultParam: T | undefined) => T | undefined;
    paramToString: (param: T) => string;
};

export function createURLParamBooleanParser(): URLParamParser<boolean> {
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

export function createURLParamNumberParser(): URLParamParser<number> {
    return {
        stringToParam: (rawParam, defaultParam) => {
            if (rawParam !== undefined) {
                const num = parseFloat(rawParam);
                if (!isNaN(num)) {
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

export function createURLParamStringParser(): URLParamParser<string> {
    return {
        stringToParam: (rawParam, defaultParam) => {
            if (rawParam !== undefined) {
                return rawParam;
            }
            return defaultParam;
        },
        paramToString: (param) => {
            return param.toString();
        },
    };
}

export function createURLParamStringArrayParser(separator = ","): URLParamParser<string[]> {
    return {
        stringToParam: (rawParam, defaultParam) => {
            if (rawParam !== undefined) {
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
    defaultParam: undefined
): [T | undefined, (param: T | undefined) => void];

export function useURLParam<T>(
    name: string,
    parser: URLParamParser<T>,
    defaultParam: T
): [T, (param: T | undefined) => void];

export function useURLParam<T>(
    name: string,
    parser: URLParamParser<T>,
    defaultParam: T | undefined
): [T | undefined, (param: T | undefined) => void];

export function useURLParam<T>(
    name: string,
    parser: URLParamParser<T>,
    defaultParam: T | undefined = undefined
): [T | undefined, (param: T | undefined) => void] {
    const router = useRouter();

    const setParam = useCallback(
        (param: T | undefined) => {
            const params = new URLSearchParams(window.location.search); // don't use location to avoid race
            if (param === undefined) {
                params.delete(name);
            } else {
                params.set(name, parser.paramToString(param));
            }
            router.replace({search: params.toString()});
        },
        [router, name, parser]
    );

    const params = new URLSearchParams(extractSearchString(router.asPath));
    const rawParam = params.get(name);
    const param = parser.stringToParam(rawParam === null ? undefined : rawParam, defaultParam);

    return [param, setParam];
}

// boolean

const DEFAULT_BOOLEAN_PARSER = createURLParamBooleanParser();

export function useURLParamBoolean(name: string): [boolean | undefined, (param: boolean | undefined) => void];

export function useURLParamBoolean(
    name: string,
    defaultParam: undefined
): [boolean | undefined, (param: boolean | undefined) => void];

export function useURLParamBoolean(
    name: string,
    defaultParam: boolean
): [boolean, (param: boolean | undefined) => void];

export function useURLParamBoolean(name: string, defaultParam: boolean | undefined = undefined) {
    return useURLParam<boolean>(name, DEFAULT_BOOLEAN_PARSER, defaultParam);
}

// number

const DEFAULT_NUMBER_PARSER = createURLParamNumberParser();

export function useURLParamNumber(name: string): [number | undefined, (param: number | undefined) => void];

export function useURLParamNumber(
    name: string,
    defaultParam: undefined
): [number | undefined, (param: number | undefined) => void];

export function useURLParamNumber(name: string, defaultParam: number): [number, (param: number | undefined) => void];

export function useURLParamNumber(name: string, defaultParam: number | undefined = undefined) {
    return useURLParam<number>(name, DEFAULT_NUMBER_PARSER, defaultParam);
}

// string

const DEFAULT_STRING_PARSER = createURLParamStringParser();

export function useURLParamString(name: string): [string | undefined, (param: string | undefined) => void];

export function useURLParamString(
    name: string,
    defaultParam: undefined
): [string | undefined, (param: string | undefined) => void];

export function useURLParamString(name: string, defaultParam: string): [string, (param: string | undefined) => void];

export function useURLParamString(name: string, defaultParam: string | undefined = undefined) {
    return useURLParam<string>(name, DEFAULT_STRING_PARSER, defaultParam);
}

// string array

const DEFAULT_STRING_ARRAY_PARSER = createURLParamStringArrayParser();

export function useURLParamStringArray(name: string): [string[] | undefined, (param: string[] | undefined) => void];

export function useURLParamStringArray(
    name: string,
    defaultParam: undefined
): [string[] | undefined, (param: string[] | undefined) => void];

export function useURLParamStringArray(
    name: string,
    defaultParam: string[]
): [string[], (param: string[] | undefined) => void];

export function useURLParamStringArray(name: string, defaultParam: string[] | undefined = undefined) {
    return useURLParam<string[]>(name, DEFAULT_STRING_ARRAY_PARSER, defaultParam);
}
