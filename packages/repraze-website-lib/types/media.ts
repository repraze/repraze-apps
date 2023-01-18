import {z} from "zod";

import {MediaBasic} from "./media-basic";
import {Meta} from "./meta";

export const Media = MediaBasic.merge(Meta);
export type Media = z.infer<typeof Media>;

export const Medias = z.array(Media);
export type Medias = z.infer<typeof Medias>;

export const MediaSortFields = z.enum([
    "id",
    "title",
    "mime_type",
    "extension",
    "size",
    "category",
    "public",
    "creation_date",
    "last_edit_date",
]);
export type MediaSortFields = z.infer<typeof MediaSortFields>;
