import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    // Simulate API call (you can implement this later)
    setTimeout(() => {
      setIsLoading(false);
      setMessage('If an account with this email exists, you will receive password reset instructions.');
    }, 2000);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/istockphoto-1263328016-612x612.jpg" alt="GreenCart" />
          </div>
          <h1>Reset Password</h1>
          <p>Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">email</span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error ? 'error' : ''}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {error && <span className="error-message">{error}</span>}
          </div>

          {message && (
            <div className="success-alert">
              <span className="material-icons">check_circle</span>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-btn primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Sending...
              </>
            ) : (
              <>
                <span className="material-icons">send</span>
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;