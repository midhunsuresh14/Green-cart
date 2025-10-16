import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function ConfirmationPage() {
  const location = useLocation();
  const status = (location.state && location.state.status) || 'success';
  const isSuccess = status === 'success';

  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        {isSuccess ? (
          <>
            <h1>Payment Successful</h1>
            <p>Your order has been placed successfully.</p>
          </>
        ) : (
          <>
            <h1>Payment Failed</h1>
            <p>Something went wrong. Please try again.</p>
          </>
        )}
        <div style={{ marginTop: 16 }}>
          <Link to="/">Go to Home</Link>
        </div>
      </div>
    </div>
  );
}















