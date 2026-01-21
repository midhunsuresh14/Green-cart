import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Droplets,
  ThermometerSun,
  MapPin,
  Search,
  ShoppingBag,
  Info,
  Save,
  CheckCircle2,
  Wind,
  Navigation,
  ExternalLink,
  ChevronRight,
  Calendar,
  Apple,
  Scale,
  Leaf,
  Flower2
} from 'lucide-react';
import { recommendCrops } from '../lib/api';

export default function CropPlanner() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories configuration
  const categories = [
    { id: 'All', icon: CheckCircle2, label: 'All Plants' },
    { id: 'Vegetable', icon: Scale, label: 'Vegetables' },
    { id: 'Fruit', icon: Apple, label: 'Fruits' },
    { id: 'Herb', icon: Leaf, label: 'Herbs' },
    { id: 'Flower', icon: Flower2, label: 'Flowers' }
  ];

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchRecs({ lat: latitude, lon: longitude });
        setDetecting(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setDetecting(false);
        // Fallback or leave empty
      }
    );
  };

  const fetchRecs = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await recommendCrops(params);
      if (data.success) {
        setWeather(data.weather);
        setRecommendations(data.recommendations);
        // Reset category on new search
        setSelectedCategory('All');
      } else {
        setError(data.error || "Failed to fetch recommendations");
      }
    } catch (err) {
      setError("Unable to connect to weather services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    if (/^\d{5,6}$/.test(location.trim())) {
      fetchRecs({ pincode: location.trim() });
    } else {
      fetchRecs({ city: location.trim() });
    }
  };

  // Filter logic
  const filteredRecommendations = selectedCategory === 'All'
    ? recommendations
    : recommendations.filter(item => item.type === selectedCategory || item.suitability === selectedCategory); // Flexible match

  return (
    <section id="planner" className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
      {/* Search Header - Fixed or Sticky if needed, here just top section */}
      <div className="bg-[#2F6C4E] pt-28 pb-32 px-4 rounded-b-[4rem] shadow-xl relative z-20">
        <div className="max-w-7xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-green-50 mb-6 border border-white/20">
              <Cloud className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">AI Growth Engine</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              What grows best <br /> <span className="text-green-300">right here, right now?</span>
            </h1>

            {/* Search Bar */}
            <div className="w-full max-w-2xl relative translate-y-8 z-30">
              <form onSubmit={handleManualSearch} className="relative group">
                <div className="absolute inset-0 bg-green-900/20 blur-xl rounded-[2rem] transform translate-y-4"></div>
                <div className="bg-white p-2 rounded-[2rem] shadow-2xl flex items-center gap-2 relative">
                  <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center shrink-0 ml-1">
                    <MapPin className="text-[#2F6C4E]" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city or pincode..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 text-lg placeholder:text-slate-400 font-medium px-2"
                  />

                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={detecting || loading}
                    className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-[#2F6C4E] tooltip"
                    title="Use current location"
                  >
                    <Navigation className={`w-5 h-5 ${detecting ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#2F6C4E] text-white px-8 py-3 rounded-[1.5rem] font-bold hover:bg-[#25553D] transition-all shadow-lg shadow-green-900/20 active:scale-95 flex items-center gap-2"
                  >
                    {loading ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Search className="w-5 h-5" />}
                    <span>Search</span>
                  </button>
                </div>
              </form>
              {error && (
                <div className="absolute -bottom-16 left-0 right-0 text-center">
                  <span className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-sm border border-red-100">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
        {weather ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Sidebar / Filters */}
            <div className="lg:col-span-3 space-y-8">
              {/* Weather Status Card - Mini */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Cloud size={100} />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-2xl">
                    <img
                      src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt={weather.description}
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{weather.city}</p>
                    <p className="text-2xl font-black text-slate-800">{weather.temp}°</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Humidity</p>
                    <p className="font-bold text-slate-700">{weather.humidity}%</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Season</p>
                    <p className="font-bold text-slate-700">{weather.season}</p>
                  </div>
                </div>
              </motion.div>

              {/* Categories Navigation */}
              <div className="sticky top-24">
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Categories</h3>
                <nav className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-medium text-sm group ${selectedCategory === cat.id
                        ? 'bg-[#2F6C4E] text-white shadow-lg shadow-green-900/20'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                        }`}
                    >
                      <cat.icon className={`w-5 h-5 ${selectedCategory === cat.id ? 'text-green-200' : 'text-slate-400 group-hover:text-[#2F6C4E]'}`} />
                      <span className="flex-1 text-left">{cat.label}</span>
                      {selectedCategory === cat.id && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </button>
                  ))}
                </nav>

                <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-[2rem] p-6 border border-green-100">
                  <h4 className="font-bold text-[#2F6C4E] mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Pro Tip
                  </h4>
                  <p className="text-sm text-green-800/70 leading-relaxed">
                    Soil health is just as important as weather. Consider testing your soil pH before planting sensitive crops.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800">
                  Recommended <span className="text-[#2F6C4E]">{selectedCategory === 'All' ? 'Crops' : categories.find(c => c.id === selectedCategory)?.label}</span>
                </h2>
                <span className="text-sm font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                  {filteredRecommendations.length} results
                </span>
              </div>

              {filteredRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredRecommendations.map((item, idx) => (
                      <motion.div
                        layout
                        key={item.id || idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="bg-white rounded-[2.5rem] p-1 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-green-900/5 transition-all border border-slate-100 group flex flex-col"
                      >
                        <div className="p-7 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                              <div className="flex gap-2 mb-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.suitability === 'Highly Suitable' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                  }`}>
                                  {item.suitability}
                                </span>
                                {item.is_ai_generated && (
                                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Cloud className="w-3 h-3" /> AI
                                  </span>
                                )}
                              </div>
                              <h3 className="text-2xl font-extrabold text-slate-800 leading-tight mb-1">{item.name}</h3>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.type}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#2F6C4E] group-hover:bg-[#2F6C4E] group-hover:text-white transition-colors">
                              <Leaf className="w-6 h-6" />
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-2xl p-5 mb-6 relative flex-1">
                            <div className="absolute -left-1 top-6 w-1 h-8 bg-green-300 rounded-r-full"></div>
                            <p className="text-slate-600 text-sm leading-relaxed italic">"{item.explanation}"</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-orange-50/50 rounded-2xl p-3 flex items-center gap-3">
                              <ThermometerSun className="w-8 h-8 text-orange-400 p-1.5 bg-white rounded-full shadow-sm" />
                              <div>
                                <p className="text-[10px] font-bold text-orange-300 uppercase">Temp</p>
                                <p className="text-sm font-bold text-slate-700">{item.suitable_temp?.min}-{item.suitable_temp?.max}°</p>
                              </div>
                            </div>
                            <div className="bg-blue-50/50 rounded-2xl p-3 flex items-center gap-3">
                              <Calendar className="w-8 h-8 text-blue-400 p-1.5 bg-white rounded-full shadow-sm" />
                              <div>
                                <p className="text-[10px] font-bold text-blue-300 uppercase">Days</p>
                                <p className="text-sm font-bold text-slate-700">{item.growth_period || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto pt-2">
                            {item.isAvailable && item.productId ? (
                              <a href={`/pdp/${item.productId}`} className="block w-full text-center bg-[#2F6C4E] hover:bg-[#25553D] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-900/10 active:scale-95 flex items-center justify-center gap-2 text-sm">
                                <ShoppingBag className="w-4 h-4" /> Shop Seeds
                              </a>
                            ) : (
                              <button disabled className="block w-full text-center bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl cursor-not-allowed text-sm">
                                Unavailable
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No {selectedCategory} found</h3>
                  <p className="text-slate-500">Try selecting a different category or view all plants.</p>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State / Initial View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mt-12"
          >
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-green-900/5 border border-green-50/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2F6C4E] to-transparent opacity-20"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-green-50/50 p-6 rounded-[2rem]">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-[#2F6C4E]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Local Analysis</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">We check 15+ data points specific to your exact location coordinates.</p>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-[2rem]">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-blue-500">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Real-time Data</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Live weather data ensures recommendations are accurate for today.</p>
                </div>
                <div className="bg-orange-50/50 p-6 rounded-[2rem]">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-orange-500">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">Growth Science</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Matching crops to conditions using botanical requirements database.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function AlertTriangle(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
