import React, { useState } from 'react';
import './Checkout.css';
import { api, assetUrl } from '../../lib/api';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Checkout = ({ cartItems, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod', // Default to COD
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [paymentError, setPaymentError] = useState('');


  const paymentMethods = [
    { value: 'cod', label: 'Cash on Delivery', icon: 'payments' },
    { value: 'razorpay', label: 'Online Payment (Razorpay)', icon: 'account_balance_wallet' }
  ];

  // Currency formatter for INR
  const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount) || 0);

  // Inline validators for focus-based validation
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
  const isPhoneIN = (v) => /^[6-9]\d{9}$/.test(String(v || '').trim());
  const isPincodeIN = (v) => /^\d{6}$/.test(String(v || '').trim());
  const minLen = (v, n) => String(v || '').trim().length >= n;

  const validateField = (name, value, ctx = {}) => {
    const v = String(value || '').trim();
    switch (name) {
      case 'firstName':
        if (!v) return 'First name is required';
        if (!minLen(v, 2)) return 'First name must be at least 2 characters';
        if (!/^[A-Za-z\s'-]+$/.test(v)) return 'Only letters allowed';
        return '';
      case 'lastName':
        if (!v) return 'Last name is required';
        if (!minLen(v, 2)) return 'Last name must be at least 2 characters';
        if (!/^[A-Za-z\s'-]+$/.test(v)) return 'Only letters allowed';
        return '';
      case 'email':
        if (!v) return 'Email is required';
        if (!isEmail(v)) return 'Enter a valid email address';
        return '';
      case 'phone':
        if (!v) return 'Phone number is required';
        if (!isPhoneIN(v)) return 'Enter a valid 10-digit Indian mobile number';
        return '';
      case 'address':
        if (!v) return 'Address is required';
        if (!minLen(v, 5)) return 'Address must be at least 5 characters';
        return '';
      case 'city':
        if (!v) return 'City is required';
        return '';
      case 'state':
        if (!v) return 'State is required';
        return '';
      case 'zipCode':
        if (!v) return 'PIN code is required';
        if (!isPincodeIN(v)) return 'Enter a valid 6-digit PIN code';
        return '';


      default:
        return '';
    }
  };

  const handleFocus = (e) => {
    const { name, value } = e.target || {};
    if (!name) return;
    const msg = validateField(name, value, { billingSameAsShipping: formData.billingSameAsShipping });
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Live sanitization
    const nameLikeFields = new Set(['firstName', 'lastName', 'billingFirstName', 'billingLastName']);
    let valueSanitized = value;
    if (nameLikeFields.has(name)) {
      valueSanitized = value.replace(/[^A-Za-z\s'-]/g, '');
    } else if (name === 'phone') {
      valueSanitized = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : valueSanitized
    }));

    if (name === 'email' || name === 'phone') {
      const msg = validateField(name, valueSanitized, { billingSameAsShipping: formData.billingSameAsShipping });
      setErrors(prev => ({ ...prev, [name]: msg }));
    } else if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'zipCode' && valueSanitized.length === 6) {
      handlePinCodeLookup(valueSanitized);
    }
  };

  const handlePinCodeLookup = async (pinCode) => {
    if (!/^\d{6}$/.test(pinCode)) return;
    setIsLoadingLocation(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District || '',
          state: postOffice.State || ''
        }));
      }
    } catch (error) {
      console.error('PIN code lookup failed:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'PIN code is required';


    if (!formData.paymentMethod) newErrors.paymentMethod = 'Select a payment method';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateOrderTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
    const shipping = subtotal >= 499 ? 0 : 49;
    const discount = subtotal > 999 ? subtotal * 0.10 : 0;
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + shipping + tax;
    return { subtotal, discount, shipping, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Small timeout to allow React to render the error messages before scrolling
      setTimeout(() => {
        const firstError = document.querySelector('.flip-error-msg');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setIsProcessing(true);
    setPaymentError('');
    try {
      const orderTotal = calculateOrderTotal();
      const productsPayload = cartItems.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.finalPrice }));
      const addressString = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;

      if (formData.paymentMethod === 'cod') {
        const res = await api.createOrder({
          products: productsPayload,
          totalAmount: orderTotal.total,
          address: addressString,
          paymentMethod: 'cod'
        });
        if (res.status === 'success') {
          onOrderComplete({ orderId: res.orderId, status: 'success', total: orderTotal.total, date: new Date().toISOString(), method: 'COD' });
        } else {
          throw new Error(res.error || 'Failed to place COD order');
        }
      } else {
        const ok = await loadRazorpay();
        if (!ok) throw new Error('Failed to load payment SDK');

        const createRes = await api.createOrder({
          products: productsPayload,
          totalAmount: orderTotal.total,
          address: addressString,
          paymentMethod: 'razorpay'
        });

        const options = {
          key: createRes.razorpayKeyId,
          amount: createRes.amount,
          currency: createRes.currency || 'INR',
          name: 'GreenCart',
          description: 'Secure Payment',
          order_id: createRes.razorpayOrderId,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            contact: formData.phone,
          },
          handler: async function (response) {
            try {
              const verifyRes = await api.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: createRes.orderId,
              });
              if (verifyRes.success) {
                onOrderComplete({ orderId: createRes.orderId, status: 'success', total: orderTotal.total, date: new Date().toISOString(), method: 'Razorpay' });
              } else {
                setPaymentError(verifyRes.error || 'Payment verification failed');
              }
            } catch (err) {
              setPaymentError(err.message || 'Payment verification failed');
            } finally {
              setIsProcessing(false);
            }
          },
          modal: { ondismiss: () => setIsProcessing(false) },
          theme: { color: '#2e7d32' },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => {
          setPaymentError(resp.error.description || 'Payment failed');
          setIsProcessing(false);
        });
        rzp.open();
      }
    } catch (err) {
      if (err.status === 401) {
        setPaymentError('Your session has expired. Please log in again to complete your order.');
      } else {
        setPaymentError(err.message || 'Something went wrong. Please try again.');
      }
      setIsProcessing(false);
    }
  };

  const orderTotal = calculateOrderTotal();

  return (
    <div className="checkout flipkart-style">
      <div className="container">
        <div className="checkout-main-grid">
          {/* Main Form Area */}
          <div className="checkout-main-area">
            {/* Step 1: Product Selection/Review */}
            <div className="checkout-section-flip white-card">
              <div className="section-header-flip">
                <span className="step-num">1</span>
                <h2>ORDER SUMMARY</h2>
              </div>
              <div className="section-content-flip">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flip-product-row">
                    <div className="flip-product-img">
                      <img src={assetUrl(item.images?.[0] || item.image) || '/placeholder-plant.png'} alt={item.name} />
                    </div>
                    <div className="flip-product-details">
                      <h3>{item.name}</h3>
                      <p className="flip-product-qty">Qty: {item.quantity}</p>
                      <p className="flip-product-price">{formatINR(item.finalPrice * item.quantity)}</p>
                      <p className="flip-product-delivery">Delivery in 3-5 days</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="checkout-section-flip white-card">
              <div className="section-header-flip">
                <span className="step-num">2</span>
                <h2>DELIVERY ADDRESS</h2>
              </div>
              <div className="section-content-flip">
                <div className="flip-address-form">
                  <div className="flip-form-row">
                    <div className="flip-input-group">
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} onBlur={handleFocus} className={errors.firstName ? 'error' : ''} placeholder="First Name" />
                      {errors.firstName && <span className="flip-error-msg">{errors.firstName}</span>}
                    </div>
                    <div className="flip-input-group">
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} onBlur={handleFocus} className={errors.lastName ? 'error' : ''} placeholder="Last Name" />
                      {errors.lastName && <span className="flip-error-msg">{errors.lastName}</span>}
                    </div>
                  </div>
                  <div className="flip-form-row">
                    <div className="flip-input-group">
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handleFocus} className={errors.phone ? 'error' : ''} placeholder="10-digit mobile number" maxLength="10" />
                      {errors.phone && <span className="flip-error-msg">{errors.phone}</span>}
                    </div>
                    <div className="flip-input-group">
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} onBlur={handleFocus} className={errors.email ? 'error' : ''} placeholder="Email" />
                      {errors.email && <span className="flip-error-msg">{errors.email}</span>}
                    </div>
                  </div>
                  <div className="flip-input-group full">
                    <textarea name="address" value={formData.address} onChange={handleInputChange} onBlur={handleFocus} className={errors.address ? 'error' : ''} placeholder="Address (Area and Street)" rows="3" />
                    {errors.address && <span className="flip-error-msg">{errors.address}</span>}
                  </div>
                  <div className="flip-form-row tripartite">
                    <div className="flip-input-group">
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} onBlur={handleFocus} className={errors.city ? 'error' : ''} placeholder="City/District/Town" />
                      {errors.city && <span className="flip-error-msg">{errors.city}</span>}
                    </div>
                    <div className="flip-input-group">
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} onBlur={handleFocus} className={errors.state ? 'error' : ''} placeholder="State" />
                      {errors.state && <span className="flip-error-msg">{errors.state}</span>}
                    </div>
                    <div className="flip-input-group">
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} onBlur={handleFocus} className={errors.zipCode ? 'error' : ''} placeholder="Pincode" maxLength="6" />
                      {errors.zipCode && <span className="flip-error-msg">{errors.zipCode}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Options */}
            <div className="checkout-section-flip white-card">
              <div className="section-header-flip">
                <span className="step-num">3</span>
                <h2>PAYMENT OPTIONS</h2>
              </div>
              <div className="section-content-flip">
                <div className="flip-payment-options">
                  {paymentMethods.map((m) => (
                    <label key={m.value} className={`flip-payment-item ${formData.paymentMethod === m.value ? 'selected' : ''}`}>
                      <input type="radio" name="paymentMethod" value={m.value} checked={formData.paymentMethod === m.value} onChange={handleInputChange} />
                      <span className="radio-circle"></span>
                      <div className="payment-label-group">
                        <span className="payment-label">{m.label}</span>
                        {m.value === 'cod' && <p className="payment-sub">Pay at your doorstep</p>}
                        {m.value === 'razorpay' && <p className="payment-sub">Safe & Secure Online Payment</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Action Button */}
            <div className="flip-final-action">
              <button onClick={handleSubmit} disabled={isProcessing} className="flip-confirm-btn">
                {isProcessing ? 'PROCESSING...' : (formData.paymentMethod === 'cod' ? 'CONFIRM ORDER' : 'CONTINUE TO PAYMENT')}
              </button>
              {paymentError && <p className="flip-error">{paymentError}</p>}
            </div>
          </div>

          {/* Right Sidebar: Price Details */}
          <div className="checkout-sidebar-flip">
            <div className="white-card price-details-card">
              <h2 className="price-header">PRICE DETAILS</h2>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Price ({cartItems.length} items)</span>
                  <span>{formatINR(orderTotal.subtotal)}</span>
                </div>
                {orderTotal.discount > 0 && (
                  <div className="price-row green">
                    <span>Discount (10%)</span>
                    <span>-{formatINR(orderTotal.discount)}</span>
                  </div>
                )}
                <div className="price-row">
                  <span>Delivery Charges</span>
                  <span className={orderTotal.shipping === 0 ? 'green' : ''}>
                    {orderTotal.shipping === 0 ? 'FREE' : formatINR(orderTotal.shipping)}
                  </span>
                </div>
                <div className="price-row">
                  <span>Tax (8% GST)</span>
                  <span>{formatINR(orderTotal.tax)}</span>
                </div>
                <div className="price-total-row">
                  <span>Total Amount</span>
                  <span>{formatINR(orderTotal.total)}</span>
                </div>
              </div>
              <p className="price-saving-msg">You will save {formatINR(orderTotal.discount)} on this order</p>
            </div>

            <div className="flip-trust-badges">
              <div className="trust-item">
                <span className="material-icons">verified_user</span>
                <span>Safe and Secure Payments. 100% Authentic products.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

















