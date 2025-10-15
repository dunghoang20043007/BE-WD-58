import mongoose, { Schema } from "mongoose";
import { PRODUCT_VARIATION_DOCUMENT_NAME } from "./variant.model";
import { BRAND_DOCUMENT_NAME } from "../../brand/brand.model";
import { CATEGORY_DOCUMENT_NAME } from "../../category/category.model";

export const PRODUCT_COLLECTION_NAME = "Products";
export const PRODUCT_DOCUMENT_NAME = "Product";

export const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        images: [
            {
                type: String,
            },
        ],
        thumbnail: {
            type: String,
        },
        isHide: {
            type: Boolean,
            default: false,
        },
        attributes: [
            {
                type: { key: String, name: String, value: String },
                _id: false,
            },
        ],
        rating: { type: Number, default: 0 },
        brand: {
            type: Schema.Types.ObjectId,
            ref: BRAND_DOCUMENT_NAME,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: CATEGORY_DOCUMENT_NAME,
        },
        priceFilter: Number,
        attributeVariantForFilter: [
            {
                type: { key: String, name: String, value: String },
                _id: false,
            },
        ],
    },
    { timestamps: true, versionKey: false, collection: PRODUCT_COLLECTION_NAME },
);

const Product = mongoose.model(PRODUCT_DOCUMENT_NAME, ProductSchema);

export default Product;
