import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { CATEGORY_TREE, findCategoryByKey } from './categoriesData';

// Page that shows subcategory cards for a selected top-level category
export default function SubcategoriesPage() {
  const { categoryKey } = useParams();
  const decoded = decodeURIComponent(categoryKey || '');
  const category = findCategoryByKey(decoded);

  if (!category) {
    return <Navigate to="/categories" replace />;
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 mt-[70px]">
      <div className="max-w-7xl mx-auto">
        <nav className="text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <Link to="/categories" className="hover:underline">Categories</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800">{category.name}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">{category.name}</h1>
          <p className="text-gray-600 mt-1">Select a subcategory to explore products.</p>
        </header>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.children.map((sub) => (
            <Link
              key={sub.key}
              to={`/products?category=${encodeURIComponent(category.key)}&subcategory=${encodeURIComponent(sub.key)}`}
              className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="h-12 w-12 rounded-md bg-green-50 text-green-700 flex items-center justify-center mb-4">
                  {/* simple icon-like badge */}
                  <span className="material-icons">local_florist</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{sub.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Explore {sub.name} under {category.name}</p>
                <div className="mt-4 inline-flex items-center text-green-700 gap-1 font-medium">
                  <span>View products</span>
                  <span className="material-icons text-base">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}