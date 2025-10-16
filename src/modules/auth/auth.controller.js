import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../common/utils/asyncHandler.js";
import customResponse from "../../common/utils/customResponse.js";
import { loginService, registerService } from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
    const response = await registerService(req.body);
    return customResponse(res, StatusCodes.CREATED, "Đăng ký thành công", response);
});

export const login = asyncHandler(async (req, res) => {
    const response = await loginService(req.body);
    return customResponse(res, StatusCodes.OK, "Đăng nhập thành công", response);
});
