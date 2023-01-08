import {z} from "zod";

import {ContentString, DocumentId, SummaryString, TitleString, URLId} from "./document";
import {MediaBasic} from "./media-basic";

export const PageBasic = z.object({
    // fields
    id: URLId,
    title: TitleString,
    summary: SummaryString,
    content: ContentString,

    featured_media_id: z.nullable(DocumentId),
    featured_media: z.optional(MediaBasic),
    // visibility
    public: z.boolean(),
});
export type PageBasic = z.infer<typeof PageBasic>;

export const PageBasics = z.array(PageBasic);
export type PageBasics = z.infer<typeof PageBasics>;
