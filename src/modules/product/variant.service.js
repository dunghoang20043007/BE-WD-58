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
        // Remove from product's variations array
        await Product.findByIdAndUpdate(variant.product, {
            $pull: { variations: variantId },
        });
    }
    return variant;
};

/**
 * Lấy variant theo ID
 * @param {String} variantId - ID variant
 * @returns {Object} Variant
 */
export const getVariantById = async (variantId) => {
    return await ProductVariation.findById(variantId).populate("product");
};

/**
 * Lấy danh sách variants theo product
 * @param {String} productId - ID sản phẩm
 * @returns {Array} Danh sách variants
 */
export const getVariantsByProduct = async (productId) => {
    return await ProductVariation.find({ product: productId, isActive: true });
};

/**
 * Cập nhật stock của variant
 * @param {String} variantId - ID variant
 * @param {Number} newStock - Stock mới
 * @returns {Object} Variant đã cập nhật
 */
export const updateVariantStock = async (variantId, newStock) => {
    return await ProductVariation.findByIdAndUpdate(variantId, { stock: newStock }, { new: true });
};

/**
 * Tăng stock (khi rollback)
 * @param {String} variantId - ID variant
 * @param {Number} quantity - Số lượng tăng
 * @returns {Object} Variant đã cập nhật
 */
export const increaseVariantStock = async (variantId, quantity) => {
    return await ProductVariation.findByIdAndUpdate(variantId, { $inc: { stock: quantity } }, { new: true });
};

/**
 * Giảm stock (khi bán)
 * @param {String} variantId - ID variant
 * @param {Number} quantity - Số lượng giảm
 * @returns {Object} Variant đã cập nhật
 */
export const decreaseVariantStock = async (variantId, quantity) => {
    return await ProductVariation.findByIdAndUpdate(
        variantId,
        { $inc: { stock: -quantity, sold: quantity } },
        { new: true },
    );
};

/**
 * Kiểm tra stock đủ cho variant
 * @param {String} variantId - ID variant
 * @param {Number} quantity - Số lượng cần kiểm tra
 * @returns {Boolean} True nếu đủ stock
 */
export const checkVariantStock = async (variantId, quantity) => {
    const variant = await ProductVariation.findById(variantId);
    return variant && variant.stock >= quantity;
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
        .populate("product")
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
 * Lấy variants có stock thấp
 * @param {Number} threshold - Ngưỡng stock
 * @returns {Array} Danh sách variants
 */
export const getLowStockVariants = async (threshold = 10) => {
    return await ProductVariation.find({
        stock: { $lte: threshold },
        isActive: true,
    }).populate("product");
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
