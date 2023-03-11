import {FieldError, Merge} from "react-hook-form";

export function extractError(error: Merge<FieldError, (FieldError | undefined)[]>) {
    if (error) {
        if (Array.isArray(error)) {
            const firstError = error.find((e) => e && e.message);
            if (firstError) {
                return firstError.message;
            }
        } else {
            return error.message;
        }
    }
    return undefined;
}
