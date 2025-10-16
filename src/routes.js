"use strict";

import { Router } from "express";
import productRouter from "./modules/product/product.route.js";
import authRouter from "./modules/auth/auth.route.js";

const routes = Router();

routes.use("/products", productRouter);
routes.use("/auth", authRouter);

export default routes;
