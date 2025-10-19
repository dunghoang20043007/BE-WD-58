import mongoose from "mongoose";

export const PRODUCT_VARIATION_COLLECTION_NAME = "ProductVariations";
export const PRODUCT_VARIATION_DOCUMENT_NAME = "ProductVariation";

const productVariationSchema = new mongoose.Schema(
    {
        price: {
            type: Number,
            required: true,
        },
        image: { type: String },
        imageUrlRef: String,
        stock: {
            type: Number,
        },
        sold: {
            type: Number,
            default: 0,
        },
        sku: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        variantAttributes: [
            {
                type: { key: String, name: String, value: String },
                _id: false,
            },
        ],
    },
    { timestamps: true, versionKey: false, collection: PRODUCT_VARIATION_COLLECTION_NAME },
);

// productVariationSchema.post("save", async function (doc) {
//     await mongoose.model(PRODUCT_VARIATION_DOCUMENT_NAME).findByIdAndUpdate(
//         doc.productId,
//         {
//             $push: { variations: doc._id },
//             priceFilter: doc.price,
//         },
//         { new: true },
//     );
// });

const ProductVariation = mongoose.model(PRODUCT_VARIATION_DOCUMENT_NAME, productVariationSchema);

export default ProductVariation;
