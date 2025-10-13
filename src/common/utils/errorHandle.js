import customResponse from "./customResponse.js";

const errorHandler = (err, req, res, next) => {
    customResponse(res, err.statusCode || 500, err.message || "SERVER ERROR");
};

export default errorHandler;
