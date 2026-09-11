import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";
import Spinner from "../components/Spinner.jsx";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/products?limit=8&sort=-createdAt");
        setProducts(data.data.products);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-primary-700 to-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need, delivered fast.
          </h1>
          <p className="text-primary-50 max-w-xl mx-auto mb-8">
            Discover quality products across electronics, home, fashion and more — all in one place.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-700 font-semibold px-6 py-3 rounded-md hover:bg-primary-50"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Products</h2>
          <Link to="/products" className="text-primary-600 hover:underline text-sm font-medium">
            View all
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
