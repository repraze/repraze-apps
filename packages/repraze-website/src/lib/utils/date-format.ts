import {format, isValid, parse} from "date-fns";

const SHORT_SAME_YEAR_FORMAT = "LLL dd"; // Nov 24
const SHORT_FORMAT = "LLL dd, u"; // Nov 24, 2022
export function dateShortFormat(date: Date): string {
    if (new Date().getFullYear() === date.getFullYear()) {
        return format(date, SHORT_SAME_YEAR_FORMAT);
    }
    return format(date, SHORT_FORMAT);
}

const LONG_FORMAT = "EEEE, d LLLL u 'at' HH:mm:ss"; // Wednesday, 21 December 2022 at 17:46:48
export function dateLongFormat(date: Date): string {
    return format(date, LONG_FORMAT);
}

const TIMESTAMP_FORMAT = "dd/MM/uuuu HH:mm";
export function dateTimestampFormat(date: Date): string {
    return format(date, TIMESTAMP_FORMAT);
}

const DATETIME_INPUT_FORMAT = "uuuu-MM-dd'T'HH:mm";
export function datetimeInputFormat(date: Date | undefined): string {
    return date && isValid(date) ? format(date, DATETIME_INPUT_FORMAT) : "";
}

export function datetimeInputParse(value: string): Date {
    return parse(value, DATETIME_INPUT_FORMAT, new Date());
}
