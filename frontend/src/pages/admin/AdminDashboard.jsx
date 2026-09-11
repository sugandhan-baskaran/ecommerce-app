import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import Spinner from "../../components/Spinner.jsx";

const StatCard = ({ label, value }) => (
  <div className="card p-6">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Orders by Status</h2>
          <ul className="text-sm space-y-2">
            {stats.ordersByStatus.map((s) => (
              <li key={s._id} className="flex justify-between capitalize">
                <span>{s._id}</span>
                <span className="font-medium">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">Quick Links</h2>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/admin/products" className="text-primary-600 hover:underline">
              Manage Products →
            </Link>
            <Link to="/admin/orders" className="text-primary-600 hover:underline">
              Manage Orders →
            </Link>
          </div>
          {stats.lowStockProducts > 0 && (
            <p className="text-xs text-amber-600 mt-4">
              ⚠ {stats.lowStockProducts} product(s) low on stock (≤ 5 units)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
