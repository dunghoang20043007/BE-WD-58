import ProductVariation from "./models/variant.model.js";
import Product from "./models/product.model.js";

/**
 * Tạo mới variant
 * @param {Object} variantData - Dữ liệu variant
 * @returns {Object} Variant đã tạo
 */
export const createVariant = async (variantData) => {
    const variant = new ProductVariation(variantData);
    await variant.save();
    return variant;
};

/**
 * Cập nhật variant
 * @param {String} variantId - ID variant
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Object} Variant đã cập nhật
 */
export const updateVariant = async (variantId, updateData) => {
    return await ProductVariation.findByIdAndUpdate(variantId, updateData, { new: true });
};

/**
 * Xóa variant
 * @param {String} variantId - ID variant
 * @returns {Object} Variant đã xóa
 */
export const deleteVariant = async (variantId) => {
    const variant = await ProductVariation.findByIdAndDelete(variantId);
    if (variant) {
        // Cập nhật product để remove variation ID (logic này cần được xử lý ở controller/service level)
        // Vì variant không còn reference trực tiếp đến product
    }
    return variant;
};

/**
 * Lấy variant theo ID
 * @param {String} variantId - ID variant
 * @returns {Object} Variant
 */
export const getVariantById = async (variantId) => {
    return await ProductVariation.findById(variantId);
    // .populate("product"); // bỏ vì không còn relationship trực tiếp
};

/**
 * Lấy danh sách variants theo product
 * @param {String} productId - ID sản phẩm
 * @returns {Array} Danh sách variants
 */
export const getVariantsByProduct = async (productId) => {
    // Vì variant không còn reference trực tiếp đến product
    // Cần lấy từ product.variationIds hoặc tìm cách khác
    const product = await Product.findById(productId);
    if (!product || !product.variationIds) return [];
    return await ProductVariation.find({ _id: { $in: product.variationIds }, isActive: true });
};

/**
 * Cập nhật quantity của variant
 * @param {String} variantId - ID variant
 * @param {Number} newquantity - quantity mới
 * @returns {Object} Variant đã cập nhật
 */
export const updateVariantquantity = async (variantId, newquantity) => {
    return await ProductVariation.findByIdAndUpdate(variantId, { quantity: newquantity }, { new: true });
};

/**
 * Tăng quantity (khi rollback)
 * @param {String} variantId - ID variant
 * @param {Number} quantity - Số lượng tăng
 * @returns {Object} Variant đã cập nhật
 */
export const increaseVariantquantity = async (variantId, quantity) => {
    return await ProductVariation.findByIdAndUpdate(variantId, { $inc: { quantity: quantity } }, { new: true });
};

/**
 * Giảm quantity (khi bán)
 * @param {String} variantId - ID variant
 * @param {Number} quantity - Số lượng giảm
 * @returns {Object} Variant đã cập nhật
 */
export const decreaseVariantquantity = async (variantId, quantity) => {
    return await ProductVariation.findByIdAndUpdate(
        variantId,
        { $inc: { quantity: -quantity, sold: quantity } },
        { new: true },
    );
};

/**
 * Kiểm tra quantity đủ cho variant
 * @param {String} variantId - ID variant
 * @param {Number} quantity - Số lượng cần kiểm tra
 * @returns {Boolean} True nếu đủ quantity
 */
export const checkVariantquantity = async (variantId, quantity) => {
    const variant = await ProductVariation.findById(variantId);
    return variant && variant.quantity >= quantity;
};

/**
 * Vô hiệu hóa variant
 * @param {String} variantId - ID variant
 * @returns {Object} Variant đã cập nhật
 */
export const deactivateVariant = async (variantId) => {
    return await ProductVariation.findByIdAndUpdate(variantId, { isActive: false }, { new: true });
};

/**
 * Kích hoạt variant
 * @param {String} variantId - ID variant
 * @returns {Object} Variant đã cập nhật
 */
export const activateVariant = async (variantId) => {
    return await ProductVariation.findByIdAndUpdate(variantId, { isActive: true }, { new: true });
};

/**
 * Lấy danh sách variants với pagination
 * @param {Object} query - Query parameters
 * @returns {Object} Danh sách variants với pagination
 */
export const getVariantList = async (query = {}) => {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const variants = await ProductVariation.find(filters)
        // .populate("product") // bỏ vì không còn relationship trực tiếp
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await ProductVariation.countDocuments(filters);

    return {
        variants,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Lấy variants có quantity thấp
 * @param {Number} threshold - Ngưỡng quantity
 * @returns {Array} Danh sách variants
 */
export const getLowquantityVariants = async (threshold = 10) => {
    return await ProductVariation.find({
        quantity: { $lte: threshold },
        isActive: true,
    });
    // .populate("product"); // bỏ vì không còn relationship trực tiếp
};

/**
 * Cập nhật giá variant
 * @param {String} variantId - ID variant
 * @param {Number} newPrice - Giá mới
 * @returns {Object} Variant đã cập nhật
 */
export const updateVariantPrice = async (variantId, newPrice) => {
    return await ProductVariation.findByIdAndUpdate(variantId, { price: newPrice }, { new: true });
};
