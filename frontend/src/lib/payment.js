// Payment utility functions
import { api } from './api';

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(window.Razorpay);
    };
    script.onerror = () => {
      resolve(null);
    };
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (bookingId) => {
  try {
    const response = await fetch(`${api.getBaseURL()}/events/bookings/${bookingId}/create-payment-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders()
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to create payment order';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    const order = await response.json();
    console.log('Created Razorpay order:', order);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};