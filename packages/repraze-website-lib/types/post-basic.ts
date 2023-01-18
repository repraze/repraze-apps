import {z} from "zod";

import {ContentString, DocumentId, ISO8601Date, SummaryString, TagString, TitleString} from "./document";
import {MediaBasic} from "./media-basic";
import {UserBasics, Username} from "./user-basic";

export const PostBasic = z.object({
    // fields
    id: z.nullable(DocumentId),
    title: TitleString,
    summary: SummaryString,
    content: ContentString,
    tags: z.array(TagString).max(20).default([]),

    author_user_ids: z.array(Username).max(10).default([]),
    author_users: z.optional(UserBasics.max(10).default([])),

    featured_media_id: z.nullable(DocumentId),
    featured_media: z.optional(MediaBasic),
    // visibility
    public: z.boolean(),
    listed: z.boolean(),
    featured: z.boolean(),
    publish_date: z.nullable(ISO8601Date),
});
export type PostBasic = z.infer<typeof PostBasic>;

export const PostBasics = z.array(PostBasic);
export type PostBasics = z.infer<typeof PostBasics>;
