import {Schema, model, models} from "mongoose";

import {MediaRecord} from "./media-record";

export const mediaSchema = new Schema<MediaRecord>({
    // fields
    id: {type: String, required: true, unique: true, trim: true, index: 1}, // public unique id
    title: {type: String, required: true, trim: true},
    summary: {type: String, required: false, default: "", trim: true},
    mime_type: {type: String, required: true, trim: true},
    extension: {type: String, required: false, trim: true, lowercase: true},
    category: {type: String, required: true},
    size: {type: Number, required: true},
    data_storage_type: {type: String, required: true},
    data: {type: Buffer, required: false},

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
mediaSchema.index({id: 1, type: 1});
mediaSchema.index({id: "text", title: "text"}); // search index

export const MediaModel = models.Media || model<MediaRecord>("Media", mediaSchema);
