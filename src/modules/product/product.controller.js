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

// Zod schemas
const createProductSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
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
        const validatedData = createProductSchema.parse(req.body);
        const product = await createProduct(validatedData);
        res.status(201).json(customResponse(201, "Tạo sản phẩm thành công", product));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(createError(400, "Dữ liệu không hợp lệ", error.errors));
        }
        next(error);
    }
};

/**
 * Sửa sản phẩm
 */
export const updateProductController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = updateProductSchema.parse(req.body);
        const product = await updateProduct(id, validatedData);
        if (!product) {
            return next(createError(404, "Sản phẩm không tồn tại"));
        }
        res.json(customResponse(200, "Cập nhật sản phẩm thành công", product));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(createError(400, "Dữ liệu không hợp lệ", error.errors));
        }
        next(error);
    }
};

/**
 * Ẩn sản phẩm
 */
export const hideProductController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await hideProduct(id);
        if (!product) {
            return next(createError(404, "Sản phẩm không tồn tại"));
        }
        res.json(customResponse(200, "Ẩn sản phẩm thành công", product));
    } catch (error) {
        next(error);
    }
};

/**
 * Hiển thị sản phẩm
 */
export const showProductController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await showProduct(id);
        if (!product) {
            return next(createError(404, "Sản phẩm không tồn tại"));
        }
        res.json(customResponse(200, "Hiển thị sản phẩm thành công", product));
    } catch (error) {
        next(error);
    }
};

/**
 * Danh sách 10 sản phẩm bán chạy nhất
 */
export const getTopSellingProductsController = async (req, res, next) => {
    try {
        const products = await getTopSellingProducts();
        res.json(customResponse(200, "Lấy danh sách sản phẩm bán chạy thành công", products));
    } catch (error) {
        next(error);
    }
};

/**
 * Danh sách 10 sản phẩm mới nhất
 */
export const getLatestProductsController = async (req, res, next) => {
    try {
        const products = await getLatestProducts();
        res.json(customResponse(200, "Lấy danh sách sản phẩm mới nhất thành công", products));
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy toàn bộ danh sách sản phẩm
 */
export const getAllProductsController = async (req, res, next) => {
    try {
        const validatedQuery = paginationSchema.parse(req.query);
        const result = await getProductList({ ...validatedQuery, isHide: false });
        res.json(customResponse(200, "Lấy danh sách sản phẩm thành công", result));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(createError(400, "Query không hợp lệ", error.errors));
        }
        next(error);
    }
};

/**
 * Lấy chi tiết sản phẩm + sản phẩm liên quan
 */
export const getProductDetailController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);
        if (!product) {
            return next(createError(404, "Sản phẩm không tồn tại"));
        }
        const relatedProducts = await getRelatedProducts(id);
        res.json(
            customResponse(200, "Lấy chi tiết sản phẩm thành công", {
                product,
                relatedProducts,
            }),
        );
    } catch (error) {
        next(error);
    }
};
