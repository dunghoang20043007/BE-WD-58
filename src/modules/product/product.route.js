import { Router } from "express";
import { productController } from "./product.controller.js";

const productRouter = Router();

productRouter.get("/all", productController.getAllProducts);
productRouter.get("/top-sold", productController.getTop10ProductSold);
productRouter.get("/latest", productController.getTopLatestProducts);
productRouter.get("/:id", productController.getDetailedProduct);
productRouter.get("/admin/all", productController.getAllProductAdmin);

export default productRouter;
