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

  const getPrimaryImageSrc = (p) => {
    const raw = p?.imageUrl || p?.image || p?.image_path || p?.imagePath || p?.thumbnail || p?.photo || p?.photoUrl || p?.url;
    return resolveImageUrl(raw);
  };

  // Get all images from the product, ensuring we use the exact same image as in ProductCard
  const getAllImages = (p) => {
    if (!p) return [];
    
    // First, try to get all images from the product
    if (Array.isArray(p.images) && p.images.length > 0) {
      return p.images.map(img => resolveImageUrl(img)).filter(Boolean);
    }
    
    // If no images array, try to get multiple image fields
    const imageFields = [
      p.imageUrl, p.image, p.image_path, p.imagePath, 
      p.thumbnail, p.photo, p.photoUrl, p.url
    ].filter(Boolean);
    
    if (imageFields.length > 0) {
      return imageFields.map(img => resolveImageUrl(img)).filter(Boolean);
    }
    
    // Fallback to single image
    const primaryImage = getPrimaryImageSrc(p);
    return primaryImage ? [primaryImage] : [];
  };

  const productImages = getAllImages(product);
  const fallbackImage = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=500&q=80';

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
    images: productImages.length > 0 ? productImages : [fallbackImage],
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            onClick={onBack}
          >
            <span className="material-icons text-lg">arrow_back</span>
            Back to Products
          </button>
        </div>

        {/* Main Product Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="p-6 bg-gray-50">
              <div className="max-w-md mx-auto">
                {/* Main Image */}
                <div className="relative mb-4">
                  <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200">
                    <img
                      src={productData.images[selectedImage]}
                      alt={productData.name}
                      className="h-full w-full object-contain p-4"
                      onError={(e) => { e.currentTarget.src = fallbackImage; }}
                    />
                  </div>
                  
                  {/* Discount Badge */}
                  {productData.discount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      -{productData.discount}% OFF
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                <div className="flex gap-2 justify-center">
                  {productData.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-12 w-12 overflow-hidden rounded border transition-all duration-200 ${
                        selectedImage === index
                          ? 'border-green-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${productData.name} view ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <div className="mb-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {productData.category}
                  </span>
                </div>
                
                <h1 className="mb-3 text-xl font-bold text-gray-900">
                  {productData.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(productData.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    {productData.rating} ({productData.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{getCurrentPrice()}
                    </span>
                    {productData.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        ₹{productData.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {productData.longDescription || productData.description}
                </p>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Size</h3>
                <div className="grid grid-cols-1 gap-2">
                  {productData.sizes.map((size) => {
                    const selected = selectedSize === size.name;
                    return (
                      <button
                        key={size.name}
                        className={`flex items-center justify-between p-2 border rounded transition-colors ${
                          selected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSize(size.name)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                            selected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}>
                            {selected && <div className="w-1 h-1 bg-white rounded-full"></div>}
                          </div>
                          <span className="text-xs font-medium text-gray-900">{size.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">
                          ₹{size.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="mb-6">
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-gray-900">Quantity</label>
                  <div className="flex items-center gap-1 w-fit">
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <span className="material-icons text-xs">remove</span>
                    </button>
                    <span className="min-w-[2rem] text-center text-xs font-medium text-gray-900 px-2">
                      {quantity}
                    </span>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      aria-label="Increase quantity"
                    >
                      <span className="material-icons text-xs">add</span>
                    </button>
                  </div>
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={!productData.inStock}
                >
                  <span className="material-icons text-sm">shopping_cart</span>
                  <span>Add to Cart - ₹{(getCurrentPrice() * quantity).toFixed(2)}</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 border rounded text-xs font-medium transition-colors ${
                      isInWishlist
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onToggleWishlist && onToggleWishlist(productData)}
                  >
                    <span className="material-icons text-sm">
                      {isInWishlist ? 'favorite' : 'favorite_border'}
                    </span>
                    <span>{isInWishlist ? 'In Wishlist' : 'Wishlist'}</span>
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded text-xs font-medium hover:bg-gray-50">
                    <span className="material-icons text-sm">share</span>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {productData.inStock ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <span className="material-icons text-sm">check_circle</span>
                    <span className="font-medium">In Stock - Ready to Ship</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <span className="material-icons text-sm">cancel</span>
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'description', label: 'Description', icon: 'description' },
                { key: 'care', label: 'Care Instructions', icon: 'eco' },
                { key: 'benefits', label: 'Benefits', icon: 'star' },
                { key: 'specs', label: 'Specifications', icon: 'info' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="material-icons text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900">About This Plant</h3>
                <p className="text-gray-600 leading-relaxed">{productData.longDescription}</p>
              </div>
            )}

            {activeTab === 'care' && (
              <div>
                <h3 className="mb-6 text-xl font-semibold text-gray-900">Care Instructions</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-white">
                      <span className="material-icons">wb_sunny</span>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Light Requirements</h4>
                      <p className="text-sm text-gray-600">{productData.careInstructions.light}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                      <span className="material-icons">water_drop</span>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Watering Schedule</h4>
                      <p className="text-sm text-gray-600">{productData.careInstructions.water}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">
                      <span className="material-icons">grass</span>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Soil Type</h4>
                      <p className="text-sm text-gray-600">{productData.careInstructions.soil}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white">
                      <span className="material-icons">thermostat</span>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Temperature Range</h4>
                      <p className="text-sm text-gray-600">{productData.careInstructions.temperature}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div>
                <h3 className="mb-6 text-xl font-semibold text-gray-900">Plant Benefits</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {productData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                        <span className="material-icons text-sm">check_circle</span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 className="mb-6 text-xl font-semibold text-gray-900">Specifications</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(productData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600 font-medium">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{value}</span>
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

