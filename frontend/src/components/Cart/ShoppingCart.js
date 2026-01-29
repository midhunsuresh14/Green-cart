import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShoppingCart.css';

const ShoppingCart = ({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [cart, setCart] = useState(() => {
    if (cartItems && cartItems.length) return cartItems;
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // const [isLoading, setIsLoading] = useState(false); // Removed unused state
  const navigate = useNavigate();

  // Image URL resolution function
  const resolveImageUrl = useMemo(() => {
    return (src) => {
      if (!src) return 'https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=200&q=80';
      // If it's already a full URL, return as is
      if (/^https?:\/\//i.test(src)) return src;
      // If it's a local path that already starts with /uploads/, prepend the backend URL
      if (src.startsWith('/uploads/')) {
        const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
        const host = apiBase.replace(/\/api\/?$/, '');
        return host + src;
      }
      // If it's a local path, prepend the API base URL
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      const host = apiBase.replace(/\/api\/?$/, '');
      return src.startsWith('/') ? host + src : host + '/' + src;
    };
  }, []);

  // Keep local state in sync with props or restore from localStorage on refresh
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setCart(cartItems);
    } else {
      try {
        const saved = localStorage.getItem('cart');
        if (saved) setCart(JSON.parse(saved));
      } catch { }
    }
  }, [cartItems]);

  // Persist cart locally so refresh restores it
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch { }
  }, [cart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      onRemoveItem(itemId);
      return;
    }

    // Check stock availability before updating quantity
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      const response = await fetch(`${apiBase}/products/${itemId}/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.available) {
          alert(`Only ${data.maxAvailable} items available in stock`);
          // Update to maximum available quantity
          onUpdateQuantity(itemId, data.maxAvailable);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking stock:', error);
    }

    onUpdateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    onRemoveItem(itemId);
  };

  const handleClearCart = () => {
    onClearCart();
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 999 ? subtotal * 0.10 : 0;
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    if (subtotal >= 499) return 0; // Free shipping over ₹499
    return 49; // Standard shipping ₹49
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * 0.08; // 8% tax on discounted total
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    const tax = calculateTax();
    return subtotal - discount + shipping + tax;
  };

  const getShippingMessage = () => {
    const subtotal = calculateSubtotal();
    if (subtotal >= 499) {
      return "🎉 You qualify for FREE shipping!";
    } else {
      return `Add ₹${(499 - subtotal).toFixed(0)} more for FREE shipping!`;
    }
  };

  if (cart.length === 0) {
    return (
      <div className="shopping-cart">
        <div className="container">
          <div className="cart-header">
            <h1>Your Shopping Cart</h1>
          </div>

          <div className="empty-cart">
            <div className="empty-cart-content">
              <span className="material-icons">shopping_cart</span>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any plants to your cart yet.</p>
              <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
                <span className="material-icons">arrow_back</span>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-cart">
      <div className="container">
        <div className="cart-header">
          <h1>Your Shopping Cart</h1>
          <p>{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            <div className="cart-items-header">
              <h2>Items</h2>
              <button
                className="clear-cart-btn"
                onClick={handleClearCart}
              >
                <span className="material-icons">delete_sweep</span>
                Clear Cart
              </button>
            </div>

            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize?.name || 'default'}`} className="cart-item">
                  <div className="item-image">
                    <img
                      src={resolveImageUrl(item.images?.[0] || item.image || item.imageUrl)}
                      alt={item.name}
                    />
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                    {item.selectedSize && (
                      <p className="item-size">Size: {item.selectedSize.label}</p>
                    )}
                    <div className="item-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < Math.floor(item.rating || 0) ? 'filled' : ''}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="rating-text">({item.reviews || 0} reviews)</span>
                    </div>
                  </div>

                  <div className="item-quantity">
                    <label>Quantity</label>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, Number(item.quantity) - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <span className="material-icons">remove</span>
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, Number(item.quantity) + 1)}
                        disabled={item.quantity >= 10}
                      >
                        <span className="material-icons">add</span>
                      </button>
                    </div>
                  </div>

                  <div className="item-price">
                    <div className="price-details">
                      <span className="unit-price">₹{(item.finalPrice || item.price).toFixed(2)}</span>
                      <span className="total-price">₹{(((item.finalPrice || item.price) * item.quantity).toFixed(2))}</span>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove item"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                    <button
                      className="wishlist-btn"
                      title="Move to wishlist"
                    >
                      <span className="material-icons">favorite_border</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>

                {calculateDiscount() > 0 && (
                  <div className="summary-row text-green-600 font-medium">
                    <span>Discount (10% Off)</span>
                    <span>-₹{calculateDiscount().toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping().toFixed(2)}`}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Tax</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="shipping-message">
                <span className="material-icons">local_shipping</span>
                <span>{getShippingMessage()}</span>
              </div>

              <div className="checkout-actions">
                <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                  <span className="material-icons">shopping_cart</span>
                  Proceed to Checkout
                </button>

                <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
                  <span className="material-icons">arrow_back</span>
                  Continue Shopping
                </button>
              </div>

              {/* Security Badges */}
              <div className="security-badges">
                <div className="security-badge">
                  <span className="material-icons">security</span>
                  <span>Secure Checkout</span>
                </div>
                <div className="security-badge">
                  <span className="material-icons">verified</span>
                  <span>SSL Encrypted</span>
                </div>
                <div className="security-badge">
                  <span className="material-icons">local_shipping</span>
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>

            {/* Promo Code removed as requested */}

            {/* Recommended Products */}
            <div className="recommended-products">
              <h3>You might also like</h3>
              <div className="recommended-list">
                <div className="recommended-item">
                  <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=100&q=80" alt="Recommended" />
                  <div className="recommended-details">
                    <h4>Eucalyptus Plant</h4>
                    <p>$34.99</p>
                  </div>
                </div>
                <div className="recommended-item">
                  <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=100&q=80" alt="Recommended" />
                  <div className="recommended-details">
                    <h4>Chamomile Plant</h4>
                    <p>$16.99</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;






