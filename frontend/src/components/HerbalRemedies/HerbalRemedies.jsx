import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, Leaf, Droplet, Shield, Zap } from 'lucide-react';
import { api } from '../../lib/api'; // Corrected the import path

const HerbalRemedies = () => {
  const [activeCategory, setActiveCategory] = useState('All Remedies');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]); // Will now hold remedies data
  const [categories, setCategories] = useState([
    { name: 'All Remedies', icon: Leaf }
  ]); // Will be populated from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch remedies and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch remedies
        const remediesData = await api.listRemedies();
        
        // Transform remedies data to match existing product structure
        const transformedRemedies = remediesData.map(remedy => ({
          id: remedy.id,
          name: remedy.name,
          category: remedy.category,
          description: remedy.description,
          image: remedy.imageUrl,
          // Additional remedy-specific fields can be added here if needed
        }));
        
        setProducts(transformedRemedies);
        
        // Fetch remedy categories
        const categoriesData = await api.listRemedyCategories();
        
        // Transform categories to match existing structure
        const transformedCategories = [
          { name: 'All Remedies', icon: Leaf },
          ...categoriesData.map(cat => ({
            name: cat.name,
            // icon could be added based on category data if needed
          }))
        ];
        
        setCategories(transformedCategories);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load remedies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    if (!product || !product.name) return false;
    const matchesCategory = activeCategory === 'All Remedies' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fdf8' }}>
      {/* Header */}
      <header className="px-6 py-4" style={{ backgroundColor: '#7fb069' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Leaf className="w-6 h-6" />
            <span className="text-xl font-semibold">GreenCart</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <ShoppingCart className="w-5 h-5 cursor-pointer hover:opacity-80" />
            <User className="w-5 h-5 cursor-pointer hover:opacity-80" />
            <span className="cursor-pointer hover:opacity-80">Account</span>
            <Menu className="w-5 h-5 cursor-pointer hover:opacity-80" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16" style={{ backgroundColor: '#7fb069' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl font-light mb-4" style={{ fontFamily: 'serif' }}>
            Herbal Remedies
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Discover Nature's Healing Power
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search remedies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="px-6 py-6" style={{ backgroundColor: '#f8fdf8' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:shadow-md border border-green-200 hover:border-green-300'
                  }`}
                  style={isActive ? { backgroundColor: '#7fb069' } : {}}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600">Loading remedies...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No remedies found. {searchQuery ? 'Try a different search term.' : 'Check back later for new remedies.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {product.description}
                      </p>
                    )}
                    <button
                      className="w-full py-2 px-4 rounded-full font-medium text-white transition-colors duration-200 hover:opacity-90 shadow-md hover:shadow-lg"
                      style={{ backgroundColor: '#7fb069' }}
                    >
                      View Remedy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HerbalRemedies;