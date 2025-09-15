import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section
      className="relative"
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
      >
        <img
          src="https://images.unsplash.com/photo-1463554050456-f2ed7d3fec09?q=80&w=2000&auto=format&fit=crop"
          alt="Lush green plants background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-green-900/30" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-36 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold drop-shadow"
        >
          AI-Enhanced Plant E‑Commerce
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 max-w-2xl text-lg sm:text-xl text-green-50"
        >
          Discover, identify, and plan your garden with eco‑friendly guidance.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <a
            href="#shop"
            className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-semibold text-green-800 shadow hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Explore Plants
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L17.69 11H4a.75.75 0 0 1 0-1.5h13.69l-4.72-4.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}



