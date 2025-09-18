import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
];

export default function AdminNavbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [profileEl, setProfileEl] = useState(null);
  const navigate = useNavigate();

  const toggle = (val) => () => setOpen(val);
  const openProfile = (e) => setProfileEl(e.currentTarget);
  const closeProfile = () => setProfileEl(null);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" component="button" onClick={handleGoHome} sx={{ textDecoration: 'none', color: 'inherit', border: 'none', background: 'none', cursor: 'pointer' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 800 }}>G</Box>
            <Typography variant="h6" fontWeight={700} color="primary.main">GreenCart Admin</Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            {links.map((l) => (
              <Button key={l.to} onClick={() => navigate(l.to)} color="inherit">{l.label}</Button>
            ))}
            <Button startIcon={<DashboardIcon />} onClick={() => navigate('/admin')} color="inherit">Admin Dashboard</Button>
            {user ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={openProfile} aria-label="Account" color="inherit">
                  <Avatar sx={{ width: 32, height: 32 }} src={user?.photoURL || ''}>
                    {user?.name?.[0] || 'A'}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={profileEl} open={Boolean(profileEl)} onClose={closeProfile} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                  <MenuItem onClick={() => { closeProfile(); navigate('/profile'); }}>Profile</MenuItem>
                  <MenuItem onClick={() => { closeProfile(); handleLogout(); }}>
                    <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Logout
                  </MenuItem>
                </Menu>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button onClick={() => navigate('/login')} color="inherit">Login</Button>
                <Button onClick={() => navigate('/signup')} variant="contained" color="primary">Sign Up</Button>
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
            <Typography variant="h6" fontWeight={700}>GreenCart Admin</Typography>
          </Stack>
          <Divider />
          <List>
            {links.map((l) => (
              <ListItem key={l.to} disablePadding>
                <ListItemButton onClick={() => navigate(l.to)}>
                  <ListItemText primary={l.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/admin')}>
                <ListItemText primary="Admin Dashboard" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            {user ? (
              <Stack spacing={1}>
                <Button startIcon={<PersonIcon />} onClick={() => navigate('/profile')} color="inherit">Profile</Button>
                <Button startIcon={<LogoutIcon />} variant="contained" color="primary" onClick={handleLogout}>Logout</Button>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Button onClick={() => navigate('/login')} variant="outlined">Login</Button>
                <Button onClick={() => navigate('/signup')} variant="contained">Sign Up</Button>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}





