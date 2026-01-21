import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminOrders from '../../Admin/AdminOrders';
import AdminProducts from '../../Admin/AdminProducts';
import StatsCards from '../../Admin/StatsCards';
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
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 260;

const sections = [
    { key: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { key: 'products', label: 'Inventory', icon: <Inventory2Icon /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBagIcon /> },
];

export default function StoreManagerDashboard({ user, onLogout }) {
    const [active, setActive] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileEl, setProfileEl] = useState(null);
    const navigate = useNavigate();

    const openProfile = (e) => setProfileEl(e.currentTarget);
    const closeProfile = () => setProfileEl(null);

    const handleLogout = (e) => {
        e.stopPropagation();
        if (onLogout) onLogout();
        navigate('/');
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={800} color="primary.main">
                    GreenCart Manager
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
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700}>Manager Dashboard</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user && (
                            <IconButton onClick={openProfile} color="inherit">
                                <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.[0] || 'M'}</Avatar>
                            </IconButton>
                        )}
                        <Menu
                            anchorEl={profileEl}
                            open={Boolean(profileEl)}
                            onClose={closeProfile}
                        >
                            <MenuItem onClick={closeProfile}><PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile</MenuItem>
                            <MenuItem onClick={handleLogout}><LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
                {active === 'overview' && (
                    <>
                        <Typography variant="h5" gutterBottom fontWeight={600}>Welcome, {user?.name}</Typography>
                        <StatsCards />
                    </>
                )}
                {active === 'products' && <AdminProducts />}
                {active === 'orders' && <AdminOrders />}
            </Box>
        </Box>
    );
}
