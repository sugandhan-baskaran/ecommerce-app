import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../services/api.js";
import Spinner from "../../components/Spinner.jsx";
import Alert from "../../components/Alert.jsx";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  brand: "",
  stock: "",
  images: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products?limit=100&sort=-createdAt");
      setProducts(data.data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || "",
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      images: (product.images || []).join(", "),
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
      stock: Number(form.stock),
      images: form.images
        ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage({ type: "success", text: "Product updated" });
      } else {
        await api.post("/products", payload);
        setMessage({ type: "success", text: "Product created" });
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this product? This cannot be undone from the UI.")) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage({ type: "success", text: "Product removed" });
      fetchProducts();
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Close" : "+ Add Product"}
        </button>
      </div>

      <Alert type={message.type || "info"} message={message.text} />

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" className="input-field" value={form.name} onChange={handleChange} required />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              className="input-field"
              rows={3}
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount Price (optional)</label>
            <input
              name="discountPrice"
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              value={form.discountPrice}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              name="category"
              className="input-field"
              value={form.category}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input name="brand" className="input-field" value={form.brand} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              name="stock"
              type="number"
              min="0"
              className="input-field"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URLs (comma-separated)</label>
            <input name="images" className="input-field" value={form.images} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              {editingId ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-gray-100">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">${p.price.toFixed(2)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 space-x-3">
                    <button onClick={() => handleEdit(p)} className="text-primary-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
