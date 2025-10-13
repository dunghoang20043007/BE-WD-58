export const customResponse = (res, statusCode, message, data = null, meta = null) => {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message,
        ...(data !== null && { data }),
        meta,
    };

    return res.status(statusCode).json(response);
};

export default customResponse;
