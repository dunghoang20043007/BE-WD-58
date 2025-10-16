import { Router } from "express";
import { login, register } from "./auth.controller.js";
import { validate } from "../../common/middlewares/validateBody.middleware.js";
import { loginValidation, registerValidation } from "./auth.validation.js";

const authRouter = Router();

authRouter.post("/register", validate(registerValidation), register);
authRouter.post("/login", validate(loginValidation), login);

export default authRouter;
