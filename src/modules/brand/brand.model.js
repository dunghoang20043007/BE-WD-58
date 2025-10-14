import mongoose from "mongoose";

export const BRAND_COLLECTION_NAME = "Brands";
export const BRAND_DOCUMENT_NAME = "Brand";

var brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        logo: {
            type: String,
            default: "No logo",
        },
    },
    {
        collection: BRAND_COLLECTION_NAME,
        timestamps: true,
        versionKey: false,
    },
);

const Brand = mongoose.model(BRAND_DOCUMENT_NAME, brandSchema);

export default Brand;
