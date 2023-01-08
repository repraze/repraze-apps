import {z} from "zod";

export const SortType = z.enum(["asc", "desc"]);

export type SortType = z.infer<typeof SortType>;
