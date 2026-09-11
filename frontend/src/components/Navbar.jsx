import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search ? `/products?search=${encodeURIComponent(search)}` : "/products");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="text-xl font-bold text-primary-700 shrink-0">
            ShopEase
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field rounded-r-none"
              aria-label="Search products"
            />
            <button type="submit" className="btn-primary rounded-l-none">
              Search
            </button>
          </form>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link to="/products" className="hover:text-primary-600">
              Products
            </Link>
            <Link to="/cart" className="relative hover:text-primary-600">
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/orders" className="hover:text-primary-600">
                  My Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-primary-600">
                    Admin
                  </Link>
                )}
                <span className="text-gray-500">Hi, {user.name.split(" ")[0]}</span>
                <button onClick={handleLogout} className="btn-secondary py-1.5">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-1.5">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 bg-gray-700 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-700 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="input-field rounded-r-none"
              />
              <button type="submit" className="btn-primary rounded-l-none">
                Go
              </button>
            </form>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <Link to="/products" onClick={() => setMenuOpen(false)}>
                Products
              </Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>
                Cart ({totalItems})
              </Link>
              {user ? (
                <>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-left text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
