import React, { useState } from 'react';
import './Checkout.css';
import { api } from '../../lib/api';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'IN',
    
    // Billing Information
    billingSameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    
    // Payment Information
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Delivery Options
    deliveryMethod: 'standard',
    deliveryDate: '',
    specialInstructions: '',
    
    // Order Summary
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const deliveryOptions = [
    { value: 'standard', label: 'Standard Delivery', price: 9.99, days: '3-5 business days' },
    { value: 'express', label: 'Express Delivery', price: 19.99, days: '1-2 business days' },
    { value: 'overnight', label: 'Overnight Delivery', price: 39.99, days: 'Next business day' }
  ];

  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: 'credit_card' },
    { value: 'paypal', label: 'PayPal', icon: 'account_balance' },
    { value: 'apple', label: 'Apple Pay', icon: 'phone_iphone' },
    { value: 'google', label: 'Google Pay', icon: 'phone_android' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-detect city and state from PIN code
    if (name === 'zipCode' && value.length === 6) {
      handlePinCodeLookup(value);
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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    }
    
    if (step === 2 && !formData.billingSameAsShipping) {
      if (!formData.billingFirstName) newErrors.billingFirstName = 'Billing first name is required';
      if (!formData.billingLastName) newErrors.billingLastName = 'Billing last name is required';
      if (!formData.billingAddress) newErrors.billingAddress = 'Billing address is required';
      if (!formData.billingCity) newErrors.billingCity = 'Billing city is required';
      if (!formData.billingState) newErrors.billingState = 'Billing state is required';
      if (!formData.billingZipCode) newErrors.billingZipCode = 'Billing ZIP code is required';
    }
    
    if (step === 3) {
      // For Razorpay, we don't collect card details here; ensure a payment method is chosen
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const calculateOrderTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
    const selectedDelivery = deliveryOptions.find(d => d.value === formData.deliveryMethod);
    const shipping = selectedDelivery ? selectedDelivery.price : 0;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    setIsProcessing(true);
    setPaymentError('');
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Failed to load payment SDK');

      const orderTotal = calculateOrderTotal();
      const productsPayload = cartItems.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.finalPrice }));
      const createRes = await api.createOrder({ products: productsPayload, totalAmount: orderTotal.total });

      const options = {
        key: createRes.razorpayKeyId,
        amount: createRes.amount,
        currency: createRes.currency || 'INR',
        name: 'GreenCart',
        description: 'Order Payment',
        order_id: createRes.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        notes: { dbOrderId: createRes.dbOrderId },
        handler: async function (response) {
          try {
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: createRes.dbOrderId,
            });
            if (verifyRes.success) {
              onOrderComplete({ orderId: createRes.dbOrderId, status: 'success', total: orderTotal.total, date: new Date().toISOString() });
            } else {
              setPaymentError(verifyRes.error || 'Payment verification failed');
            }
          } catch (err) {
            setPaymentError(err.message || 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        },
        theme: { color: '#4CAF50' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setPaymentError('Payment failed. Please try again.');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const orderTotal = calculateOrderTotal();

  return (
    <div className="checkout">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order securely</p>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            {/* Progress Steps */}
            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Shipping</div>
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Billing</div>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Payment</div>
              </div>
              <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Review</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div className="checkout-step">
                  <h2>Shipping Information</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? 'error' : ''}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? 'error' : ''}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="Enter your email"
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? 'error' : ''}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Street Address / Area *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={errors.address ? 'error' : ''}
                      placeholder="Enter your area, street, building name"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City / District *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? 'error' : ''}
                        placeholder="Enter your city"
                        disabled={isLoadingLocation}
                      />
                      {isLoadingLocation && <span style={{fontSize: '0.8rem', color: '#666'}}>Detecting location...</span>}
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="state">State *</label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={errors.state ? 'error' : ''}
                        disabled={isLoadingLocation}
                      >
                        <option value="">Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
                      </select>
                      {errors.state && <span className="error-message">{errors.state}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="zipCode">PIN Code *</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={errors.zipCode ? 'error' : ''}
                        placeholder="110001"
                        maxLength="6"
                      />
                      {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>

                  <div className="step-actions">
                    <button type="button" onClick={handleNext} className="next-btn">
                      Continue to Billing
                      <span className="material-icons">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Billing Information */}
              {currentStep === 2 && (
                <div className="checkout-step">
                  <h2>Billing Information</h2>
                  
                  <div className="billing-option">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="billingSameAsShipping"
                        checked={formData.billingSameAsShipping}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Billing address same as shipping address
                    </label>
                  </div>

                  {!formData.billingSameAsShipping && (
                    <div className="billing-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="billingFirstName">First Name *</label>
                          <input
                            type="text"
                            id="billingFirstName"
                            name="billingFirstName"
                            value={formData.billingFirstName}
                            onChange={handleInputChange}
                            className={errors.billingFirstName ? 'error' : ''}
                            placeholder="Enter billing first name"
                          />
                          {errors.billingFirstName && <span className="error-message">{errors.billingFirstName}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="billingLastName">Last Name *</label>
                          <input
                            type="text"
                            id="billingLastName"
                            name="billingLastName"
                            value={formData.billingLastName}
                            onChange={handleInputChange}
                            className={errors.billingLastName ? 'error' : ''}
                            placeholder="Enter billing last name"
                          />
                          {errors.billingLastName && <span className="error-message">{errors.billingLastName}</span>}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="billingAddress">Billing Address *</label>
                        <input
                          type="text"
                          id="billingAddress"
                          name="billingAddress"
                          value={formData.billingAddress}
                          onChange={handleInputChange}
                          className={errors.billingAddress ? 'error' : ''}
                          placeholder="Enter billing address"
                        />
                        {errors.billingAddress && <span className="error-message">{errors.billingAddress}</span>}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="billingCity">City *</label>
                          <input
                            type="text"
                            id="billingCity"
                            name="billingCity"
                            value={formData.billingCity}
                            onChange={handleInputChange}
                            className={errors.billingCity ? 'error' : ''}
                            placeholder="Enter billing city"
                          />
                          {errors.billingCity && <span className="error-message">{errors.billingCity}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="billingState">State *</label>
                          <select
                            id="billingState"
                            name="billingState"
                            value={formData.billingState}
                            onChange={handleInputChange}
                            className={errors.billingState ? 'error' : ''}
                          >
                            <option value="">Select State</option>
                            <option value="CA">California</option>
                            <option value="NY">New York</option>
                            <option value="TX">Texas</option>
                            <option value="FL">Florida</option>
                            <option value="IL">Illinois</option>
                          </select>
                          {errors.billingState && <span className="error-message">{errors.billingState}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="billingZipCode">ZIP Code *</label>
                          <input
                            type="text"
                            id="billingZipCode"
                            name="billingZipCode"
                            value={formData.billingZipCode}
                            onChange={handleInputChange}
                            className={errors.billingZipCode ? 'error' : ''}
                            placeholder="12345"
                          />
                          {errors.billingZipCode && <span className="error-message">{errors.billingZipCode}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="step-actions">
                    <button type="button" onClick={handlePrevious} className="prev-btn">
                      <span className="material-icons">arrow_back</span>
                      Back to Shipping
                    </button>
                    <button type="button" onClick={handleNext} className="next-btn">
                      Continue to Payment
                      <span className="material-icons">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div className="checkout-step">
                  <h2>Payment Information</h2>
                  
                  <div className="payment-methods">
                    <h3>Select Payment Method</h3>
                    <div className="payment-options">
                      {paymentMethods.map(method => (
                        <label key={method.value} className={`payment-option ${formData.paymentMethod === method.value ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={handleInputChange}
                          />
                          <span className="payment-icon">
                            <span className="material-icons">{method.icon}</span>
                          </span>
                          <span className="payment-label">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="card-form">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number *</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={errors.cardNumber ? 'error' : ''}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                        {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="cardName">Cardholder Name *</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className={errors.cardName ? 'error' : ''}
                          placeholder="Enter cardholder name"
                        />
                        {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date *</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className={errors.expiryDate ? 'error' : ''}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="cvv">CVV *</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className={errors.cvv ? 'error' : ''}
                            placeholder="123"
                            maxLength="4"
                          />
                          {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="delivery-options">
                    <h3>Delivery Options</h3>
                    <div className="delivery-choices">
                      {deliveryOptions.map(option => (
                        <label key={option.value} className={`delivery-option ${formData.deliveryMethod === option.value ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value={option.value}
                            checked={formData.deliveryMethod === option.value}
                            onChange={handleInputChange}
                          />
                          <div className="delivery-info">
                            <div className="delivery-label">{option.label}</div>
                            <div className="delivery-details">
                              <span className="delivery-days">{option.days}</span>
                              <span className="delivery-price">${option.price}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      placeholder="Any special delivery instructions..."
                      rows="3"
                    />
                  </div>

                  <div className="step-actions">
                    <button type="button" onClick={handlePrevious} className="prev-btn">
                      <span className="material-icons">arrow_back</span>
                      Back to Billing
                    </button>
                    <button type="button" onClick={handleNext} className="next-btn">
                      Review Order
                      <span className="material-icons">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review Order */}
              {currentStep === 4 && (
                <div className="checkout-step">
                  <h2>Review Your Order</h2>
                  
                  <div className="order-review">
                    <div className="shipping-review">
                      <h3>Shipping Address</h3>
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                      <p>{formData.email} • {formData.phone}</p>
                    </div>

                    <div className="payment-review">
                      <h3>Payment Method</h3>
                      <p>{formData.paymentMethod === 'card' ? 'Credit Card ending in ****' : formData.paymentMethod.toUpperCase()}</p>
                    </div>

                    <div className="delivery-review">
                      <h3>Delivery Method</h3>
                      <p>{deliveryOptions.find(d => d.value === formData.deliveryMethod)?.label}</p>
                    </div>
                  </div>

                  <div className="step-actions">
                    <button type="button" onClick={handlePrevious} className="prev-btn">
                      <span className="material-icons">arrow_back</span>
                      Back to Payment
                    </button>
                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="spinner"></div>
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <span className="material-icons">lock</span>
                          Place Order - ${orderTotal.total.toFixed(2)}
                        </>
                      )}
                    </button>
                    {paymentError && <div className="error-message" style={{ marginTop: 8 }}>{paymentError}</div>}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>
              
              <div className="order-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.images?.[0] || item.image} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                      <p>${(item.finalPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${orderTotal.subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>${orderTotal.shipping.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${orderTotal.tax.toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${orderTotal.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="security-info">
                <span className="material-icons">security</span>
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

















