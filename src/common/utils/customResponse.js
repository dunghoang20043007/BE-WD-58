import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const customResponse = (res, statusCode, message, data = null, meta = null) => {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message,
        ...(data !== null && { data }),
        meta,
    };

    return res.status(statusCode).json(response);
};

export const successResponse = (res, data) => {
    return customResponse(res, res, StatusCodes.OK, ReasonPhrases.OK, data);
};

export default customResponse;
