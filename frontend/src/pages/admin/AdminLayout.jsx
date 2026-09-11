import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const AdminLayout = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid md:grid-cols-[200px_1fr] gap-8">
      <aside className="space-y-1">
        <NavLink to="/admin" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/products" className={linkClass}>
          Products
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass}>
          Orders
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          Users
        </NavLink>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;
