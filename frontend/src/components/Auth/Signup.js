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
  Divider,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import PersonOutlined from '@mui/icons-material/PersonOutline';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PhoneIphone from '@mui/icons-material/PhoneIphone';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddAlt1 from '@mui/icons-material/PersonAddAlt1';
import GoogleIcon from '@mui/icons-material/Google';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\+?[\d\s\-\(\)]{10,15}$/.test(phone.replace(/\s/g, ''));
}

function Signup({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      navigate('/');
    }
  }, [navigate, setUser]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength; // 0-5
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'name' ? value.replace(/[^A-Za-z\s'-]/g, '') : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    if (name === 'password') setPasswordStrength(calculatePasswordStrength(nextValue));

    if (touched[name]) {
      let message = '';
      if (name === 'name') {
        const trimmed = nextValue.trim();
        if (!trimmed) message = 'Full name is required';
        else if (trimmed.length < 2) message = 'Name must be at least 2 characters';
      } else if (name === 'email') {
        const trimmed = nextValue.trim();
        if (!trimmed) message = 'Email is required';
        else if (!validateEmail(trimmed)) message = 'Please enter a valid email address';
      } else if (name === 'phone') {
        if (!nextValue.trim()) message = 'Phone number is required';
        else if (!validatePhone(nextValue)) message = 'Please enter a valid phone number';
      } else if (name === 'password') {
        if (!nextValue) message = 'Password is required';
        else if (nextValue.length < 6) message = 'Password must be at least 6 characters';
      } else if (name === 'confirmPassword') {
        if (!nextValue) message = 'Please confirm your password';
        else if (nextValue !== formData.password) message = 'Passwords do not match';
      }
      setErrors((prev) => ({ ...prev, [name]: message }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid phone number';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setErrors({ submit: 'Verification email sent! Please check your inbox and enter the OTP below.' });
      } else {
        setErrors({ submit: data.error || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otp.trim(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const newUser = {
          id: data.user_id,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          role: 'user',
        };
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('justSignedUp', '1');
        setUser(newUser);
        navigate('/');
      } else {
        setOtpError(data.error || 'OTP verification failed. Please try again.');
      }
    } catch (err) {
      setOtpError('Network error. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setOtpError('');

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.name.trim(),
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setErrors({ submit: 'New verification email sent! Please check your inbox.' });
      } else {
        setOtpError(data.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setOtpError('Network error. Please check your connection and try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
          localStorage.setItem('justSignedUp', '1');
          setUser(data.user);
          navigate('/');
        } else {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('justSignedUp', '1');
          setUser(userData);
          navigate('/');
        }
      } catch (_) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('justSignedUp', '1');
        setUser(userData);
        navigate('/');
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setErrors({ submit: 'Sign-up was cancelled. Please try again.' });
      } else if (error.code === 'auth/popup-blocked') {
        setErrors({ submit: 'Popup was blocked. Please allow popups and try again.' });
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setErrors({ submit: 'An account already exists with this email. Please try signing in instead.' });
      } else {
        setErrors({ submit: 'Google Sign-Up failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strengthPercent = (passwordStrength / 5) * 100;
  const strengthColor = passwordStrength <= 1 ? 'error' : passwordStrength <= 3 ? 'warning' : 'success';

  if (user) return <Navigate to="/dashboard" />;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#F7FAF8,#EEF7F1)' }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ width: 72, height: 72, borderRadius: 3, overflow: 'hidden', bgcolor: 'grey.100', display: 'grid', placeItems: 'center' }}>
              <img src="/istockphoto-1263328016-612x612.jpg" alt="GreenCart" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>

            <Box textAlign="center">
              <Typography variant="h4" fontWeight={800} gutterBottom>Create Account</Typography>
              <Typography color="text.secondary">Join GreenCart and start your green journey</Typography>
            </Box>

            {!otpSent ? (
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }} noValidate>
                <Stack spacing={2}>
                  <TextField
                    name="name"
                    label="Full Name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setTouched((p) => ({ ...p, name: true }))}
                    error={Boolean(errors.name && touched.name)}
                    helperText={(touched.name && errors.name) || ' '}
                    autoComplete="name"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlined color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    name="phone"
                    type="tel"
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onFocus={() => setTouched((p) => ({ ...p, phone: true }))}
                    error={Boolean(errors.phone && touched.phone)}
                    helperText={(touched.phone && errors.phone) || ' '}
                    autoComplete="tel"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setTouched((p) => ({ ...p, password: true }))}
                    error={Boolean(errors.password && touched.password)}
                    helperText={(touched.password && errors.password) || ' '}
                    autoComplete="new-password"
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

                  {formData.password && (
                    <Stack spacing={0.5} sx={{ mt: -1 }}>
                      <LinearProgress variant="determinate" value={strengthPercent} color={strengthColor} sx={{ height: 8, borderRadius: 999 }} />
                      <Typography variant="caption" color="text.secondary">
                        Password strength: {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                      </Typography>
                    </Stack>
                  )}

                  <TextField
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                    error={Boolean(errors.confirmPassword && touched.confirmPassword)}
                    helperText={(touched.confirmPassword && errors.confirmPassword) || ' '}
                    autoComplete="new-password"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={() => setShowConfirmPassword((s) => !s)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControlLabel control={<Checkbox required />} label={<span>I agree to the <Link to="/terms" style={{ textDecoration: 'underline', color: 'inherit' }}>Terms of Service</Link> and <Link to="/privacy" style={{ textDecoration: 'underline', color: 'inherit' }}>Privacy Policy</Link></span>} />

                  {errors.submit && (
                    <Alert severity={errors.submit.includes('sent') ? 'success' : 'error'}>{errors.submit}</Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={!isLoading && <PersonAddAlt1 />}
                    disabled={isLoading}
                  >
                    {isLoading ? <><CircularProgress size={20} sx={{ mr: 1 }} /> Sending verification...</> : 'Create Account'}
                  </Button>

                  <Divider>or</Divider>

                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                  >
                    Continue with Google
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleOtpVerification} sx={{ width: '100%' }} noValidate>
                <Stack spacing={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" gutterBottom>
                      Verify Your Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                    </Typography>
                  </Box>

                  <TextField
                    label="Enter Verification Code"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                      setOtpError('');
                    }}
                    error={Boolean(otpError)}
                    helperText={otpError || ' '}
                    fullWidth
                    inputProps={{
                      maxLength: 6,
                      style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      type="button"
                      variant="text"
                      color="primary"
                      onClick={handleResendOtp}
                      disabled={isResending || isVerifying}
                      size="small"
                    >
                      {isResending ? <><CircularProgress size={16} sx={{ mr: 1 }} /> Resending...</> : 'Resend Code'}
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      color="primary"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setOtpError('');
                        setErrors({});
                      }}
                      disabled={isResending || isVerifying}
                      size="small"
                    >
                      Change Email
                    </Button>
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={!otp.trim() || otp.length !== 6 || isVerifying}
                  >
                    {isVerifying ? <><CircularProgress size={20} sx={{ mr: 1 }} /> Verifying...</> : 'Verify & Create Account'}
                  </Button>
                </Stack>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>Sign in here</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Signup;