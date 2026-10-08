import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("Please log in to add items to cart");
      return;
    }
    setAdding(true);
    setMessage("");
    const res = await addToCart(product._id, 1);
    setMessage(res.success ? "Added to cart" : res.message);
    setAdding(false);
  };

  return (
    <div className="card product-card overflow-hidden flex flex-col group h-full">
      <Link to={`/products/${product.slug || product._id}`} className="block">
        <div className="aspect-square bg-[#f0eee8] overflow-hidden relative">
          {hasDiscount && <span className="absolute z-10 top-3 left-3 bg-coral text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full">Sale</span>}
          <img
            src={product.images?.[0] || "https://placehold.co/400x400?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2"><p className="text-[10px] text-coral uppercase tracking-[0.15em] font-bold">{product.category}</p><span className="text-xs text-gray-500">★ {product.ratingsAverage?.toFixed(1) || "New"}</span></div>
        <Link to={`/products/${product.slug || product._id}`}>
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-coral">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-lg">${displayPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
          )}
        </div>
        {product.stock === 0 ? (
          <p className="text-xs text-red-500 mt-1">Out of stock</p>
        ) : product.stock <= 5 ? (
          <p className="text-xs text-amber-600 mt-1">Only {product.stock} left</p>
        ) : null}

        <button
          onClick={handleAdd}
          disabled={adding || product.stock === 0}
          className="btn-primary mt-3 w-full text-sm"
        >
          {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </button>
        {message && <p className="text-xs mt-1 text-gray-500">{message}</p>}
      </div>
    </div>
  );
};

export default ProductCard;
