const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined"));

// Import middleware autentikasi
const authMiddleware = require("./src/middleware/authMiddleware.js"); // Sesuaikan dengan lokasi middleware autentikasi Anda

// Import rute-rute yang telah Anda buat
const authRoutes = require("./src/routes/index.js");

// Gunakan middleware autentikasi (sebelum rute yang memerlukan otentikasi)
app.use("/auth", authMiddleware.authMiddleware);

// Gunakan rute-rute yang memerlukan otentikasi
app.use("/auth", authRoutes);

// Contoh penggunaan adminMiddleware
// Gunakan middleware admin (sebelum rute yang memerlukan hak akses admin)
app.use("/admin", authMiddleware.adminMiddleware);

// Gunakan rute-rute yang memerlukan hak akses admin
app.use("/admin", authRoutes);

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "express api with swagger",
      version: "1.0.0",
      description:
        "A RESTful Express API powered by Swagger for documentation. This API provides various endpoints for user registration, authentication, data retrieval, and more. Use Swagger to explore and understand how to interact with this API.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  // Definisikan file-file yang mengandung komentar Swagger
  apis: ["./src/routes/index.js"],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
