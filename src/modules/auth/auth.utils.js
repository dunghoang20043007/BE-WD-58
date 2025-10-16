import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = async (password, saltRounds = 10) => {
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
};

export const generateToken = (payload, secret = "DATN_WD58", expired = "30d") => {
    const token = jwt.sign(payload, secret, { expiresIn: expired });
    return token;
};
