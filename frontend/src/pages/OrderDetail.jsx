import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getErrorMessage } from "../services/api.js";
import Spinner from "../components/Spinner.jsx";
import Alert from "../components/Alert.jsx";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data.order);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: "Cancelled by customer" });
      setOrder(data.data.order);
      setMessage({ type: "success", text: "Order cancelled" });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <Alert type="error" message={message.text || "Order not found"} />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Alert type={message.type || "info"} message={message.text} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full capitalize ${statusColors[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-3">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.product} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <hr className="my-4" />
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${order.shippingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-3">Shipping Address</h2>
        <p className="text-sm text-gray-600">
          {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} {order.shippingAddress.postalCode},{" "}
          {order.shippingAddress.country}
        </p>
        <p className="text-sm text-gray-500 mt-2 capitalize">Payment: {order.paymentMethod}</p>
      </div>

      {["pending", "processing"].includes(order.status) && (
        <button onClick={handleCancel} className="btn-secondary text-red-600 border-red-200">
          Cancel Order
        </button>
      )}
    </div>
  );
};

export default OrderDetail;
