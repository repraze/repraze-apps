import {z} from "zod";

import {DocumentId, SummaryString} from "./document";

export const MediaCategory = z.enum([
    // mime type
    "application",
    "audio",
    "font",
    "image",
    // "model", // not in use
    "text",
    "video",
    // special
    "archive",
    // unknown
    "other",
]);

export type MediaCategory = z.infer<typeof MediaCategory>;

export function categorizeMedia(mimeType: string, extension?: string): MediaCategory {
    if (mimeType === "application/octet-stream") {
        return "other";
    }
    if (mimeType.startsWith("application/")) {
        if (extension) {
            if ([".zip", ".rar", ".tar", ".gz", ".7z"].includes(extension)) {
                return "archive";
            }
        }
        return "application";
    }
    if (mimeType.startsWith("audio/")) {
        return "audio";
    }
    if (mimeType.startsWith("font/")) {
        return "font";
    }
    if (mimeType.startsWith("image/")) {
        return "image";
    }
    if (mimeType.startsWith("text/")) {
        return "text";
    }
    if (mimeType.startsWith("video/")) {
        return "video";
    }
    return "other";
}

export const MediaBasic = z.object({
    // fields
    id: z.nullable(DocumentId),
    title: z.string().min(1).max(256),
    summary: SummaryString,
    mime_type: z.nullable(z.string().min(1)),
    extension: z.nullable(z.string().min(2)), // includes dot
    category: z.nullable(MediaCategory),
    size: z.nullable(z.number()), // in bytes
    // data_type: MediaDataType,
    // visibility
    public: z.boolean(),
});
export type MediaBasic = z.infer<typeof MediaBasic>;

export const MediaBasics = z.array(MediaBasic);
export type MediaBasics = z.infer<typeof MediaBasics>;
