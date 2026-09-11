import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";
import Spinner from "../components/Spinner.jsx";
import Pagination from "../components/Pagination.jsx";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1 });

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "-createdAt";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    api.get("/products/meta/categories").then(({ data }) => setCategories(data.data.categories));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      params.set("page", page);
      params.set("limit", 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data.products);
      setPageInfo({ page: data.page, pages: data.pages });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {search ? `Search results for "${search}"` : "All Products"}
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="input-field sm:w-56"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="input-field sm:w-56"
        >
          <option value="-createdAt">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-ratingsAverage">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">No products match your criteria.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <Pagination
            page={pageInfo.page}
            pages={pageInfo.pages}
            onPageChange={(p) => updateParam("page", p)}
          />
        </>
      )}
    </div>
  );
};

export default Products;
