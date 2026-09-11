import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api, { getErrorMessage } from "../services/api.js";
import Alert from "../components/Alert.jsx";

const Checkout = () => {
  const { cart, totalPrice, refreshCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    for (const [key, value] of Object.entries(form)) {
      if (!value.trim()) return `Please fill in the ${key} field`;
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        shippingAddress: form,
        paymentMethod,
      });
      await refreshCart();
      navigate(`/orders/${data.data.order._id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedShipping = totalPrice >= 100 ? 0 : 10;
  const estimatedTax = Number((totalPrice * 0.08).toFixed(2));
  const estimatedTotal = Number((totalPrice + estimatedShipping + estimatedTax).toFixed(2));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <Alert type="error" message={error} />

      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 card p-6 space-y-4" noValidate>
          <h2 className="font-semibold text-lg">Shipping Address</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Street Address</label>
            <input name="street" className="input-field" value={form.street} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input name="city" className="input-field" value={form.city} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input name="state" className="input-field" value={form.state} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input
                name="postalCode"
                className="input-field"
                value={form.postalCode}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input name="country" className="input-field" value={form.country} onChange={handleChange} />
            </div>
          </div>

          <h2 className="font-semibold text-lg pt-2">Payment Method</h2>
          <div className="space-y-2 text-sm">
            {[
              { value: "cod", label: "Cash on Delivery" },
              { value: "card", label: "Credit / Debit Card" },
              { value: "upi", label: "UPI" },
              { value: "paypal", label: "PayPal" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-4">
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <div className="card p-6 h-fit">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.product} className="flex justify-between text-sm mb-2">
              <span className="truncate pr-2">
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr className="my-3" />
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Shipping</span>
            <span>{estimatedShipping === 0 ? "Free" : `$${estimatedShipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Tax</span>
            <span>${estimatedTax.toFixed(2)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${estimatedTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
