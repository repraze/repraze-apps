import {z} from "zod";

import {ContentString, DocumentId} from "./document";
import {MediaBasic} from "./media-basic";

export const Username = z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_-]+$/);
export type Username = z.infer<typeof Username>;

export const Name = z.string().min(1).max(40);
export type Name = z.infer<typeof Name>;

export const Email = z.string().email();
export type Email = z.infer<typeof Email>;

export const Password = z.string();
export type Password = z.infer<typeof Password>;

export const UserBasic = z.object({
    // fields
    username: Username,
    name: Name,
    email: Email,
    bio: ContentString,

    profile_media_id: z.nullable(DocumentId),
    profile_media: z.optional(MediaBasic),
});
export type UserBasic = z.infer<typeof UserBasic>;

export const UserBasics = z.array(UserBasic);
export type UserBasics = z.infer<typeof UserBasics>;
