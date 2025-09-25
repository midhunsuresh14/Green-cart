import { useState } from 'react';
import { motion } from 'framer-motion';

const mockRecommendations = [
  { crop: 'Tomato', season: 'Spring', notes: 'Needs 6-8 hours of sunlight' },
  { crop: 'Spinach', season: 'Winter', notes: 'Thrives in cool climates' },
  { crop: 'Basil', season: 'Summer', notes: 'Warm weather and well-drained soil' },
  { crop: 'Okra', season: 'Summer', notes: 'Full sun; drought tolerant' },
];

export default function CropPlanner() {
  const [location, setLocation] = useState('');
  const [results, setResults] = useState(mockRecommendations);

  function handleSearch(e) {
    e.preventDefault();
    // Placeholder for weather API integration
    setResults(mockRecommendations);
  }

  return (
    <section id="planner" className="bg-white" aria-label="Weather-based Crop Planner">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-800">Weather-based Crop Planner</h2>
          <p className="text-sm text-green-800/70">Search by your location</p>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your city or ZIP"
            className="flex-1 rounded-md border border-green-200 bg-white px-4 py-2 text-green-900 placeholder:text-green-800/50 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-2 text-white font-semibold shadow hover:bg-green-700"
          >
            Get Recommendations
          </button>
        </form>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((item, idx) => (
            <motion.div
              key={item.crop}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-xl border border-green-200 bg-green-50 p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-green-900">{item.crop}</h3>
              <p className="text-sm text-green-800/80 mt-1">Season: {item.season}</p>
              <p className="text-sm text-green-800/80 mt-2">{item.notes}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}























