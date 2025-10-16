import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { APIQuery } from "../../common/utils/APIQuery.js";
import Product from "./models/product.model.js";
import customResponse from "../../common/utils/customResponse.js";
import { NotFoundError } from "../../errors/customerErr.js";

const queryClientFields = {
    name: 1,
    thumbnail: 1,
    images: 1,
    rating: 1,
    reviewCount: 1,
    attributes: 1,
    discountPercentage: 1,
    categoryId: 1,
    brandId: 1,
    variationIds: 1,
    priceFilter: 1,
    attributeVariantForFilter: 1,
};

const transformQuery = (query) => {
    const queryCopy = { ...query };
    //Delete key not attribute or variant

    const attributeQueries = [];
    const variantQueries = [];
    Object.keys(query).forEach((key) => {
        const values = query[key].split(",");
        if (values[0] === "variant") {
            const variantValues = values.slice(1);
            variantQueries.push({
                attributeVariantForFilter: { $elemMatch: { key, value: { $in: variantValues } } },
            });
        } else {
            attributeQueries.push({
                attributes: { $elemMatch: { key, value: { $in: values } } },
            });
        }
    });
    const combinedVariantQuery = variantQueries.length > 0 ? { $and: variantQueries } : {};
    const combinedAttributeQuery = attributeQueries.length > 0 ? { $and: attributeQueries } : {};

    return { attributeQuery: combinedAttributeQuery, variantQuery: combinedVariantQuery };
};
const populateVariation = {
    path: "variationIds",
    select: "price image sku productId stock sold variantAttributes imageUrlRef isActive",
    model: "ProductVariation",
    options: { sort: "price" },
};
const populateCategory = {
    path: "categoryId",
    model: "Category",
};
const populateBrand = {
    path: "brandId",
    model: "Brand",
};
const clientRequiredFields = { isDeleted: false, isAvailable: true, isHide: false };

// query attribute conversion function for attribute and variant

// @Get: getAllProducts
const getAllProducts = async (req, res, next) => {
    const page = req.query.page ? +req.query.page : 1;
    req.query.limit = String(req.query.limit || 10);
    const queryCopy = { ...req.query };

    Object.keys(queryCopy).forEach((el) => {
        if (!el.includes("raw")) {
            delete queryCopy[el];
        }
    });
    let queryStr = JSON.stringify(queryCopy);
    // Remove the word "raw"
    queryStr = queryStr.replace(/\braw/g, "");
    // Replace comparison operators
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // convert back to object
    const queryVariant = JSON.parse(queryStr);
    const queryTransformed = transformQuery(queryVariant);

    const populateVariantAndFilter = {
        ...populateVariation,
    };
    const features = APIQuery(
        Product.find({ ...clientRequiredFields, ...queryTransformed.attributeQuery, ...queryTransformed.variantQuery })
            .populate(populateVariantAndFilter)
            .select(queryClientFields)
            .lean(),
        req.query,
    );

    features.filter().sort().limitFields().search().paginate();
    const [data, totalDocs] = await Promise.all([features.query, features.count()]);

    const totalPages = Math.ceil(Number(totalDocs) / +req.query.limit);

    return customResponse(res, StatusCodes.OK, ReasonPhrases.OK, data, {
        limit: req.query.limit,
        page: page,
        totalDocs: totalDocs,
        totalPages: totalPages,
    });
};

// @Get: getDetailedProduct
const getDetailedProduct = async (req, res, next) => {
    const product = await Product.findOne(
        { _id: req.params.id, ...clientRequiredFields },
        { imageUrlRefs: 0, thumbnailUrlRef: 0 },
    )
        .populate(populateVariation)
        .populate(populateCategory)
        .populate(populateBrand);

    if (!product) throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} product with id: ${req.params.id}`);

    return product;
};

// @Get Top Latest Products
const getTopLatestProducts = async (req, res, next) => {
    const topLatestProducts = await Product.find(clientRequiredFields)
        .select(queryClientFields)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate(populateVariation)
        .lean();
    const filteredData = topLatestProducts.filter((item) => item.variationIds.length > 0);

    return filteredData;
};

// @Get Top 10 Product Sold
const getTop10ProductSold = async (req, res, next) => {
    const products = await Product.find({
        ...clientRequiredFields,
    })
        .select(queryClientFields)
        .populate(populateVariation)
        .lean();
    const filteredData = products
        .map((item) => {
            const totalSold = item.variationIds.reduce((acc, curr) => acc + curr.sold, 0);
            return { ...item, totalSold };
        })
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10);

    return filteredData;
};

// // @Get Top Reviews
//  const getTopReviewsProducts = async (req, res, next) => {
//     const topReviewsProducts = await Product.find(clientRequiredFields)
//         .populate(populateVariation)
//         .select(queryClientFields)
//         .sort({ reviewCount: -1 })
//         .limit(5);
//     return res.status(StatusCodes.OK).json(
//         customResponse({
//             data: topReviewsProducts,
//             success: true,
//             status: StatusCodes.OK,
//             message: ReasonPhrases.OK,
//         }),
//     );
// };
// // @Get: getDetailedProduct for admin
//  const getDetailedProductAdmin = async (req, res, next) => {
//     const product = await Product.findOne({ _id: req.params.id })
//         .populate(populateVariation)
//         .populate(populateCategory)
//         .populate(populateBrand);

//     if (!product) throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} product with id: ${req.params.id}`);

