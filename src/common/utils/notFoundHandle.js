import customResponse from "./customResponse.js";

const notFoundHandler = (req, res, next) => {
    customResponse(res, 404, "ROUTE NOT FOUND", null, null);
};

export default notFoundHandler;
