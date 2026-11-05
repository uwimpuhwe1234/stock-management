const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const validateProduct = (body) => {
  const errors = [];
  const { product_name, category, quantity, unit_price } = body;

  if (typeof product_name !== "string" || product_name.trim() === "") {
    errors.push("Product name is required.");
  }

  if (typeof category !== "string" || category.trim() === "") {
    errors.push("Category is required.");
  }

  if (quantity === undefined || quantity === null || quantity === "") {
    errors.push("Quantity is required.");
  } else {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      errors.push("Quantity must be a positive whole number.");
    }
  }

  if (unit_price === undefined || unit_price === null || unit_price === "") {
    errors.push("Unit price is required.");
  } else {
    const price = Number(unit_price);
    if (!Number.isFinite(price) || price <= 0) {
      errors.push("Unit price must be greater than zero.");
    }
  }

  return errors;
};

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, product_name, category, quantity, unit_price FROM products ORDER BY id ASC"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("GET /api/products failed:", error.message);
    res.status(500).json({ message: "Failed to retrieve products." });
  }
});

app.post("/api/products", async (req, res) => {
  const errors = validateProduct(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const { product_name, category, quantity, unit_price } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO products (product_name, category, quantity, unit_price) VALUES (?, ?, ?, ?)",
      [product_name.trim(), category.trim(), Number(quantity), Number(unit_price)]
    );

    const [rows] = await pool.query(
      "SELECT id, product_name, category, quantity, unit_price FROM products WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Product registered successfully.",
      product: rows[0],
    });
  } catch (error) {
    console.error("POST /api/products failed:", error.message);
    res.status(500).json({ message: "Failed to register product." });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON in request body." });
  }
  console.error("Unhandled error:", error.message);
  res.status(500).json({ message: "Internal server error." });
});

const start = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to MySQL database:", process.env.DB_NAME);
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
