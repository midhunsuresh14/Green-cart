import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, Leaf, Droplet, Shield, Zap } from 'lucide-react';

const HerbalRemedies = () => {
  const [activeCategory, setActiveCategory] = useState('All Remedies');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'All Remedies', icon: Leaf },
    { name: 'Stress Relief', icon: null },
    { name: 'Skin Health', icon: Droplet },
    { name: 'Immunity', icon: Shield },
    { name: 'Energy', icon: Zap }
  ];

  const herbalProducts = [
    {
      id: 1,
      name: 'Ginger Tea',
      description: 'Supports Digestion & Warmth',
      category: 'All Remedies',
      image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b34816?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      name: 'Turmeric Capsules',
      description: 'Potent Anti-Inflammatory',
      category: 'Immunity',
      image: 'https://images.unsplash.com/photo-1609501676725-7186f734b2b0?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      name: 'Chamomile Sleep Tincture',
      description: 'Calms Nerves & Promotes Rest',
      category: 'Stress Relief',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 4,
      name: 'Eucalyptus Steam Blend',
      description: 'Clear Airways & Invigorate',
      category: 'Energy',
      image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 5,
      name: 'Aloe Vera Gel',
      description: 'Soothes Skin & Hydrates',
      category: 'Skin Health',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 6,
      name: 'Lavender',
      description: 'Relaxation & Calm',
      category: 'Stress Relief',
      image: 'https://images.unsplash.com/photo-1611909023032-2d6b3134ecba?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 7,
      name: 'Aloe Vera Gel',
      description: 'Soothes Skin & Hydrates',
      category: 'Skin Health',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 8,
      name: 'Ashwagandha Powder',
      description: '& Stress Relief',
      category: 'Stress Relief',
      image: 'https://images.unsplash.com/photo-1609501676725-7186f734b2b0?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const filteredProducts = herbalProducts.filter(product => {
    const matchesCategory = activeCategory === 'All Remedies' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f3f0' }}>
      {/* Header */}
      <header className="px-6 py-4" style={{ backgroundColor: '#8b9a7a' }}>
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
      <section className="px-6 py-16" style={{ backgroundColor: '#8b9a7a' }}>
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
      <section className="px-6 py-6" style={{ backgroundColor: '#f5f3f0' }}>
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
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                  }`}
                  style={isActive ? { backgroundColor: '#8b9a7a' } : {}}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {product.description}
                  </p>
                  <button
                    className="w-full py-2 px-4 rounded-full font-medium text-white transition-colors duration-200 hover:opacity-90"
                    style={{ backgroundColor: '#8b9a7a' }}
                  >
                    View Remedy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HerbalRemedies;
