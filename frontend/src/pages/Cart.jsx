import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const CartPage = () => {
  const { cart, totalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Browse our products and add something you like.</p>
        <Link to="/products" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.product} className="card p-4 flex gap-4 items-center">
              <img
                src={item.image || "https://placehold.co/100x100?text=No+Image"}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-md bg-gray-100"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.product, Math.max(1, Number(e.target.value)))}
                className="input-field w-20"
              />
              <p className="font-semibold w-20 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.product)}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Shipping and tax calculated at checkout.</p>
          <button onClick={() => navigate("/checkout")} className="btn-primary w-full">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
