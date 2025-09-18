import React, { useState } from 'react';

const ProductDetail = ({ product, onAddToCart, onBack, onToggleWishlist, isInWishlist }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [activeTab, setActiveTab] = useState('description');

  const resolveImageUrl = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
    const host = apiBase.replace(/\/api\/?$/, '');
    return src.startsWith('/') ? host + src : host + '/' + src;
  };

  const fallbackImages = [
    resolveImageUrl(product && (product.imageUrl || product.image)) || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80'
  ];

  const productData = {
    ...(product || {}),
    id: product?.id ?? 1,
    name: product?.name ?? 'Aloe Vera Plant',
    description:
      product?.description ?? 'Medicinal succulent perfect for skin care and air purification. This versatile plant is known for its healing properties and easy maintenance.',
    longDescription:
      product?.longDescription ?? "The Aloe Vera plant is a succulent species that has been used for medicinal purposes for thousands of years. It's known for its thick, fleshy leaves that contain a gel-like substance rich in vitamins, minerals, and antioxidants. This plant is perfect for beginners as it requires minimal care and can thrive in various conditions.",
    price: product?.price ?? 24.99,
    originalPrice: product?.originalPrice ?? 34.99,
    discount: product?.discount ?? 29,
    images: Array.isArray(product?.images) && product?.images.length > 0 ? product.images.map(resolveImageUrl) : fallbackImages,
    category: product?.category ?? 'Succulents',
    rating: product?.rating ?? 4.5,
    reviews: product?.reviews ?? 128,
    inStock: product?.inStock ?? true,
    sizes: Array.isArray(product?.sizes) && product.sizes.length > 0 ? product.sizes : [
      { name: 'small', label: 'Small (4-6 inches)', price: 19.99 },
      { name: 'medium', label: 'Medium (6-8 inches)', price: 24.99 },
      { name: 'large', label: 'Large (8-10 inches)', price: 29.99 },
    ],
    careInstructions: product?.careInstructions ?? {
      light: 'Bright, indirect light',
      water: 'Water every 2-3 weeks',
      soil: 'Well-draining cactus mix',
      temperature: '65-80°F (18-27°C)',
    },
    benefits: Array.isArray(product?.benefits) && product.benefits.length > 0 ? product.benefits : [
      'Natural air purifier',
      'Skin healing properties',
      'Low maintenance',
      'Pet-friendly',
      'Medicinal uses',
    ],
    specifications: product?.specifications ?? {
      height: '6-8 inches',
      potSize: '6 inches',
      origin: 'Arabian Peninsula',
      lifespan: 'Perennial',
      toxicity: 'Non-toxic to pets',
    },
  };

  const handleAddToCart = () => {
    const selectedSizeData = productData.sizes.find((size) => size.name === selectedSize);
    const cartItem = {
      ...productData,
      quantity,
      selectedSize: selectedSizeData,
      finalPrice: selectedSizeData.price,
    };
    onAddToCart(cartItem);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const getCurrentPrice = () => {
    const selectedSizeData = productData.sizes.find((size) => size.name === selectedSize);
    return selectedSizeData ? selectedSizeData.price : productData.price;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-100 to-sky-200 bg-fixed pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back Button */}
        <button
          className="mb-8 flex items-center gap-2 rounded-xl border border-[rgba(72,187,120,0.2)] bg-white/90 px-6 py-3 text-slate-700 shadow-[0_4px_15px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-green-500 hover:text-white hover:shadow-[0_8px_25px_rgba(72,187,120,0.3)]"
          onClick={onBack}
        >
          <span className="material-icons text-[1.2rem]">arrow_back</span>
          Back to Products
        </button>

        <div className="mb-16 grid grid-cols-1 gap-10 rounded-3xl border border-white/20 bg-white/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] backdrop-blur-2xl md:grid-cols-2 md:gap-16 md:p-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              <img
                src={productData.images[selectedImage]}
                alt={productData.name}
                className="h-[420px] w-full object-cover transition-transform duration-300 md:h-[500px] hover:scale-[1.02]"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80'; }}
              />
              {productData.discount && (
                <div className="absolute left-4 top-4 rounded-full bg-gradient-to-br from-rose-500 to-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_15px_rgba(245,101,101,0.3)]">
                  -{productData.discount}%
                </div>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto py-2">
              {productData.images.map((image, index) => {
                const isActive = selectedImage === index;
                return (
                  <button
                    key={index}
                    className={
                      'h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all duration-200 hover:scale-105 ' +
                      (isActive
                        ? 'border-green-500 shadow-[0_4px_20px_rgba(72,187,120,0.3)]'
                        : 'border-transparent')
                    }
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${productData.name} ${index + 1}`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=200&q=80'; }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="w-fit rounded-full bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_4px_15px_rgba(72,187,120,0.3)]">
                {productData.category}
              </span>
              <h1 className="m-0 font-inter text-3xl font-extrabold leading-tight tracking-[-0.025em] text-gray-900 md:text-4xl">
                {productData.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.floor(productData.rating)
                          ? 'text-yellow-400 text-xl'
                          : 'text-slate-200 text-xl'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {productData.rating} ({productData.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="text-lg leading-8 text-slate-600">
              <p>{productData.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="mb-4 font-inter text-lg font-semibold text-slate-800">Size</h3>
              <div className="flex flex-col gap-3">
                {productData.sizes.map((size) => {
                  const selected = selectedSize === size.name;
                  return (
                    <button
                      key={size.name}
                      className={
                        'flex items-center justify-between rounded-xl border-2 bg-white px-6 py-4 font-inter transition-all ' +
                        (selected
                          ? 'border-green-500 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-[0_4px_15px_rgba(72,187,120,0.2)]'
                          : 'border-slate-200 hover:border-green-500 hover:bg-green-500/5')
                      }
                      onClick={() => setSelectedSize(size.name)}
                    >
                      <span className="font-medium text-slate-800">{size.label}</span>
                      <span className="text-lg font-semibold text-green-500">
                        ₹{size.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price */}
            <div className="my-2 flex items-center gap-4">
              <span className="font-inter text-4xl font-extrabold tracking-tight text-gray-900">
                ₹{getCurrentPrice()}
              </span>
              {productData.originalPrice && (
                <span className="text-2xl font-medium text-gray-400 line-through">
                  ₹{productData.originalPrice}
                </span>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="rounded-xl border border-[rgba(72,187,120,0.2)] bg-gradient-to-br from-green-500/5 to-teal-500/5 p-6 md:p-8">
              <div className="mb-4 flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-800">Quantity</label>
                <div className="flex w-fit items-center gap-4 rounded-lg border-2 border-slate-200 bg-white p-2">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 transition-colors hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <span className="material-icons">remove</span>
                  </button>
                  <span className="min-w-[2rem] text-center text-xl font-semibold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 transition-colors hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                  >
                    <span className="material-icons">add</span>
                  </button>
                </div>
              </div>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-br from-green-500 to-green-600 px-6 py-4 text-base font-semibold text-white shadow-[0_8px_25px_rgba(72,187,120,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(72,187,120,0.4)] disabled:translate-y-0 disabled:opacity-60"
                onClick={handleAddToCart}
                disabled={!productData.inStock}
              >
                <span className="material-icons text-[1.2rem]">shopping_cart</span>
                Add to Cart - ₹{(getCurrentPrice() * quantity).toFixed(2)}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-4 text-slate-700 transition-colors hover:border-green-500 hover:bg-green-500/5 hover:text-green-500"
                onClick={() => onToggleWishlist && onToggleWishlist(productData)}
              >
                <span className="material-icons">{isInWishlist ? 'favorite' : 'favorite_border'}</span>
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-4 text-slate-700 transition-colors hover:border-green-500 hover:bg-green-500/5 hover:text-green-500">
                <span className="material-icons">share</span>
                Share
              </button>
            </div>

            {/* Stock Status */}
            <div>
              {productData.inStock ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <span className="material-icons">check_circle</span>
                  In Stock - Ready to Ship
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                  <span className="material-icons">cancel</span>
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="rounded-2xl border border-white/30 bg-white/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-8">
          <div className="mb-6 flex flex-wrap gap-3">
            {[
              { key: 'description', label: 'Description' },
              { key: 'care', label: 'Care Instructions' },
              { key: 'benefits', label: 'Benefits' },
              { key: 'specs', label: 'Specifications' },
            ].map((tab) => (
              <button
                key={tab.key}
                className={
                  'rounded-full px-4 py-2 text-sm font-medium transition-all ' +
                  (activeTab === tab.key
                    ? 'bg-green-500 text-white shadow-[0_4px_15px_rgba(72,187,120,0.3)]'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-green-500 hover:bg-green-500/5 hover:text-green-500')
                }
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'description' && (
              <div>
                <h3 className="mb-3 text-xl font-semibold text-slate-800">About This Plant</h3>
                <p className="leading-7 text-slate-600">{productData.longDescription}</p>
              </div>
            )}

            {activeTab === 'care' && (
              <div>
                <h3 className="mb-3 text-xl font-semibold text-slate-800">Care Instructions</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="material-icons text-green-500">wb_sunny</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">Light</h4>
                      <p className="text-slate-600">{productData.careInstructions.light}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="material-icons text-green-500">water_drop</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">Watering</h4>
                      <p className="text-slate-600">{productData.careInstructions.water}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="material-icons text-green-500">grass</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">Soil</h4>
                      <p className="text-slate-600">{productData.careInstructions.soil}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="material-icons text-green-500">thermostat</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">Temperature</h4>
                      <p className="text-slate-600">{productData.careInstructions.temperature}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div>
                <h3 className="mb-3 text-xl font-semibold text-slate-800">Plant Benefits</h3>
                <ul className="list-none space-y-2">
                  {productData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-slate-700">
                      <span className="material-icons text-green-500">check_circle</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 className="mb-3 text-xl font-semibold text-slate-800">Specifications</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(productData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                      <span className="text-slate-500">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <span className="font-medium text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