//     return res.status(StatusCodes.OK).json(
//         customResponse({
//             data: product,
//             success: true,
//             status: StatusCodes.OK,
//             message: ReasonPhrases.OK,
//         }),
//     );
// };
// // @Get: getDetailed Product for review
//  const getDetailedProductReview = async (req, res, next) => {
//     const product = await Product.findOne({ _id: req.params.id }).select({
//         isHide: 1,
//         isDeleted: 1,
//     });

//     if (!product) throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} product with id: ${req.params.id}`);

//     return res.status(StatusCodes.OK).json(
//         customResponse({
//             data: product,
//             success: true,
//             status: StatusCodes.OK,
//             message: ReasonPhrases.OK,
//         }),
//     );
// };

// // @Get all products for admin
//  const getAllProductAdmin = async (req, res, next) => {
//     const page = req.query.page ? +req.query.page : 1;
//     const features = new APIQuery(
//         Product.find().populate(populateVariation).populate(populateCategory).populate(populateBrand),
//         req.query,
//     );
//     features.filter().sort().limitFields().search().paginate();

//     const [data, totalDocs] = await Promise.all([features.query, features.count()]);
//     const totalPages = Math.ceil(Number(totalDocs) / page);
//     return res.status(StatusCodes.OK).json(
//         customResponse({
//             data: {
//                 products: data,
//                 page: page,
//                 totalDocs: totalDocs,
//                 totalPages: totalPages,
//             },
//             success: true,
//             status: StatusCodes.OK,
//             message: ReasonPhrases.OK,
//         }),
//     );
// };

// // @Post: createNewProduct
//  const createNewProduct = async (req, res, next) => {
//     let variationObjs;

//     const files = req.files;
//     if (files && files["thumbnail"]) {
//         const { fileUrlRefs, fileUrls } = await uploadFiles(files["thumbnail"]);
//         req.body.thumbnail = fileUrls[0];
//         req.body.thumbnailUrlRef = fileUrlRefs[0];
//     }

//     if (files && files["images"]) {
//         const { fileUrlRefs, fileUrls } = await uploadFiles(files["images"]);
//         req.body.images = fileUrls;
//         req.body.imageUrlRefs = fileUrlRefs;
//     }
//     if (files && files["variationImages"]) {
//         const { fileUrls, fileUrlRefs, originNames } = await uploadFiles(files["variationImages"]);
//         variationObjs = fileUrls.map((item, i) => {
//             const variation = req.body.variationsString.find((obj) => {
//                 const originName = originNames[i];
//                 const fileName = obj.imageUrlRef;
//                 return fileName === originName;
//             });
//             if (variation) {
//                 return { ...variation, image: item, imageUrlRef: fileUrlRefs[i] };
//             }
//         });
//     }
//     const attributeVariantForFilter = variationObjs.flatMap((item) =>
//         item.variantAttributes.map((attr) => ({ key: attr.key, value: attr.value })),
//     );

//     const attributes = req.body.attributes;
//     delete req.body.variationImages;
//     delete req.body.variationsString;

//     // @add product
//     const newProduct = new Product({
//         ...req.body,
//         attributes,
//         attributeVariantForFilter,
//         priceFilter: variationObjs[0].price,
//     });

//     // @generate variations
//     const variations = variationObjs.map((item) => {
//         return { productId: newProduct._id, ...item };
//     });

//     // @add variation ids to product
//     const newVariations = await ProductVariation.insertMany(variations);
//     const variationIds = newVariations.map((variation) => variation._id);
//     newProduct.set({ variationIds: variationIds });
//     await newProduct.save();

//     return res.status(StatusCodes.CREATED).json(
//         customResponse({
//             data: { newProduct, variationObjs, variations },
//             success: true,
//             status: StatusCodes.CREATED,
//             message: ReasonPhrases.CREATED,
//         }),
//     );
// };

// // @Patch: updateProduct
//  const updateProduct = async (req, res, next) => {
//     const files = req.files;
//     const product = await Product.findById(req.params.id);
//     const attributeVariantForFilter = req.body.attributeVariantForFilter;
//     // @Keep old images
//     const { oldImageRefs, oldImages } = req.body;

//     if (!product) throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} product with id: ${req.params.id}`);

