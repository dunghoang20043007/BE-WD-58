import Product from "./models/product.model.js";
import ProductVariation from "./models/variant.model.js";
import Category from "../category/category.model.js";
import Brand from "../brand/brand.model.js";
import Attribute from "../attribute/attribute.model.js";

/**
 * Tạo mới sản phẩm
 * @param {Object} productData - Dữ liệu sản phẩm
 * @returns {Object} Sản phẩm đã tạo
 */
export const createProduct = async (productData) => {
    const product = new Product(productData);
    await product.save();
    return product;
};

/**
 * Kiểm tra stock và số lượng cho sản phẩm hoặc variant
 * @param {String} productId - ID sản phẩm
 * @param {String} variantId - ID variant (optional)
 * @param {Number} quantity - Số lượng cần kiểm tra
 * @returns {Boolean} True nếu đủ stock
 */
export const checkStock = async (productId, variantId, quantity) => {
    if (variantId) {
        const variant = await ProductVariation.findById(variantId);
        if (!variant || variant.stock < quantity) return false;
    } else {
        // Kiểm tra tổng stock của tất cả variants
        const product = await Product.findById(productId).populate("variations");
        if (!product) return false;
        const totalStock = product.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
        if (totalStock < quantity) return false;
    }
    return true;
};

/**
 * Rollback stock và số lượng (tăng lại stock)
 * @param {String} productId - ID sản phẩm
 * @param {String} variantId - ID variant (optional)
 * @param {Number} quantity - Số lượng cần rollback
 */
export const rollbackStock = async (productId, variantId, quantity) => {
    if (variantId) {
        await ProductVariation.findByIdAndUpdate(variantId, { $inc: { stock: quantity } });
    } else {
        // Giả sử rollback cho variant đầu tiên hoặc logic khác
        const product = await Product.findById(productId).populate("variations");
        if (product && product.variations.length > 0) {
            await ProductVariation.findByIdAndUpdate(product.variations[0]._id, { $inc: { stock: quantity } });
        }
    }
};

/**
 * Ẩn sản phẩm
 * @param {String} productId - ID sản phẩm
 * @returns {Object} Sản phẩm đã cập nhật
 */
export const hideProduct = async (productId) => {
    return await Product.findByIdAndUpdate(productId, { isHide: true }, { new: true });
};

/**
 * Hiện sản phẩm
 * @param {String} productId - ID sản phẩm
 * @returns {Object} Sản phẩm đã cập nhật
 */
export const showProduct = async (productId) => {
    return await Product.findByIdAndUpdate(productId, { isHide: false }, { new: true });
};

/**
 * Cập nhật sản phẩm
 * @param {String} productId - ID sản phẩm
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Object} Sản phẩm đã cập nhật
 */
export const updateProduct = async (productId, updateData) => {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true });
};

/**
 * Lấy danh sách sản phẩm
 * @param {Object} query - Query parameters (page, limit, filter)
 * @returns {Object} Danh sách sản phẩm với pagination
 */
export const getProductList = async (query = {}) => {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const products = await Product.find(filters)
        .populate("brand")
        .populate("category")
        .populate("variations")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filters);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Lấy một sản phẩm
 * @param {String} productId - ID sản phẩm
 * @returns {Object} Sản phẩm
 */
export const getProductById = async (productId) => {
    return await Product.findById(productId).populate("brand").populate("category").populate("variations");
};

/**
 * Lấy 10 sản phẩm bán chạy nhất (dựa trên sold trong variations)
 * @returns {Array} Danh sách sản phẩm
 */
export const getTopSellingProducts = async () => {
    const products = await Product.aggregate([
        {
            $lookup: {
                from: "productvariations",
                localField: "variations",
                foreignField: "_id",
                as: "variations",
            },
        },
        {
            $addFields: {
                totalSold: { $sum: "$variations.sold" },
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "brands",
                localField: "brand",
                foreignField: "_id",
                as: "brand",
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
            },
        },
        { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    ]);
    return products;
};

/**
 * Lấy 10 sản phẩm mới nhất
 * @returns {Array} Danh sách sản phẩm
 */
export const getLatestProducts = async () => {
    return await Product.find({ isHide: false })
        .populate("brand")
        .populate("category")
        .populate("variations")
        .sort({ createdAt: -1 })
        .limit(10);
};

/**
 * Lấy sản phẩm liên quan (cùng category)
 * @param {String} productId - ID sản phẩm
 * @param {Number} limit - Số lượng
 * @returns {Array} Danh sách sản phẩm liên quan
 */
export const getRelatedProducts = async (productId, limit = 5) => {
    const product = await Product.findById(productId);
    if (!product || !product.category) return [];

    return await Product.find({
        _id: { $ne: productId },
        category: product.category,
        isHide: false,
    })
        .populate("brand")
        .populate("category")
        .populate("variations")
        .limit(limit);
};
