import { ReasonPhrases, StatusCodes } from "http-status-codes";
import Product from "./models/product.model.js";
import customResponse, { successResponse } from "../../common/utils/customResponse.js";
import { NotFoundError } from "../../errors/customerErr.js";
// eslint-disable-next-line n/no-extraneous-import
import _ from "lodash";
import mongoose, { Query, Document } from "mongoose";

class APIQuery {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    /**
     * Filters the query based on the provided query parameters.
     * It removes parameters that are not related to filtering (page, sort, limit, fields, search)
     * and applies MongoDB operators (gte, gt, lte, lt) for filtering.
     * @example /api/v1/products?price[gte]=100&price[lte]=500&name=iphone
     */
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields", "search"];
        excludedFields.forEach((el) => delete queryObj[el]);
        // Remove 'raw' fields from queryObj (remove manual fields)
        Object.keys(queryObj).forEach((el) => {
            if (el.includes("raw")) {
                delete queryObj[el];
            }
        });
        Object.keys(queryObj).forEach((el) => {
            if (String(queryObj[el]).includes(",")) {
                queryObj[el] = { $in: queryObj[el].split(",") };
            }
        });
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    /**
     * Sorts the query results based on the provided query parameters.
     * If no sort parameter is provided, it defaults to sorting by the creation date in descending order.
     * @example /api/v1/products?sort=-price,rating,createdAt
     */
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }

        return this;
    }

    /**
     * Limits the fields returned in the query results based on the provided query parameters.
     * If no fields parameter is provided, it excludes the '__v' field.
     * @example /api/v1/products?fields=name,price,rating
     */
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }

        return this;
    }

    /**
     * Searches the query results based on the provided search parameter.
     * It checks if the search parameter is a valid ObjectId. If so, it searches by _id,
     * otherwise, it searches by name using a regular expression.
     * @example /api/v1/products?search=iphone
     */
    search() {
        if (this.queryString.search) {
            const isId = mongoose.Types.ObjectId.isValid(this.queryString.search);
            if (isId) {
                const search = this.queryString.search;
                this.query = this.query.find({ _id: search });
            } else {
                const search = _.toLower(this.queryString.search);
                this.query = this.query.find({ name: { $regex: search, $options: "i" } });
            }
        }
        return this;
    }

    /**
     * Paginates the query results based on the provided page and limit parameters.
     * Defaults to page 1 and limit 10 if not provided.
     * @example /api/v1/products?page=2&limit=20
     */
    paginate() {
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

    /**
     * Counts the total number of documents matching the query.
     * @returns {Promise<number>} - The total number of matching documents
     */
    async count() {
        const totalDocs = await this.query.model.countDocuments(this.query.getQuery());
        return totalDocs;
    }
}

const queryClientFields = {
    name: 1,
    thumbnail: 1,
    images: 1,
    rating: 1,
    reviewCount: 1,
    attributes: 1,
    discountPercentage: 1,
    brandId: 1,
    variationIds: 1,
    priceFilter: 1,
    attributeVariantForFilter: 1,
};

const transformQuery = (query) => {
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
    select: "price image sku productId quantity sold variantAttributes imageUrlRef isActive",
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
const clientRequiredFields = {};

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
    const features = new APIQuery(
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

// @Get all products for admin
const getAllProductAdmin = async (req, res, next) => {
    const page = req.query.page ? +req.query.page : 1;
    const features = new APIQuery(
        Product.find().populate(populateVariation).populate().populate(populateBrand),
        req.query,
    );
    features.filter().sort().limitFields().search().paginate();

    const [data, totalDocs] = await Promise.all([features.query, features.count()]);
    const totalPages = Math.ceil(Number(totalDocs) / page);

    return customResponse(res, StatusCodes.OK, ReasonPhrases.OK, data, {
        limit: req.query.limit,
        page: page,
        totalDocs: totalDocs,
        totalPages: totalPages,
    });
};

export const productService = {
    getAllProducts,
    getDetailedProduct,
    getTop10ProductSold,
    getTopLatestProducts,
    getAllProductAdmin,
};
