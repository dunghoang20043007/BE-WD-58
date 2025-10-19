import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import Brand from "../modules/brand/brand.model.js";
import Product from "../modules/product/models/product.model.js";
import ProductVariation from "../modules/product/models/variant.model.js";
import { PRODUCT_STATUS } from "../common/constants/productStatus.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI || "mongodb://localhost:27017/ecommerce");
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

const clearData = async () => {
    console.log("Clearing old data...");
    await Promise.all([Brand.deleteMany({}), Product.deleteMany({}), ProductVariation.deleteMany({})]);
    console.log("Old data cleared");
};

const createBrands = async (count = 50) => {
    console.log(`Creating ${count} brands...`);
    const brands = [];
    const brandNames = new Set();

    while (brandNames.size < count) {
        brandNames.add(faker.company.name());
    }

    for (const name of brandNames) {
        brands.push({
            name,
            logo: faker.image.url({ width: 200, height: 200 }),
        });
    }

    const createdBrands = await Brand.insertMany(brands);
    console.log(`Created ${createdBrands.length} brands`);
    return createdBrands;
};

const productImages = [
    "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-plus_2.png",
    "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/o/p/op-lung-samsung-galaxy-s24-kem-day-6_1.png",
    "https://cdn2.cellphones.com.vn/insecure/rs:fill:300:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone_air-3_2.jpg",
    "https://cdn2.cellphones.com.vn/insecure/rs:fill:300:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-17-pro-max_3.jpg",
    "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max_1.png",
    "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14t-pro_1.png",
    "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra_6.png",
    "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/o/p/oppo-reno12-5g_2.png",
];

const createProducts = async (brands, count = 50) => {
    console.log(`Creating ${count} products...`);
    const products = [];

    for (let i = 0; i < count; i++) {
        const brand = faker.helpers.arrayElement(brands);
        const imageCount = faker.number.int({ min: 1, max: 4 });
        const images = Array.from({ length: imageCount }, () => faker.helpers.arrayElement(productImages));

        products.push({
            name: `${faker.commerce.productName()} ${faker.string.alphanumeric(4).toUpperCase()}`,
            description: faker.commerce.productDescription(),
            discount: faker.number.int({ min: 0, max: 50 }),
            images,
            imageUrlRefs: images,
            thumbnail: images[0],
            thumbnailUrlRef: images[0],
            parentSku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
            status: faker.helpers.arrayElement([PRODUCT_STATUS.NEW, PRODUCT_STATUS.USED]),
            isAvailable: faker.helpers.maybe(() => true, { probability: 0.9 }) || false,
            isDeleted: false,
            isHide: faker.helpers.maybe(() => true, { probability: 0.1 }) || false,
            attributes: [
                {
                    key: "color",
                    name: "Màu sắc",
                    value: faker.color.human(),
                },
                {
                    key: "material",
                    name: "Chất liệu",
                    value: faker.commerce.productMaterial(),
                },
            ],
            rating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
            reviewCount: faker.number.int({ min: 0, max: 1000 }),
            // variationIds: [], // bỏ vì sẽ được set sau khi tạo variations
            brandId: brand._id,
            priceFilter: faker.number.int({ min: 100000, max: 50000000 }),
            attributeVariantForFilter: [],
        });
    }

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);
    return createdProducts;
};

const createProductVariations = async (products, count = 50) => {
    console.log(`Creating ${count} product variations...`);
    const variations = [];

    // Tạo variations cho tất cả products
    for (const product of products) {
        const variationCount = faker.number.int({ min: 2, max: 5 });

        for (let i = 0; i < variationCount; i++) {
            const storage = faker.helpers.arrayElement(["64GB", "128GB", "256GB", "512GB", "1TB"]);
            const color = faker.color.human();
            const variantImage = faker.helpers.arrayElement(productImages);

            // Đảm bảo sold <= quantity
            const sold = faker.number.int({ min: 0, max: 300 });
            const quantity = faker.number.int({ min: sold, max: 500 });

            variations.push({
                price: faker.number.int({ min: 1000000, max: 50000000 }),
                image: variantImage,
                imageUrlRef: variantImage,
                quantity,
                sold,
                sku: `${product.parentSku}-${storage}-${faker.string.alphanumeric(3).toUpperCase()}`,
                isActive: faker.helpers.maybe(() => true, { probability: 0.9 }) || false,
                variantAttributes: [
                    {
                        key: "storage",
                        name: "Dung lượng",
                        value: storage,
                    },
                    {
                        key: "color",
                        name: "Màu sắc",
                        value: color,
                    },
                ],
                // productId: product._id, // bỏ vì model đã thay đổi
            });
        }
    }

    const createdVariations = await ProductVariation.insertMany(variations);
    console.log(`Created ${createdVariations.length} product variations`);

    // Liên kết variations với products tương ứng
    let variationIndex = 0;
    for (const product of products) {
        const variationCount = faker.number.int({ min: 2, max: 5 });
        const productVariations = createdVariations.slice(variationIndex, variationIndex + variationCount);
        const variationIds = productVariations.map((v) => v._id);

        await Product.findByIdAndUpdate(product._id, {
            variationIds,
            priceFilter: productVariations[0]?.price || product.priceFilter,
        });

        variationIndex += variationCount;
    }

    console.log("Updated all products with variation IDs");
    return createdVariations;
};

const seedDatabase = async () => {
    try {
        await connectDB();
        await clearData();

        const brands = await createBrands(50);
        const products = await createProducts(brands, 50);
        await createProductVariations(products, 50);

        console.log("\n✅ Database seeded successfully!");
        console.log(`   - Brands: ${brands.length}`);
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Variations: Created for all products`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
