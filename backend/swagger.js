import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LMS API",
            version: "1.0.0",
            description: "API documentation for the Learning Management System (LMS).",
        },
        servers: [
            {
                url: "https://lms-1-lavs.onrender.com/", // Change this to your actual API URL
                description: "Live Development Server",
            },
        ],
    },
    apis: ["./routes/*.js"], // Points to all route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger; // ✅ Use ES module export
