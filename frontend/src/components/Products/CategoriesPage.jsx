import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from './categoriesData';

// Landing page for top-level categories (cards)
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="px-4 md:px-8 lg:px-10 mt-[70px]">
        <div className="max-w-7xl mx-auto">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 lg:px-10 mt-[70px]">
        <div className="max-w-7xl mx-auto">
          <div className="error-container">
            <p>Error loading categories: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 mt-[70px]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Shop by Category</h1>
          <p className="text-gray-600 mt-1">Browse curated categories and discover what you need faster.</p>
        </header>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              to={`/categories/${encodeURIComponent(cat.key)}`}
              className="group rounded-xl overflow-hidden border border-gray-200 bg-white shadow hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 md:h-48 w-full overflow-hidden">
                {/* background cover image */}
                <img
                  src={cat.cover}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-xl font-semibold drop-shadow">{cat.name}</h3>
                  <p className="text-white/90 text-sm drop-shadow">{cat.children.length} subcategories</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}