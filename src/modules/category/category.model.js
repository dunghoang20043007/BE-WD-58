import mongoose from "mongoose";

export const CATEGORY_COLLECTION_NAME = "Categories";
export const CATEGORY_DOCUMENT_NAME = "Category";

var categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        attribute: [
            {
                type: mongoose.Schema.Types.ObjectId,
            },
        ],
    },
    {
        collection: CATEGORY_COLLECTION_NAME,
        timestamps: true,
        versionKey: false,
    },
);

const Category = mongoose.model(CATEGORY_DOCUMENT_NAME, categorySchema);

export default Category;
