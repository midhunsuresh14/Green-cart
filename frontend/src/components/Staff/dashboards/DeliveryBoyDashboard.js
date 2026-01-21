import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDeliveryOrders, markOrderDelivered } from '../../../lib/api';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Container,
    Box,
    Card,
    CardContent,
    Button,
    Stack,
    Chip,
    Avatar,
    CircularProgress,
    Alert,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    useMediaQuery,
    useTheme
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import MenuIcon from '@mui/icons-material/Menu';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloseIcon from '@mui/icons-material/Close';

const DRAWER_WIDTH = 280;

export default function DeliveryBoyDashboard({ user, onLogout }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeView, setActiveView] = useState('active'); // 'active' or 'history'

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await listDeliveryOrders(activeView);
            setOrders(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [activeView]);

    const handleDeliver = async (id) => {
        if (!window.confirm('Are you sure you want to mark this order as delivered?')) return;
        try {
            await markOrderDelivered(id);
            loadOrders();
        } catch (e) {
            alert('Failed to update status: ' + e.message);
        }
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/');
    };

    const openMap = (address) => {
        const query = encodeURIComponent(typeof address === 'string' ? address : `${address?.street || ''}, ${address?.city || ''}, ${address?.zip || ''}`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleViewChange = (view) => {
        setActiveView(view);
        setMobileOpen(false);
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}>
                    {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{user?.name}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Delivery Partner</Typography>
                </Box>
            </Box>

            <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                        selected={activeView === 'active'}
                        onClick={() => handleViewChange('active')}
                        sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' } }}
                    >
                        <ListItemIcon><DashboardIcon color={activeView === 'active' ? 'primary' : 'inherit'} /></ListItemIcon>
                        <ListItemText primary="Active Deliveries" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={activeView === 'history'}
                        onClick={() => handleViewChange('history')}
                        sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' } }}
                    >
                        <ListItemIcon><HistoryIcon color={activeView === 'history' ? 'primary' : 'inherit'} /></ListItemIcon>
                        <ListItemText primary="Delivery History" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                </ListItem>
            </List>

            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ borderRadius: 2 }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7f5' }}>
            <AppBar position="fixed" elevation={0} sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: 'white',
                color: 'text.primary',
                borderBottom: '1px solid #eee',
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { md: `${DRAWER_WIDTH}px` }
            }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 800, color: '#2e7d32' }}>
                        {activeView === 'active' ? 'Active Deliveries' : 'Delivery History'}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                    }}
                >
                    {drawerContent}
                </Drawer>
                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #eee' },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                <Toolbar /> {/* Spacer for AppBar */}
                <Container maxWidth="md" sx={{ py: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                    ) : (
                        <Stack spacing={2}>
                            {orders.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
                                    <Box sx={{ bgcolor: '#fff', p: 4, borderRadius: '50%', display: 'inline-flex', mb: 2 }}>
                                        {activeView === 'active' ? <LocalShippingIcon sx={{ fontSize: 40, color: '#ccc' }} /> : <HistoryIcon sx={{ fontSize: 40, color: '#ccc' }} />}
                                    </Box>
                                    <Typography color="text.secondary" fontWeight={500}>
                                        {activeView === 'active' ? 'No pending deliveries assigned to you.' : 'No delivery history found.'}
                                    </Typography>
                                </Box>
                            ) : (
                                orders.map((order) => (
                                    <Card key={order.id} sx={{
                                        borderRadius: 4,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        border: '1px solid #f0f0f0',
                                        overflow: 'visible',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)' }
                                    }}>
                                        <Box sx={{ p: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: activeView === 'active' ? '#fafafa' : '#e8f5e9', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 0.5 }}>
                                                ORDER #{order.id.substring(0, 8).toUpperCase()}
                                            </Typography>
                                            <Chip
                                                label={order.deliveryStatus}
                                                size="small"
                                                color={order.deliveryStatus === 'Delivered' ? 'success' : order.deliveryStatus === 'Shipped' ? 'info' : 'warning'}
                                                sx={{ fontWeight: 700, borderRadius: 1 }}
                                            />
                                        </Box>

                                        <CardContent sx={{ p: 3 }}>
                                            <Stack spacing={2.5}>
                                                <GridContainer>
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Customer</Typography>
                                                        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>{order.customerName}</Typography>
                                                    </Box>
                                                    {activeView === 'history' && (
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Delivered On</Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </GridContainer>

                                                <Box>
                                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Delivery Location</Typography>
                                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                        <LocationOnIcon sx={{ color: '#d32f2f', mt: 0.2 }} />
                                                        <Typography variant="body1" fontWeight={500} sx={{ lineHeight: 1.4 }}>
                                                            {typeof order.address === 'string' ? order.address : `${order.address?.street || ''}, ${order.address?.city || ''}`}
                                                        </Typography>
                                                    </Stack>
                                                </Box>

                                                {activeView === 'active' && (
                                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                        {order.customerPhone && (
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<PhoneIcon />}
                                                                href={`tel:${order.customerPhone}`}
                                                                sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1 }}
                                                            >
                                                                Call
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<LocationOnIcon />}
                                                            onClick={() => openMap(order.address)}
                                                            sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1 }}
                                                        >
                                                            Map
                                                        </Button>
                                                    </Stack>
                                                )}

                                                <Box sx={{ pt: 2, borderTop: '1px dashed #e0e0e0' }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                                        <Typography color="text.secondary" fontWeight={500}>Total Amount</Typography>
                                                        <Typography variant="h5" fontWeight={800} color="success.main">
                                                            ₹{Number(order.totalAmount).toFixed(2)}
                                                        </Typography>
                                                    </Stack>

                                                    {activeView === 'active' && (
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            size="large"
                                                            color="success"
                                                            onClick={() => handleDeliver(order.id)}
                                                            sx={{
                                                                borderRadius: 3,
                                                                py: 1.5,
                                                                textTransform: 'none',
                                                                fontWeight: 700,
                                                                boxShadow: '0 8px 16px rgba(46, 125, 50, 0.24)'
                                                            }}
                                                        >
                                                            Mark as Delivered
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </Stack>
                    )}
                </Container>
            </Box>
        </Box>
    );
}

const GridContainer = ({ children }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 2 }}>
        {children}
    </Box>
);
