import {nanoid} from "nanoid";
import {z} from "zod";

// type coercion

const ISO8601_REGEX = /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-][01]\d:[0-5]\d)$/;
export function dateISO8601String(value: unknown) {
    if (typeof value === "string" && ISO8601_REGEX.test(value)) {
        return new Date(value);
    }
    return value;
}

export function booleanString(value: unknown) {
    // truthy by default
    if (value === "" || value === "true" || value === "1") {
        return true;
    }
    if (value === "false" || value === "0") {
        return false;
    }
    return value;
}

export function intString(value: unknown) {
    if (typeof value === "string" && /^\d+$/.test(value)) {
        return parseInt(value, 10);
    }
    return value;
}

// Reusable types

export const DocumentId = z.string().regex(/^[A-Za-z0-9_-]{21}$/, "Invalid document ID");
export type DocumentId = z.infer<typeof DocumentId>;
export const makeDocumentId = function (): DocumentId {
    return nanoid();
};

export const URLId = z.string().regex(/^[a-z0-9_-]+$/, "Invalid URL ID");
export type URLId = z.infer<typeof URLId>;

export const ISO8601Date = z.preprocess(dateISO8601String, z.date());
export type ISO8601Date = z.infer<typeof ISO8601Date>;

export const TitleString = z.string().min(1).max(256);
export type TitleString = z.infer<typeof TitleString>;

export const SummaryString = z.string().max(512);
export type SummaryString = z.infer<typeof SummaryString>;

export const ContentString = z.string();
export type ContentString = z.infer<typeof ContentString>;

export const TagString = z
    .string()
    .min(1)
    .max(32)
    .regex(/^[^\s,]+( [^\s,]+)*$/); // non whitespace words split with only 1 whitespace, coma is reserved
export type TagString = z.infer<typeof TagString>;
