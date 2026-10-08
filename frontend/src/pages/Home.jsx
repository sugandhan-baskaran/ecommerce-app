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
    <div className="page-shell">
      <section className="bg-[#f4d35e] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
          <div className="reveal">
            <p className="uppercase tracking-[0.25em] text-xs font-bold mb-5">The considered edit / 2026</p>
            <h1 className="text-5xl sm:text-7xl leading-[.95] max-w-2xl font-bold">Good things for your everyday.</h1>
            <p className="text-lg max-w-lg mt-6 mb-8 text-ink/75">A brighter collection of useful, beautiful objects for the way you live now.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">Explore the collection <span aria-hidden="true">↗</span></Link>
              <span className="text-sm font-semibold">Free shipping over $75</span>
            </div>
          </div>
          <div className="relative min-h-[330px] sm:min-h-[430px] flex items-center justify-center reveal reveal-delay-1">
            <div className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-coral right-4 top-8"></div>
            <div className="absolute left-2 bottom-8 bg-mint rounded-2xl px-4 py-3 font-bold rotate-[-8deg] z-10">new season<br /><span className="font-normal text-sm">small joys, daily</span></div>
            {products[0] && <img src={products[0].images?.[0]} alt={products[0].name} className="hero-product relative z-10 w-64 sm:w-80 h-64 sm:h-80 object-cover rounded-[2rem] rotate-[4deg] shadow-2xl border-8 border-white" />}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8 reveal">
          <div><p className="text-coral uppercase tracking-[0.2em] text-xs font-bold mb-2">Shop by mood</p><h2 className="text-4xl font-bold">Find your next favorite.</h2></div>
          <Link to="/products" className="hidden sm:block font-bold border-b-2 border-coral pb-1">View all ↗</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-16 reveal reveal-delay-1">
          {["Electronics", "Clothing", "Home & Kitchen", "Furniture", "Sports", "Wellness"].map((category, index) => (
            <Link key={category} to={`/products?category=${encodeURIComponent(category)}`} className={`p-4 sm:p-5 rounded-2xl min-h-28 flex flex-col justify-between font-bold hover:-translate-y-1 ${["bg-mint", "bg-[#ffb4a2]", "bg-[#cdb4db]", "bg-[#a8dadc]", "bg-[#f4d35e]", "bg-[#ffd6a5]"][index]}`}>
              <span className="text-2xl">{["✦", "◒", "⌂", "◌", "↗", "✿"][index]}</span><span className="text-sm leading-tight">{category}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-end justify-between mb-8 reveal">
          <div><p className="text-coral uppercase tracking-[0.2em] text-xs font-bold mb-2">Just landed</p><h2 className="text-4xl font-bold">The latest arrivals.</h2></div>
          <Link to="/products" className="hidden sm:block font-bold border-b-2 border-coral pb-1">View all ↗</Link>
        </div>

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.slice(0, 8).map((p, index) => (
              <div key={p._id} className={`reveal reveal-delay-${Math.min(index % 4 + 1, 3)}`}><ProductCard product={p} /></div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