//     if (files && files["thumbnail"]) {
//         if (product.thumbnailUrlRef) await removeUploadedFile(product.thumbnailUrlRef);

//         const { fileUrlRefs, fileUrls } = await uploadFiles(files["thumbnail"]);
//         req.body.thumbnail = fileUrls[0];
//         req.body.thumbnailUrlRef = fileUrlRefs[0];
//     }

//     if (files && files["images"]) {
//         const { fileUrlRefs, fileUrls } = await uploadFiles(files["images"]);
//         req.body.images = [...oldImages, ...fileUrls];
//         req.body.imageUrlRefs = [...oldImageRefs, ...fileUrlRefs];
//     } else {
//         if (product.imageUrlRefs && product.imageUrlRefs.length) {
//             // @Remove images not in oldImageRefs
//             await Promise.all(
//                 product.imageUrlRefs
//                     .filter((imageUrlRef) => !oldImageRefs.includes(imageUrlRef))
//                     .map((imageUrlRef) => removeUploadedFile(imageUrlRef)),
//             );
//             req.body.images = oldImages;
//             req.body.imageUrlRefs = oldImageRefs;
//         }
//     }
//     product.set({ ...req.body, attributeVariantForFilter });
//     await product.save();

//     return res
//         .status(StatusCodes.OK)
//         .json(customResponse({ data: product, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
// };

// // @Patch: updateProduct variation
//  const updateProductVariation = async (req, res, next) => {
//     const files = req.files;
//     const productVariation = await ProductVariation.findById(req.params.variationId);
//     const variant = req.body.variantString ? JSON.parse(req.body.variantString) : {};
//     if (!productVariation)
//         throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} product variation with id: ${req.params.variationId}`);

//     if (files && files["image"]) {
//         if (productVariation.imageUrlRef) await removeUploadedFile(productVariation.imageUrlRef);

//         const { fileUrlRefs, fileUrls } = await uploadFiles(files["image"]);
//         variant.image = fileUrls[0];
//         variant.imageUrlRef = fileUrlRefs[0];
//     }
//     productVariation.set({ ...variant });
//     await productVariation.save();

//     return res.status(StatusCodes.OK).json(
//         customResponse({
//             data: productVariation,
//             success: true,
//             status: StatusCodes.OK,
//             message: ReasonPhrases.OK,
//         }),
//     );
// };

// // @Post: updateProduct variation
//  const addNewVariationToProduct = async (req, res, next) => {
//     const productId = req.body.productId;
//     const files = req.files;
//     const product = await Product.findById(productId);
//     const variant = req.body.variantString ? JSON.parse(req.body.variantString) : {};
//     if (!product) throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} product with id: ${productId}`);

//     if (files && files["image"]) {
//         const { fileUrlRefs, fileUrls } = await uploadFiles(files["image"]);
//         variant.image = fileUrls[0];
//         variant.imageUrlRef = fileUrlRefs[0];
//     }

//     const newVariation = await ProductVariation.create({ ...variant, productId });
//     product.set({ variationIds: [...product.variationIds, newVariation._id] });
//     await product.save();
//     return res.status(StatusCodes.OK).json(
//         customResponse({
//             data: product,
//             success: true,
//             status: StatusCodes.OK,
//             message: ReasonPhrases.OK,
//         }),
//     );
// };

// // @PATCH: hiddenProduct
//  const hiddenProduct = async (req, res, next) => {
//     const productId = req.params.productId;
//     const product = await Product.findOneAndUpdate({ _id: productId, isHide: false }, { isHide: true }, { new: true });

//     if (!product) {
//         throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} product with id: ${productId}`);
//     }

//     return res
//         .status(StatusCodes.OK)
//         .json(customResponse({ data: product, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
// };
// // @PATCH: showProduct
//  const showProduct = async (req, res, next) => {
//     const productId = req.params.productId;
//     const product = await Product.findOneAndUpdate({ _id: productId, isHide: true }, { isHide: false }, { new: true });

//     if (!product) {
//         throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} product with id: ${productId}`);
//     }

//     return res
//         .status(StatusCodes.OK)
//         .json(customResponse({ data: product, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
// };

// //GET: filterProductsBycategory
//  const filterProductsBycategory = async (req, res, next) => {
//     const categoryId = req.params.categoryId || null;
//     const category = await Category.findById(categoryId, { attributeIds: 1 }).populate("attributeIds").lean();
//     if (!category) throw new NotFoundError("Category not found");
//     const filteredAttributes = category.attributeIds.filter((attr) => {
//         return attr.isFilter === true;
//     });
//     return res.status(StatusCodes.OK).json(
//         customResponse({
//             data: filteredAttributes,
//             success: true,
//             status: StatusCodes.OK,
//             message: ReasonPhrases.OK,
//         }),
//     );
// };

export const productService = {
    getAllProducts,
    getDetailedProduct,
    getTop10ProductSold,
    getTopLatestProducts,
};
