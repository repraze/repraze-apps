import {z} from "zod";

import {DocumentId, ISO8601Date} from "./document";
import {Page} from "./page";
import {User} from "./user";

export const Project = z.object({
    // fields
    id: z.optional(DocumentId),
    page: z.optional(Page),
    title: z.string().min(1).max(256),
    description: z.string().max(512),
    content: z.string(),
    // visibility
    public: z.boolean(),
    // meta
    creation_date: z.optional(ISO8601Date),
    creation_user: z.optional(User),
    last_edit_date: z.optional(ISO8601Date),
    last_edit_user: z.optional(User),
});

export type Project = z.infer<typeof Project>;
