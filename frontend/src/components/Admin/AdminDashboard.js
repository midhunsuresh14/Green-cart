import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminCategories from './AdminCategories';
import AdminRemedies from './AdminRemedies';
import AdminRemedyCategories from './AdminRemedyCategories';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';
import TopProducts from './TopProducts';
import QuickActions from './QuickActions';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Badge,
  Divider,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CategoryIcon from '@mui/icons-material/Category';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { api } from '../../lib/api';

const drawerWidth = 260;

const sections = [
  { key: 'overview', label: 'Overview', icon: <DashboardIcon /> },
  { key: 'products', label: 'Products', icon: <Inventory2Icon /> },
  { key: 'categories', label: 'Categories', icon: <CategoryIcon /> },
  { key: 'remedies', label: 'Herbal Remedies', icon: <LocalPharmacyIcon /> },
  { key: 'remedy-categories', label: 'Remedy Categories', icon: <LocalPharmacyIcon /> },
  { key: 'orders', label: 'Orders', icon: <ShoppingBagIcon /> },
  { key: 'users', label: 'Users', icon: <PeopleAltIcon /> },
];

export default function AdminDashboard({ user, onLogout }) {
  const [active, setActive] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileEl, setProfileEl] = useState(null);
  const [lowCount, setLowCount] = useState(0);
  const navigate = useNavigate();

  const openProfile = (e) => setProfileEl(e.currentTarget);
  const closeProfile = () => setProfileEl(null);

  const handleLogout = (e) => {
    e.stopPropagation();
    setMobileOpen(false); // Close mobile drawer if open
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.lowStock();
        if (mounted) setLowCount(res?.count || 0);
      } catch (_) {
        if (mounted) setLowCount(0);
      }
    })();
    return () => { mounted = false; };
  }, []);


  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          GreenCart Admin
        </Typography>
      </Box>
      <Divider />
      <List sx={{ py: 1 }}>
        {sections.map((s) => (
          <ListItemButton
            key={s.key}
            selected={active === s.key}
            onClick={() => {
              setActive(s.key);
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{s.icon}</ListItemIcon>
            <ListItemText primary={s.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      <Box sx={{ p: 2, color: 'text.secondary', fontSize: 12 }}>
        © {new Date().getFullYear()} GreenCart
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>Admin Dashboard</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

            <IconButton color="inherit"><SearchIcon /></IconButton>
            <IconButton color="inherit">
              <Badge color="error" badgeContent={lowCount} invisible={lowCount === 0}>
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
            {user && (
              <IconButton onClick={openProfile} color="inherit">
                <Avatar sx={{ width: 32, height: 32 }} src={user?.photoURL || ''}>
                  {user?.name?.[0] || 'A'}
                </Avatar>
              </IconButton>
            )}
            <Menu
              anchorEl={profileEl}
              open={Boolean(profileEl)}
              onClose={closeProfile}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={closeProfile}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          p: { xs: 2, md: 3 },
          pt: { xs: 10, md: 12 },
        }}
      >
        {active === 'overview' && (
          <>
            <StatsCards />
            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 3 }}>
              <RecentActivity />
              <TopProducts />
            </Box>
            <QuickActions
              onAddUser={() => setActive('users')}
              onAddProduct={() => setActive('products')}
              onViewOrders={() => setActive('orders')}
            />
          </>
        )}
        {active === 'products' && (<AdminProducts />)}
        {active === 'categories' && (<AdminCategories />)}
        {active === 'remedies' && (<AdminRemedies />)}
        {active === 'remedy-categories' && (<AdminRemedyCategories />)}
        {active === 'orders' && (<AdminOrders />)}
        {active === 'users' && (<AdminUsers />)}
      </Box>
    </Box>
  );
}


