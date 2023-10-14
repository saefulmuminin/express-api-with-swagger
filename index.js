const express = require("express");
const app = express();
const morgan = require("morgan"); // Tambahkan modul morgan
const bodyParser = require("body-parser");
const cors = require("cors"); // Tambahkan ini jika Anda ingin mengaktifkan CORS
const port = process.env.PORT || 3000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined")); // Aktifkan morgan untuk logging

// Impor rute-rute yang telah Anda buat
const authRoutes = require("./src/routes/index.js"); // Sesuaikan dengan lokasi rute Anda

// Gunakan rute-rute tersebut
app.use("/", authRoutes);

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
