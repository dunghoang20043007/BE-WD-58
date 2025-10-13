import swaggerAutogen from "swagger-autogen";
import { HOST, PORT } from "../common/configs/environment.js";

swaggerAutogen();

const outputFile = "./src/swagger/swaggerOutput.json";
const endpointsFiles = ["./src/routes.js"];

const swaggerConfig = {
    info: {
        title: "Back End API",
    },
    host: `${HOST}:${PORT}`,
    basePath: "/api",
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],

    securityDefinitions: {
        BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
        },
    },
};

swaggerAutogen()(outputFile, endpointsFiles, swaggerConfig);
