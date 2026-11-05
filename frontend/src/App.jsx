import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/products";

const emptyForm = {
  product_name: "",
  category: "",
  quantity: "",
  unit_price: "",
};

const formatPrice = (value) =>
  Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]);
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const validateForm = () => {
    if (!form.product_name.trim()) return "Product name is required.";
    if (!form.category.trim()) return "Category is required.";

    const quantity = Number(form.quantity);
    if (form.quantity === "" || !Number.isInteger(quantity) || quantity <= 0) {
      return "Quantity must be a positive whole number.";
    }

    const unitPrice = Number(form.unit_price);
    if (form.unit_price === "" || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      return "Unit price must be greater than zero.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: form.product_name.trim(),
          category: form.category.trim(),
          quantity: Number(form.quantity),
          unit_price: Number(form.unit_price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const details = data.errors?.join(" ") || data.message || "Failed to register product.";
        throw new Error(details);
      }

      setMessage({ type: "success", text: data.message || "Product registered successfully." });
      setForm(emptyForm);
      await fetchProducts();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Stock Management System</h1>
        <p>Register products and view the stock available in the shop.</p>
      </header>

      {message && (
        <div className={`message ${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <main className="layout">
        <section className="card">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="product_name">Product Name</label>
              <input
                id="product_name"
                name="product_name"
                type="text"
                value={form.product_name}
                onChange={handleChange}
                placeholder="e.g. Sugar"
              />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Food"
              />
            </div>

            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 20"
              />
            </div>

            <div className="field">
              <label htmlFor="unit_price">Unit Price</label>
              <input
                id="unit_price"
                name="unit_price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.unit_price}
                onChange={handleChange}
                placeholder="e.g. 2000.00"
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Add Product"}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-heading">
            <h2>View Products</h2>
            <button type="button" className="secondary" onClick={fetchProducts} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">
                      No products available. Add your first product.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.product_name}</td>
                      <td>{product.category}</td>
                      <td>{product.quantity}</td>
                      <td>{formatPrice(product.unit_price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
