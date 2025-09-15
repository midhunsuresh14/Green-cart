export default function Footer() {
  return (
    <footer className="bg-green-900 text-green-50" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-green-600 text-white font-bold">G</span>
              <span className="text-xl font-semibold">GreenCart</span>
            </div>
            <p className="mt-3 text-sm text-green-100/80">Eco-friendly plants and smart gardening tools.</p>
          </div>

          <div>
            <p className="font-semibold">Quick Links</p>
            <ul className="mt-3 space-y-2 text-sm text-green-100/80">
              <li><a href="#" className="hover:text-white">Home</a></li>
              <li><a href="#shop" className="hover:text-white">Shop</a></li>
              <li><a href="#identifier" className="hover:text-white">Medicinal Identifier</a></li>
              <li><a href="#planner" className="hover:text-white">Crop Planner</a></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-green-100/80">
              <li>Email: hello@greencart.ai</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Green Ave, Earth</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">Follow</p>
            <div className="mt-3 flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M8.29 20c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.36-.01-.54A8.35 8.35 0 0 0 22 5.92a8.19 8.19 0 0 1-2.36.65 4.12 4.12 0 0 0 1.8-2.27 8.23 8.23 0 0 1-2.61 1 4.11 4.11 0 0 0-7 3.74A11.66 11.66 0 0 1 3.15 4.6a4.11 4.11 0 0 0 1.27 5.49 4.08 4.08 0 0 1-1.86-.51v.05c0 2 1.42 3.69 3.3 4.07-.35.1-.73.15-1.11.15-.27 0-.54-.03-.79-.07.54 1.69 2.11 2.92 3.97 2.95A8.24 8.24 0 0 1 2 18.57 11.64 11.64 0 0 0 8.29 20"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10Zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.51 5.51 0 0 0 12 7.5Zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm5.25-3.75a.75.75 0 1 0 .75.75.75.75 0 0 0-.75-.75Z"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M13 9h3V6h-3c-1.66 0-3 1.34-3 3v2H8v3h2v7h3v-7h2.2l.8-3H13V9Z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-green-800 pt-6 text-xs text-green-100/70">
          © {new Date().getFullYear()} GreenCart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}



