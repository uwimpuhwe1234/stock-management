CREATE DATABASE IF NOT EXISTS stock_management;
USE stock_management;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

INSERT INTO products (product_name, category, quantity, unit_price) VALUES
('Sugar', 'Food', 20, 2000.00),
('Soap', 'Hygiene', 15, 1500.00),
('Rice', 'Food', 30, 2500.00);
