import asyncHandler from "../../common/utils/asyncHandler.js";
import customResponse, { successResponse } from "../../common/utils/customResponse.js";
import { productService } from "./product.service.js";

// @Get: getAllCategories
const getAllProducts = asyncHandler(async (req, res, next) => {
    return await productService.getAllProducts(req, res, next);
});
// @Get: getTop10ProductSold
const getTop10ProductSold = asyncHandler(async (req, res, next) => {
    const data = await productService.getTop10ProductSold(req, res, next);
    return successResponse(res, data);
});
// @Get: getTopLatestProducts
const getTopLatestProducts = asyncHandler(async (req, res, next) => {
    const data = await productService.getTopLatestProducts(req, res, next);
    return successResponse(res, data);
});

// @Get: getDetailedProduct
const getDetailedProduct = asyncHandler(async (req, res, next) => {
    const product = await productService.getDetailedProduct(req, res, next);

    return successResponse(res, product);
});

export const productController = {
    getAllProducts,
    getTop10ProductSold,
    getTopLatestProducts,
    getDetailedProduct,
};
