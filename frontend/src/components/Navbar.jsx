import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'Shop', href: '#shop' },
  { label: 'Medicinal Plants', href: '#identifier' },
  { label: 'Crop Planner', href: '#planner' },
  { label: 'Remedies', href: '#remedies' },
  { label: 'Login', href: '#login' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-green-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-green-600 text-white font-bold">G</span>
            <span className="text-xl font-semibold text-green-700">GreenCart</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-green-800/80 hover:text-green-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            aria-label="Toggle Menu"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => setOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className="md:hidden overflow-hidden border-t border-green-100 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-green-800 hover:bg-green-50"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}



