import {z} from "zod";

import {Meta} from "./meta";
import {PostBasic} from "./post-basic";

export const Post = PostBasic.merge(Meta);
export type Post = z.infer<typeof Post>;

export const Posts = z.array(Post);
export type Posts = z.infer<typeof Posts>;

export const PostSortFields = z.enum([
    "id",
    "title",
    "public",
    "listed",
    "featured",
    "publish_date",
    "creation_date",
    "last_edit_date",
]);
export type PostSortFields = z.infer<typeof PostSortFields>;
