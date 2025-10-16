"use strict";

import { Router } from "express";
import productRouter from "./modules/product/product.route.js";

const routes = Router();

routes.use("/products", productRouter);

export default routes;
