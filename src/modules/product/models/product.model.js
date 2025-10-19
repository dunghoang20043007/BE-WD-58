import mongoose, { Schema } from "mongoose";
import { PRODUCT_VARIATION_DOCUMENT_NAME } from "./variant.model.js";
import { BRAND_DOCUMENT_NAME } from "../../brand/brand.model.js";
import { PRODUCT_STATUS } from "../../../common/constants/productStatus.js";

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
        discount: {
            type: Number,
            min: 0,
            max: 99,
            default: 0,
        },
        images: [
            {
                type: String,
            },
        ],
        imageUrlRefs: [],
        thumbnail: {
            type: String,
        },
        thumbnailUrlRef: {
            type: String,
        },
        parentSku: { type: String },

        status: {
            type: String,
            default: PRODUCT_STATUS.NEW,
            enum: [PRODUCT_STATUS.NEW, PRODUCT_STATUS.USED],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
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
        reviewCount: {
            type: Number,
            default: 0,
        },
        // @ref
        variationIds: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: PRODUCT_VARIATION_DOCUMENT_NAME,
                },
            ],
            default: [],
        },

        brandId: {
            type: Schema.Types.ObjectId,
            ref: "Brand",
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
