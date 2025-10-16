import React from 'react';

export default function HeaderPDP({ onOpenCart }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 grid place-items-center rounded bg-green-600 text-white font-extrabold">G</div>
          <span className="text-xl font-bold text-green-700">GreenCart</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search plants, pots, fertilizers..."
            />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700">
          <a href="#" className="hover:text-green-700 transition-colors">Home</a>
          <a href="#" className="hover:text-green-700 transition-colors">Products</a>
          <a href="#" className="hover:text-green-700 transition-colors">Remedies</a>
        </nav>

        <div className="flex items-center gap-2 ml-4">
          <button aria-label="Open cart" onClick={onOpenCart} className="p-2 rounded hover:bg-gray-100">
            <span className="material-icons">shopping_cart</span>
          </button>
          <button className="p-2 rounded hover:bg-gray-100" aria-label="Profile">
            <span className="material-icons">person</span>
          </button>
        </div>
      </div>
    </header>
  );
}








