import {Schema, model, models} from "mongoose";

import {PageRecord} from "./page-record";

export const postSchema = new Schema<PageRecord>({
    // fields
    id: {type: String, required: true, unique: true, trim: true, index: 1}, // public unique id
    title: {type: String, required: true, trim: true},
    summary: {type: String, required: false, default: "", trim: true},
    content: {type: String, required: false, default: ""},
    featured_media: {type: Schema.Types.ObjectId, ref: "Media", required: false},

    // visibility
    public: {type: Boolean, required: true},

    // meta
    creation_date: {type: Date, required: true},
    creation_user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    last_edit_date: {type: Date, required: true},
    last_edit_user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    comment: {type: String, required: false, default: "", trim: true},
});

// indexes
postSchema.index({id: 1, type: 1});
postSchema.index({id: "text", title: "text"}); // search index

export const PageModel = models.Page || model<PageRecord>("Page", postSchema);
