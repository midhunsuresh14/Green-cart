import React, { useState, useEffect } from 'react';
import {
  Search, Leaf, ChevronRight, Info, ArrowRight, CheckCircle2,
  Heart, Zap, Brain, Activity, Droplets, Sun, Moon, Star,
  ShieldCheck, AlertCircle, Sparkles, Filter, Wind
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const HerbalRemedies = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Remedies');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ name: 'All Remedies' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Increased for denser grid

  // Category Icon Mapping
  const getCategoryIcon = (categoryName) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('heart') || lower.includes('cardio')) return Heart;
    if (lower.includes('energy') || lower.includes('fatigue')) return Zap;
    if (lower.includes('mind') || lower.includes('brain') || lower.includes('stress')) return Brain;
    if (lower.includes('immune') || lower.includes('flu')) return ShieldCheck;
    if (lower.includes('sleep') || lower.includes('insomnia')) return Moon;
    if (lower.includes('skin') || lower.includes('beauty')) return Sparkles;
    if (lower.includes('digestion') || lower.includes('stomach')) return Activity;
    if (lower.includes('respiratory') || lower.includes('breath')) return Wind;
    return Leaf;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const remediesData = await api.listRemedies();

        const transformedRemedies = remediesData.map(remedy => ({
          id: remedy.id,
          name: remedy.name,
          category: remedy.category,
          description: remedy.description,
          image: remedy.imageUrl || '',
          rating: (4 + Math.random()).toFixed(1), // Mock rating
          reviews: Math.floor(Math.random() * 50) + 10 // Mock reviews
        }));

        setProducts(transformedRemedies);

        const categoriesData = await api.listRemedyCategories();
        const transformedCategories = [
          { name: 'All Remedies' },
          ...categoriesData.map(cat => ({ name: cat.name }))
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

  // Calculate filtered products first
  const filteredProducts = products.filter(product => {
    if (!product || !product.name) return false;
    const matchesCategory = activeCategory === 'All Remedies' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewRemedy = (remedyId) => {
    navigate(`/remedies/${remedyId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Top Navigation Bar (Mock for context) */}
      <div className="bg-[#064E3B] text-white py-3 px-6 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Leaf className="text-emerald-400" /> GreenCart <span className="text-emerald-200 font-light">MediHerbs</span>
          </div>

          <div className="flex-1 max-w-xl mx-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search remedies, specific ailments..."
              className="w-full bg-[#065F46] text-white placeholder-emerald-200/70 border border-emerald-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-[#064E3B] transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-emerald-300" />
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-emerald-100">
            <span className="hover:text-white cursor-pointer transition-colors">Consultations</span>
            <span className="hover:text-white cursor-pointer transition-colors">Guide</span>
            <div className="bg-emerald-500/20 p-2 rounded-full hover:bg-emerald-500/30 cursor-pointer">
              <Info className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumbs / Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Natural Herbal Remedies</h1>
          <p className="text-slate-500 max-w-3xl">
            Explore our curated collection of botanical treatments validated by traditional wisdom and modern science.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sticky Sidebar */}
          <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 space-y-8">

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Filter className="w-4 h-4" /> Categories
                </h3>
              </div>
              <nav className="p-2 space-y-1">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.name);
                  const isActive = activeCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                        ? 'bg-[#064E3B] text-white shadow-md shadow-emerald-900/10'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#064E3B]'
                        }`}
                    >
                      <div className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-white/10' : 'bg-slate-100 group-hover:bg-emerald-50'}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#064E3B]'}`} />
                      </div>
                      <span>{cat.name}</span>
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-70" />}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Trust Badge */}
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm text-[#064E3B]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#064E3B] text-sm">Medically Reviewed</h4>
                  <p className="text-xs text-emerald-800/70 mt-1 leading-relaxed">
                    All remedies are verified against our botanical safety database.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Main Grid */}
          <div className="flex-1 w-full">

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <span className="text-slate-600 font-medium">
                Showing <span className="text-slate-900 font-bold">{currentItems.length}</span> of {filteredProducts.length} remedies
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Sort by:</span>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#064E3B] text-slate-800 font-medium">
                  <option>Relevance</option>
                  <option>Name (A-Z)</option>
                  <option>Popularity</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-xl h-80 animate-pulse border border-slate-200"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-xl border border-red-100 shadow-sm">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{error}</h3>
                <button onClick={() => window.location.reload()} className="text-[#064E3B] font-bold hover:underline">Try Again</button>
              </div>
            ) : currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <AnimatePresence mode="popLayout">
                    {currentItems.map((product, idx) => (
                      <motion.div
                        layout
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 overflow-hidden flex flex-col h-full"
                        onClick={() => handleViewRemedy(product.id)}
                      >
                        {/* Image Area */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          <img
                            src={product.image || 'https://via.placeholder.com/400x400?text=Nature'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-[#064E3B] text-xs font-bold px-2.5 py-1 rounded-md border border-slate-100 shadow-sm uppercase tracking-wider">
                              {product.category || 'General'}
                            </span>
                          </div>
                          {/* Quick action - Appear on hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <button className="bg-white text-[#064E3B] font-bold px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#064E3B] transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                              <Star className="w-3 h-3 fill-current" /> {product.rating || '4.8'}
                            </div>
                          </div>

                          <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
                            {product.description}
                          </p>

                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                            <span className="text-slate-400 font-medium">{product.reviews} reviews</span>
                            <span className="font-bold text-[#064E3B] flex items-center gap-1 group-hover:underline">
                              Learn More <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:border-[#064E3B] hover:text-[#064E3B] disabled:opacity-30 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === page
                          ? 'bg-[#064E3B] text-white shadow-md shadow-emerald-900/20'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:border-[#064E3B] hover:text-[#064E3B] disabled:opacity-30 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No remedies found</h3>
                <p className="text-slate-500">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerbalRemedies;