import { ZodError } from "zod";

export const validate =
    (schema, source = "body") =>
    (req, res, next) => {
        try {
            schema.parse(req[source]);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "ERROR_VALIDATION",
                    errors: error.errors.map((err) => ({
                        path: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            return res.status(500).json({ success: false, message: "Lỗi không xác định" });
        }
    };
