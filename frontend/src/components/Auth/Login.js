import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
} from '@mui/material';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import GoogleIcon from '@mui/icons-material/Google';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function Login({ user, setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      if (parsed?.role === 'admin') navigate('/admin');
      else if (parsed?.role === 'store_manager') navigate('/store-manager');
      else if (parsed?.role === 'delivery_boy') navigate('/delivery-boy');
      else navigate('/');
    }
  }, [navigate, setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      let message = '';
      if (name === 'email') {
        const trimmed = value.trim();
        if (!trimmed) message = 'Email is required';
        else if (!validateEmail(trimmed)) message = 'Please enter a valid email address';
      } else if (name === 'password') {
        if (!value) message = 'Password is required';
        else if (value.length < 6) message = 'Password must be at least 6 characters';
      }
      setErrors((prev) => ({ ...prev, [name]: message }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const trimmed = (value || '').trim();
    let message = '';

    if (name === 'email') {
      if (!trimmed) message = 'Email is required';
      else if (!validateEmail(trimmed)) message = 'Please enter a valid email address';
    } else if (name === 'password') {
      if (!value) message = 'Password is required';
      else if (value.length < 6) message = 'Password must be at least 6 characters';
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };



  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        if (data.user?.role === 'admin') navigate('/admin');
        else if (data.user?.role === 'store_manager') navigate('/store-manager');
        else if (data.user?.role === 'delivery_boy') navigate('/delivery-boy');
        else navigate('/');
      } else {
        setErrors({ submit: data.error || 'Login failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        phone: user.phoneNumber || '',
        photoURL: user.photoURL,
      };

      try {
        const response = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/google-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            phone: user.phoneNumber || '',
            photoURL: user.photoURL,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          if (data.user?.role === 'admin') navigate('/admin');
          else if (data.user?.role === 'store_manager') navigate('/store-manager');
          else if (data.user?.role === 'delivery_boy') navigate('/delivery-boy');
          else navigate('/');
        } else {
          const fallbackUser = { ...userData, role: 'user' };
          localStorage.setItem('user', JSON.stringify(fallbackUser));
          setUser(fallbackUser);
          navigate('/');
        }
      } catch (_) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/');
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setErrors({ submit: 'Sign-in was cancelled. Please try again.' });
      } else if (error.code === 'auth/popup-blocked') {
        setErrors({ submit: 'Popup was blocked. Please allow popups and try again.' });
      } else {
        setErrors({ submit: 'Google Sign-In failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'store_manager') return <Navigate to="/store-manager" />;
    if (user.role === 'delivery_boy') return <Navigate to="/delivery-boy" />;
    return <Navigate to="/" />;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#F7FAF8,#EEF7F1)' }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ width: 72, height: 72, borderRadius: 3, overflow: 'hidden', bgcolor: 'grey.100', display: 'grid', placeItems: 'center' }}>
              <img src="/istockphoto-1263328016-612x612.jpg" alt="GreenCart" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>

            <Box textAlign="center">
              <Typography variant="h4" fontWeight={800} gutterBottom>Welcome Back</Typography>
              <Typography color="text.secondary">Sign in to your GreenCart account</Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }} noValidate>
              <Stack spacing={2}>
                <TextField
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onFocus={() => setTouched((p) => ({ ...p, email: true }))}
                  error={Boolean(errors.email && touched.email)}
                  helperText={(touched.email && errors.email) || ' '}
                  autoComplete="email"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onFocus={() => setTouched((p) => ({ ...p, password: true }))}
                  error={Boolean(errors.password && touched.password)}
                  helperText={(touched.password && errors.password) || ' '}
                  autoComplete="current-password"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((s) => !s)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <FormControlLabel control={<Checkbox />} label="Remember me" />
                  <Link to="/forgot-password" style={{ textDecoration: 'underline', color: 'inherit' }}>Forgot password?</Link>
                </Stack>

                {errors.submit && (
                  <Alert severity="error">{errors.submit}</Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={!isLoading && <LoginIcon />}
                  disabled={isLoading}
                >
                  {isLoading ? <><CircularProgress size={20} sx={{ mr: 1 }} /> Signing in...</> : 'Sign In'}
                </Button>

                <Divider>or</Divider>

                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  Continue with Google
                </Button>


              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link to="/signup" style={{ color: 'inherit', textDecoration: 'underline' }}>Create one here</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;