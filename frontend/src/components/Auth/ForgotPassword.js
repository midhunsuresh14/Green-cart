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

    setTimeout(() => {
      setIsLoading(false);
      setMessage('If an account with this email exists, you will receive password reset instructions.');
    }, 1200);
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

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }} noValidate>
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
                      <CircularProgress size={20} sx={{ mr: 1 }} /> Sending...
                    </>
                  ) : (
                    'Send Reset Link'
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