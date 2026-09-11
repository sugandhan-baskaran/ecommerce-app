import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import Spinner from "../components/Spinner.jsx";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my-orders")
      .then(({ data }) => setOrders(data.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-primary-300"
            >
              <div>
                <p className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
