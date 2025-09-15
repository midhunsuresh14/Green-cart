import React, { useState, useEffect } from 'react';
import './ShoppingCart.css';

const ShoppingCart = ({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [cart, setCart] = useState(cartItems || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCart(cartItems || []);
  }, [cartItems]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
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

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    if (subtotal >= 100) return 0; // Free shipping over ₹100
    if (subtotal >= 50) return 5.99; // Reduced shipping
    return 9.99; // Standard shipping
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const getShippingMessage = () => {
    const subtotal = calculateSubtotal();
    if (subtotal >= 100) {
      return "🎉 You qualify for FREE shipping!";
    } else if (subtotal >= 50) {
      return `Add $${(100 - subtotal).toFixed(2)} more for FREE shipping!`;
    } else {
      return `Add $${(50 - subtotal).toFixed(2)} more for reduced shipping!`;
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
              <button className="continue-shopping-btn">
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
                      src={item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=200&q=80'} 
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
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <span className="material-icons">remove</span>
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
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
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="shipping-message">
                <span className="material-icons">local_shipping</span>
                <span>{getShippingMessage()}</span>
              </div>

              <div className="checkout-actions">
                <button className="checkout-btn">
                  <span className="material-icons">shopping_cart</span>
                  Proceed to Checkout
                </button>
                
                <button className="continue-shopping-btn">
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






