import cors from "cors";
import express from "express";
import morgan from "morgan";
import { NODE_ENV, PORT } from "./src/common/configs/environment.js";
import { checkVersion } from "./src/common/configs/nodeVersion.js";
import setupSwagger from "./src/swagger/swaggerConfig.js";
import routes from "./src/routes.js";
import notFoundHandler from "./src/common/utils/notFoundHandle.js";
import errorHandler from "./src/common/utils/errorHandle.js";
import Brand from "./src/modules/brand/brand.model.js";
import connectDB from "./src/common/configs/database.js";
checkVersion();
const app = express();
app.use(express.json());

app.use(cors());
setupSwagger(app);
if (NODE_ENV === "development") {
    console.log("Morgan Dev Running");
    app.use(morgan("dev"));
}

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, async () => {
    await connectDB();
    console.log("Starting API");
    NODE_ENV === "development" &&
        console.log(`• API: http://localhost:${PORT}/api \n• SWAGGER-DOCS: http://127.0.0.1:${PORT}/docs`);
});

process.on("unhandledRejection", async (error) => {
    console.error(`Error: ${error.message}`);
    server.close(() => process.exit(1));
});
