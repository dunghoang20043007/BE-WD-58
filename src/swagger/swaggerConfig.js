// import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

const swaggerDocument = JSON.parse(fs.readFileSync("./src/swagger/swaggerOutput.json", "utf8"));

const setupSwagger = (app) => {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default setupSwagger;
