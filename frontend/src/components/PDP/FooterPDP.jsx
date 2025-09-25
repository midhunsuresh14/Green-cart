import React from 'react';

export default function FooterPDP() {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 grid place-items-center rounded bg-green-600 text-white font-extrabold">G</div>
            <span className="font-bold text-green-700">GreenCart</span>
          </div>
          <p className="text-gray-600">Grow smart. Live green.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">About Us</div>
          <ul className="space-y-1 text-gray-600">
            <li>Our Story</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Customer Care</div>
          <ul className="space-y-1 text-gray-600">
            <li>Shipping Policy</li>
            <li>Returns</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Newsletter</div>
          <div className="flex gap-2">
            <input className="flex-1 border rounded px-2 py-1" placeholder="Your email" />
            <button className="px-3 py-1 bg-gray-900 text-white rounded">Subscribe</button>
          </div>
          <div className="mt-3 flex gap-3 text-gray-600">
            <span className="material-icons">facebook</span>
            <span className="material-icons">share</span>
            <span className="material-icons">ios_share</span>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 py-3 border-t">© {new Date().getFullYear()} GreenCart</div>
    </footer>
  );
}
