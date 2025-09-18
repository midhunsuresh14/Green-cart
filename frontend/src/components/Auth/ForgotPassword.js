import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import SendRounded from '@mui/icons-material/SendRounded';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1=request, 2=verify+reset
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    const trimmed = (email || '').trim();
    if (!trimmed) return setError('Email is required');
    if (!validateEmail(trimmed)) return setError('Please enter a valid email address');

    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/password/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      await res.json();
      setMessage('If an account exists, a reset code has been sent to your email.');
      setStep(2);
    } catch (_) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const trimmedEmail = (email || '').trim();
    const trimmedCode = (code || '').trim();
    if (!trimmedEmail || !validateEmail(trimmedEmail)) return setError('Valid email is required');
    if (!trimmedCode) return setError('Verification code is required');
    if (!newPassword || newPassword.length < 6) return setError('Password must be at least 6 characters');

    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, code: trimmedCode, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successful. You can now log in.');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (_) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#F7FAF8,#EEF7F1)' }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ width: 72, height: 72, borderRadius: 3, overflow: 'hidden', bgcolor: 'grey.100', display: 'grid', placeItems: 'center' }}>
              <img src="/istockphoto-1263328016-612x612.jpg" alt="GreenCart" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>

            <Box textAlign="center">
              <Typography variant="h4" fontWeight={800} gutterBottom>Reset Password</Typography>
              <Typography color="text.secondary">Enter your email to receive reset instructions</Typography>
            </Box>

            <Box component="form" onSubmit={step === 1 ? handleRequest : handleReset} sx={{ width: '100%' }} noValidate>
              <Stack spacing={2}>
                <TextField
                  type="email"
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  fullWidth
                  error={Boolean(error)}
                  helperText={error || ' '}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {step === 2 && (
                  <>
                    <TextField
                      type="text"
                      label="Verification code"
                      placeholder="6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isLoading}
                      fullWidth
                    />
                    <TextField
                      type="password"
                      label="New password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      fullWidth
                    />
                  </>
                )}

                {message && (
                  <Alert severity="success">{message}</Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={!isLoading && <SendRounded />}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} /> {step === 1 ? 'Sending...' : 'Resetting...'}
                    </>
                  ) : (
                    step === 1 ? 'Send Code' : 'Reset Password'
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>Back to Login</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPassword;