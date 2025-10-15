import { z } from "zod";
import {
    createProduct,
    updateProduct,
    hideProduct,
    showProduct,
    getProductList,
    getProductById,
    getTopSellingProducts,
    getLatestProducts,
    getRelatedProducts,
} from "./product.service.js";
import { customResponse } from "../common/utils/customResponse.js";
import { createError } from "../common/utils/createError.js";
import { createVariant } from "./variant.service.js";

const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    attributes: z
        .array(
            z.object({
                key: z.string(),
                name: z.string(),
                value: z.string(),
            }),
        )
        .optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    priceFilter: z.number().optional(),
    attributeVariantForFilter: z
        .array(
            z.object({
                key: z.string(),
                name: z.string(),
                value: z.string(),
            }),
        )
        .optional(),
});

const paginationSchema = z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
});

/**
 * Tạo mới sản phẩm
 */
export const createProductController = async (req, res, next) => {
    try {
        const productPayload = req.body.product;
        const variantPayload = req.body.variants || [];

        const product = await createProduct(productPayload);
        await Promise.all(variantPayload.map((variant) => createVariant({ ...variant, product: product._id })));
        res.status(201).json(customResponse(201, "Tạo sản phẩm thành công", product));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(createError(400, "Dữ liệu không hợp lệ", error.errors));
        }
        next(error);
    }
};
