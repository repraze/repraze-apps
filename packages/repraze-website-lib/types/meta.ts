import {z} from "zod";

import {ISO8601Date} from "./document";
import {UserBasic, Username} from "./user-basic";

// record fields should be optional, removed for unauthenticated users
export const Meta = z.object({
    // audit meta
    creation_date: z.optional(ISO8601Date),

    creation_user_id: z.optional(Username),
    creation_user: z.optional(UserBasic),

    last_edit_date: z.optional(ISO8601Date),

    last_edit_user_id: z.optional(Username),
    last_edit_user: z.optional(UserBasic),
    // utilities meta
    comment: z.optional(z.string()),
});
export type Meta = z.infer<typeof Meta>;
