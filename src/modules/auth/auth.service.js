import { StatusCodes } from "http-status-codes";
import { JWT_ACCESS_EXPIRED, JWT_ACCESS_SECRECT } from "../../common/configs/environment.js";
import createError from "../../common/utils/createError.js";
import { BadRequestError } from "../../errors/customerErr.js";
import User from "../user/user.model.js";
import { generateToken, hashPassword } from "./auth.utils.js";
import bcrypt from "bcryptjs";

export const registerService = async (payload) => {
    const existsUser = await User.findOne({ email: payload.email });
    if (existsUser) {
        throw createError(StatusCodes.BAD_REQUEST, "Tài khoản này đã được đăng ký!");
    }
    const password = await hashPassword(payload.password);
    const user = await User.create({ ...payload, password });
    return user;
};

export const loginService = async (payload) => {
    const findUser = await User.findOne({ email: payload.email });
    if (!findUser) {
        throw createError(StatusCodes.BAD_REQUEST, "Thông tin đăng nhập không chính xác!");
    }
    const matchedPassword = await bcrypt.compare(payload.password, findUser.password);
    if (!matchedPassword) {
        throw createError(StatusCodes.BAD_REQUEST, "Thông tin đăng nhập không chính xác!");
    }
    const jwtData = {
        _id: findUser._id,
        role: findUser.role,
    };
    const accessToken = generateToken(jwtData, JWT_ACCESS_SECRECT, JWT_ACCESS_EXPIRED);
    return { user: findUser, accessToken };
};
