import {z} from "zod";

import {Meta} from "./meta";
import {PageBasic} from "./page-basics";

export const Page = PageBasic.merge(Meta);
export type Page = z.infer<typeof Page>;

export const Pages = z.array(Page);
export type Pages = z.infer<typeof Pages>;

export const PageSortFields = z.enum(["id", "title", "public", "creation_date", "last_edit_date"]);
export type PageSortFields = z.infer<typeof PageSortFields>;
