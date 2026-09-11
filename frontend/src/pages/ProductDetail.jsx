import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Spinner from "../components/Spinner.jsx";
import Alert from "../components/Alert.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data.product);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setMessage({ type: "error", text: "Please log in to add items to your cart" });
      return;
    }
    const res = await addToCart(product._id, quantity);
    setMessage(
      res.success
        ? { type: "success", text: "Added to cart" }
        : { type: "error", text: res.message }
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/products/${product._id}/reviews`, reviewForm);
      setProduct(data.data.product);
      setMessage({ type: "success", text: "Review submitted" });
      setReviewForm({ rating: 5, comment: "" });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    }
  };

  if (loading) return <Spinner />;
  if (!product) return <p className="text-center py-16 text-gray-500">Product not found.</p>;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Alert type={message.type || "info"} message={message.text} />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.images?.[0] || "https://placehold.co/600x600?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400 uppercase">{product.category}</p>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {product.ratingsAverage.toFixed(1)} ★ ({product.ratingsCount} reviews) • {product.brand}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold">${displayPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

          <p className="mt-4 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <input
              type="number"
              min={1}
              max={product.stock || 1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="input-field w-24"
            />
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary flex-1"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-14 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

        {product.reviews.length === 0 && (
          <p className="text-gray-500 text-sm mb-6">No reviews yet. Be the first to review!</p>
        )}

        <div className="space-y-4 mb-8">
          {product.reviews.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex justify-between text-sm font-medium">
                <span>{r.name}</span>
                <span>{r.rating} ★</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>

        {user && (
          <form onSubmit={handleReviewSubmit} className="card p-4 space-y-3">
            <h3 className="font-medium">Write a review</h3>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              className="input-field"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your thoughts (optional)"
              className="input-field"
              rows={3}
            />
            <button type="submit" className="btn-primary">
              Submit Review
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
