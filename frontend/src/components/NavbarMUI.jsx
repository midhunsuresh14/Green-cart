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
import FeedbackIcon from '@mui/icons-material/Feedback';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';
import LocalPharmacyOutlined from '@mui/icons-material/LocalPharmacyOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { Link as RouterLink } from 'react-router-dom';
import NotificationsPanel from './Blog/NotificationsPanel';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Blog', to: '/blog' },
];

const services = [
  {
    label: 'Identify Plant',
    to: '/identify',
    icon: <CameraAltOutlined color="success" />,
    desc: 'Instantly identify plants and their medicinal properties.'
  },
  {
    label: 'Herbal Remedies',
    to: '/remedies',
    icon: <LocalPharmacyOutlined color="error" />,
    desc: 'Discover natural treatments for common ailments.'
  },
  {
    label: 'Crop Planner',
    to: '/crop-planner',
    icon: <WbSunnyOutlined color="warning" />,
    desc: 'Get personalized crop recommendations using weather data.'
  },
];

export default function NavbarMUI({ user, onLogout, wishlistItems = [], cartCount = 0, onOpenCart, onOpenFeedback }) {
  const [open, setOpen] = useState(false);
  const [profileEl, setProfileEl] = useState(null);
  const [servicesEl, setServicesEl] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const toggle = (val) => () => {
    setOpen(val);
    if (!val) setMobileServicesOpen(false);
  };
  const openProfile = (e) => setProfileEl(e.currentTarget);
  const closeProfile = () => setProfileEl(null);
  const openServices = (e) => setServicesEl(e.currentTarget);
  const closeServices = () => setServicesEl(null);
  const openNotifications = () => setNotificationsOpen(true);
  const closeNotifications = () => setNotificationsOpen(false);
  const toggleMobileServices = (e) => {
    e.stopPropagation();
    setMobileServicesOpen(!mobileServicesOpen);
  };

  return (
    <>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 800 }}>G</Box>
            <Typography variant="h6" fontWeight={700} color="primary.main">GreenCart</Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            {links.map((l) => (
              <Button key={l.to} component={RouterLink} to={l.to} color="inherit">{l.label}</Button>
            ))}

            <Button
              color="inherit"
              onClick={openServices}
              endIcon={<KeyboardArrowDownIcon sx={{
                ml: 0.5,
                transition: 'transform 0.3s ease',
                transform: servicesEl ? 'rotate(180deg)' : 'none',
                fontSize: '1.2rem'
              }} />}
              sx={{
                fontWeight: servicesEl ? 700 : 500,
                textTransform: 'none',
                px: 2,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              More Services
            </Button>
            <Menu
              anchorEl={servicesEl}
              open={Boolean(servicesEl)}
              onClose={closeServices}
              disableScrollLock
              PaperProps={{
                sx: {
                  mt: 1.5,
                  p: 1.5,
                  width: 350,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    width: 12,
                    height: 12,
                    bgcolor: 'background.paper',
                    transform: 'translate(-50%, -50%) rotate(45deg)',
                    zIndex: 0,
                    borderLeft: '1px solid',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Box sx={{ px: 1, py: 1, pb: 2 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                  Our Specialized Services
                </Typography>
              </Box>
              {services.map((s) => (
                <MenuItem
                  key={s.to}
                  component={RouterLink}
                  to={s.to}
                  onClick={closeServices}
                  sx={{
                    borderRadius: 3,
                    mb: 1,
                    py: 1.5,
                    px: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      transform: 'translateX(4px)',
                      '& .service-icon-box': {
                        bgcolor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }
                    }
                  }}
                >
                  <Stack direction="row" spacing={2.5} alignItems="flex-start" sx={{ width: '100%' }}>
                    <Box
                      className="service-icon-box"
                      sx={{
                        p: 1.25,
                        bgcolor: 'grey.100',
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                    >
                      {React.cloneElement(s.icon, { sx: { fontSize: '1.4rem' } })}
                    </Box>
                    <Box sx={{ flexGrow: 1, pt: 0.25 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>{s.label}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{
                        display: 'block',
                        lineHeight: 1.4,
                        whiteSpace: 'normal',
                        fontSize: '0.75rem'
                      }}>
                        {s.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}

              <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

              <MenuItem
                onClick={() => { closeServices(); onOpenFeedback && onOpenFeedback(); }}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  px: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    transform: 'translateX(4px)',
                    '& .service-icon-box': {
                      bgcolor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }
                }}
              >
                <Stack direction="row" spacing={2.5} alignItems="center" sx={{ width: '100%' }}>
                  <Box
                    className="service-icon-box"
                    sx={{
                      p: 1.25,
                      bgcolor: 'grey.100',
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                  >
                    <FeedbackIcon sx={{ fontSize: '1.4rem', color: 'primary.main' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>Feedback</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Share your thoughts with us</Typography>
                  </Box>
                </Stack>
              </MenuItem>
            </Menu>
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
            {user && (
              <IconButton onClick={openNotifications} color="inherit" aria-label="Notifications" sx={{ position: 'relative' }}>
                <NotificationsIcon />
              </IconButton>
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
      <Toolbar />

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
              <ListItemButton onClick={toggleMobileServices}>
                <ListItemText primary="More Services" primaryTypographyProps={{ fontWeight: 600 }} />
                {mobileServicesOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {services.map((s) => (
                  <ListItemButton
                    key={s.to}
                    sx={{ pl: 4, py: 1.5 }}
                    component={RouterLink}
                    to={s.to}
                    onClick={toggle(false)}
                  >
                    <Box sx={{ mr: 2, display: 'flex', p: 1, bgcolor: 'grey.100', borderRadius: 1.5 }}>{s.icon}</Box>
                    <ListItemText
                      primary={s.label}
                      secondary={s.desc}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                    />
                  </ListItemButton>
                ))}
                <ListItemButton
                  sx={{ pl: 4, py: 1.5 }}
                  onClick={() => { toggle(false)(); onOpenFeedback && onOpenFeedback(); }}
                >
                  <Box sx={{ mr: 2, display: 'flex', p: 1, bgcolor: 'grey.100', borderRadius: 1.5 }}>
                    <FeedbackIcon sx={{ color: 'primary.main' }} />
                  </Box>
                  <ListItemText
                    primary="Feedback"
                    secondary="Share your thoughts with us"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                  />
                </ListItemButton>
              </List>
            </Collapse>
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

      {/* Notifications Panel */}
      {user && (
        <NotificationsPanel
          user={user}
          isOpen={notificationsOpen}
          onClose={closeNotifications}
        />
      )}
    </>
  );
}