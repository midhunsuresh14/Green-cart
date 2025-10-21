import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { Link as RouterLink } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Herbal Remedies', to: '/remedies' },
  { label: 'Blog', to: '/blog' }, // Add Blog link
];

export default function NavbarMUI({ user, onLogout, wishlistItems = [], cartCount = 0, onOpenCart }) {
  const [open, setOpen] = useState(false);
  const [profileEl, setProfileEl] = useState(null);

  const toggle = (val) => () => setOpen(val);
  const openProfile = (e) => setProfileEl(e.currentTarget);
  const closeProfile = () => setProfileEl(null);

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 800 }}>G</Box>
            <Typography variant="h6" fontWeight={700} color="primary.main">GreenCart</Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            {links.map((l) => (
              <Button key={l.to} component={RouterLink} to={l.to} color="inherit">{l.label}</Button>
            ))}
            <IconButton 
              onClick={() => onOpenCart && onOpenCart()} 
              color="inherit" 
              aria-label="Cart" 
              sx={{ position: 'relative' }}
            >
              <ShoppingCartIcon />
              {cartCount > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'error.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {cartCount}
                </Box>
              )}
            </IconButton>
            <IconButton component={RouterLink} to="/wishlist" color="inherit" aria-label="Wishlist" sx={{ position: 'relative' }}>
              <span className="material-icons">favorite</span>
              {wishlistItems.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'error.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {wishlistItems.length}
                </Box>
              )}
            </IconButton>
            {user?.role === 'admin' && (
              <Button startIcon={<DashboardIcon />} component={RouterLink} to="/admin" color="inherit">Admin</Button>
            )}
            {user ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={openProfile} aria-label="Account" color="inherit">
                  <Avatar sx={{ width: 32, height: 32 }} src={user?.photoURL || ''}>
                    {user?.name?.[0] || 'A'}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={profileEl} open={Boolean(profileEl)} onClose={closeProfile} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                  <MenuItem component={RouterLink} to="/profile" onClick={closeProfile}>Profile</MenuItem>
                  <MenuItem onClick={() => { closeProfile(); onLogout && onLogout(); }}>
                    <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Logout
                  </MenuItem>
                </Menu>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button startIcon={<LoginIcon />} component={RouterLink} to="/login" color="inherit">Login</Button>
                <Button startIcon={<AppRegistrationIcon />} component={RouterLink} to="/signup" variant="contained" color="primary">Sign Up</Button>
              </Stack>
            )}
          </Stack>

          <IconButton onClick={toggle(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={toggle(false)}>
        <Box sx={{ width: 280 }} role="presentation" onClick={toggle(false)}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 800 }}>G</Box>
            <Typography variant="h6" fontWeight={700}>GreenCart</Typography>
          </Stack>
          <Divider />
          <List>
            {links.map((l) => (
              <ListItem key={l.to} disablePadding>
                <ListItemButton component={RouterLink} to={l.to}>
                  <ListItemText primary={l.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/cart">
                <ListItemText primary="Cart" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/wishlist">
                <ListItemText primary={`Wishlist ${wishlistItems.length > 0 ? `(${wishlistItems.length})` : ''}`} />
              </ListItemButton>
            </ListItem>
            {user?.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/admin">
                  <ListItemText primary="Admin" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            {user ? (
              <Stack spacing={1}>
                <Button startIcon={<PersonIcon />} component={RouterLink} to="/profile" color="inherit">Profile</Button>
                <Button startIcon={<LogoutIcon />} variant="contained" color="primary" onClick={onLogout}>Logout</Button>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Button startIcon={<LoginIcon />} component={RouterLink} to="/login" variant="outlined">Login</Button>
                <Button startIcon={<AppRegistrationIcon />} component={RouterLink} to="/signup" variant="contained">Sign Up</Button>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}