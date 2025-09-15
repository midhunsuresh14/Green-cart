import { motion } from 'framer-motion';

const categories = [
  {
    title: 'Indoor Plants',
    image:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop',
  },
  {
    title: 'Outdoor Plants',
    image:
      'https://images.unsplash.com/photo-1467043153537-f6f40d4d97d9?q=80&w=1600&auto=format&fit=crop',
  },
  {
    title: 'Medicinal Plants',
    image:
      'https://images.unsplash.com/photo-1553530979-7ee52f05cbb3?q=80&w=1600&auto=format&fit=crop',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="bg-white" aria-label="Featured categories">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-800">Featured Categories</h2>
          <a href="#shop" className="text-sm font-semibold text-green-700 hover:text-green-900">View all</a>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.a
              key={cat.title}
              href="#shop"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="group relative overflow-hidden rounded-xl border border-green-100 bg-green-50 hover:bg-green-100/60"
            >
              <img src={cat.image} alt={cat.title} className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="inline-flex items-center rounded-md bg-white/90 px-3 py-1 text-sm font-semibold text-green-800 shadow">
                  {cat.title}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}



