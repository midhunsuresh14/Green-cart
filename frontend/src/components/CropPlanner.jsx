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
  ChevronRight
} from 'lucide-react';
import { recommendCrops } from '../lib/api';

export default function CropPlanner() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    // Attempt auto-detect on mount
    handleAutoDetect();
  }, []);

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

  return (
    <section id="planner" className="min-h-screen bg-[#F7FAF8] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-green-100 text-[#2F6C4E] px-4 py-2 rounded-full text-sm font-bold mb-6"
          >
            <Cloud className="w-4 h-4" />
            <span>AI-POWERED INSIGHTS</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold text-[#2F6C4E] mb-6 tracking-tight"
          >
            Smarter Planting for <br className="hidden sm:block" /> Every Climate
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed"
          >
            We match your real-time local weather with botanical growth rules and AI explanations
            to help you choose the plants that will truly thrive in your space.
          </motion.p>
        </div>

        {/* Search Control */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="relative group">
            <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4CAF50] transition-colors w-6 h-6" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your city or zip code..."
                  className="w-full pl-14 pr-4 py-5 rounded-[2rem] border-none bg-white shadow-2xl shadow-green-900/10 focus:ring-2 focus:ring-[#4CAF50] transition-all text-slate-700 text-lg outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2F6C4E] text-white px-10 py-5 rounded-[2rem] font-bold hover:bg-[#224D38] transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 active:scale-95 disabled:opacity-50 min-w-[160px]"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Check Weather
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  disabled={detecting || loading}
                  className="bg-white text-[#2F6C4E] p-5 rounded-[2rem] hover:bg-green-50 transition-all shadow-xl shadow-green-900/5 active:scale-95 disabled:opacity-50"
                  title="Use My Current Location"
                >
                  <Navigation className={`w-6 h-6 ${detecting ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </form>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center text-red-500 font-semibold bg-red-50 py-3 px-6 rounded-2xl flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" /> {error}
            </motion.p>
          )}
        </div>

        {/* Weather Results Area */}
        <AnimatePresence mode="wait">
          {weather && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="mb-16"
            >
              {/* Weather Summary Card */}
              <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#2F6C4E] to-[#224D38] p-10 text-white shadow-2xl mb-12">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Cloud size={280} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                  <div className="lg:col-span-5 flex items-center gap-8 border-b lg:border-b-0 lg:border-r border-white/10 pb-10 lg:pb-0">
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-inner">
                      <img
                        src={`http://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                        alt={weather.description}
                        className="w-24 h-24 drop-shadow-2xl"
                      />
                    </div>
                    <div>
                      <p className="text-green-300 font-bold uppercase tracking-widest text-sm mb-2">Live Weather in {weather.city}</p>
                      <h3 className="text-7xl font-black mb-1">{weather.temp}°<span className="text-3xl font-light opacity-60">C</span></h3>
                      <p className="text-2xl text-green-100 capitalize font-medium">{weather.description}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/5">
                      <Droplets className="text-blue-300 w-8 h-8 mb-4" />
                      <p className="text-green-300 text-sm font-bold uppercase mb-1">Humidity</p>
                      <p className="text-3xl font-bold">{weather.humidity}%</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/5">
                      <ThermometerSun className="text-orange-300 w-8 h-8 mb-4" />
                      <p className="text-green-300 text-sm font-bold uppercase mb-1">Season</p>
                      <p className="text-3xl font-bold">{weather.season}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/5 col-span-2 md:col-span-1">
                      <Wind className="text-slate-300 w-8 h-8 mb-4" />
                      <p className="text-green-300 text-sm font-bold uppercase mb-1">Forecast</p>
                      <p className="text-2xl font-bold">Stable</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Headline */}
              <div className="flex items-center justify-between mb-10 px-4">
                <h3 className="text-3xl font-bold text-slate-800">Crops for your Conditions</h3>
                <button className="text-[#2F6C4E] font-bold flex items-center gap-1 hover:underline">
                  View full suitability chart <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Recommended Crops */}
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {recommendations.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -12 }}
                      className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-green-900/5 group flex flex-col h-full border border-green-50/50"
                    >
                      <div className="p-10 flex-1">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block ${item.suitability === 'Highly Suitable'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                              }`}>
                              {item.suitability}
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-800 leading-tight">{item.name}</h3>
                            <p className="text-[#2F6C4E] font-bold text-xs mt-2 uppercase tracking-widest">{item.type} • {item.sunlight || 'Full Sun'}</p>
                          </div>
                          <div className="w-16 h-16 bg-green-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-[#2F6C4E] group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-slate-50 p-6 rounded-[2rem] relative">
                            <Wind className="w-6 h-6 text-blue-400 absolute -top-3 -left-3 bg-white rounded-full p-1 border border-slate-100" />
                            <p className="text-slate-600 italic leading-relaxed text-base">
                              "{item.explanation}"
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex-1 bg-green-50/50 p-4 rounded-2xl flex items-center gap-3">
                              <ThermometerSun className="text-orange-400 w-5 h-5" />
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Optimal Temp</p>
                                <p className="text-sm font-bold text-slate-700">{item.suitable_temp?.min}-{item.suitable_temp?.max}°C</p>
                              </div>
                            </div>
                            <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl flex items-center gap-3">
                              <Droplets className="text-blue-400 w-5 h-5" />
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Humidity</p>
                                <p className="text-sm font-bold text-slate-700">{item.suitable_humidity?.min}-{item.suitable_humidity?.max}%</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                              <Info className="w-4 h-4 text-[#2F6C4E]" /> Care Routine
                            </h4>
                            <div className="flex flex-col gap-3">
                              {item.care_tips?.map((tip, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                  <span className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                  <p className="text-sm text-slate-500 leading-relaxed">{tip}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 bg-white text-slate-700 py-4 rounded-2xl font-bold text-sm hover:shadow-lg transition-all border border-slate-200">
                          <Save className="w-5 h-5" /> Save Crop
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-[#2F6C4E] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#224D38] transition-all shadow-lg shadow-green-900/10">
                          <ShoppingBag className="w-5 h-5" /> Buy Seeds
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl border border-green-50">
                  <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ThermometerSun className="text-orange-400 w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">No specific crops matched</h3>
                  <p className="text-slate-500 max-w-lg mx-auto">
                    The current weather conditions ({weather.temp}°C, {weather.humidity}%) are currently outside the optimal planting range for our database.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial/Empty State - Only show when no weather data has been fetched yet */}
        {!loading && !weather && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white rounded-[4rem] shadow-2xl shadow-green-900/5 border border-green-50 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-green-200 to-transparent" />
            <div className="bg-green-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Cloud className="text-[#2F6C4E] w-14 h-14" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Where are you planting today?</h3>
            <p className="text-lg text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
              Enter your location above or use the detect button to see what will grow best in your garden right now.
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                <CheckCircle2 className="w-5 h-5 text-green-400" /> Real-time Weather
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                <Wind className="w-5 h-5 text-blue-400" /> AI Explanations
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                <ShoppingBag className="w-5 h-5 text-orange-400" /> Seed Recommendations
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Decorative background elements */}
      <div className="fixed bottom-0 right-0 p-12 opacity-5 pointer-events-none -z-10">
        <Cloud size={400} />
      </div>
      <div className="fixed top-0 left-0 p-12 opacity-5 pointer-events-none -z-10">
        <Droplets size={300} />
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
