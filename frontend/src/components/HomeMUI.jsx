import React from 'react';
import { Box, Container, Typography, Stack, Grid, Paper, Button, Divider, Card, CardContent, CardMedia } from '@mui/material';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';
import LocalPharmacyOutlined from '@mui/icons-material/LocalPharmacyOutlined';
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined';
import ArrowForwardIosRounded from '@mui/icons-material/ArrowForwardIosRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function HomeMUI() {
    const navigate = useNavigate();
    const [categories, setCategories] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Fetch categories
                const categoryData = await api.listCategories();
                setCategories(categoryData);
                
                // Fetch products
                const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
                const response = await fetch(`${apiBase}/products`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const productData = await response.json();
                setProducts(productData);
            } catch (err) {
                setError(err);
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Get top rated products (sort by rating and take top 8)
    const topRatedProducts = React.useMemo(() => {
        if (!products || products.length === 0) return [];
        return [...products]
            .filter(p => p.rating && p.rating > 0) // Only products with ratings
            .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating descending
            .slice(0, 8); // Take top 8
    }, [products]);

    // Helper function to resolve image URLs
    const resolveImageUrl = (src) => {
        if (!src) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&q=60';
        if (/^https?:\/\//i.test(src)) return src;
        const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
        const host = apiBase.replace(/\/api\/?$/, '');
        return src.startsWith('/') ? host + src : host + '/' + src;
    };

    // Get primary image URL for a product
    const getPrimaryImageUrl = (product) => {
        const raw = product?.imageUrl || product?.image || product?.image_path || product?.imagePath || product?.thumbnail || product?.photo || product?.photoUrl || product?.url;
        return resolveImageUrl(raw);
    };

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
            {/* Hero */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: { xs: 420, sm: 520, md: 640 },
                    display: 'grid',
                    alignItems: 'center',
                    backgroundImage:
                        'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(https://images.unsplash.com/photo-1463554050456-f2ed7d3fec09?q=80&w=2000&auto=format&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'common.white',
                }}
                aria-label="Hero"
            >
                <Container maxWidth="lg">
                    <Stack spacing={2}>
                        <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: 32, sm: 42, md: 56 } }}>
                            AI‑Enhanced Plant E‑Commerce
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'grey.100', maxWidth: 800 }}>
                            Discover, identify, and plan your garden with eco‑friendly guidance.
                        </Typography>
                        <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                            <Button
                                component={RouterLink}
                                to="/products"
                                variant="contained"
                                color="primary"
                                size="large"
                                endIcon={<ArrowForwardIosRounded />}
                            >
                                Explore Plants
                            </Button>
                            <Button component={RouterLink} to="/about" variant="outlined" color="inherit" size="large">
                                Learn More
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* Features */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
                <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800}>Why Choose GreenCart?</Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                        Powerful tools to help you grow smarter and live greener.
                    </Typography>
                </Stack>
                
                <Box 
                    sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { 
                            xs: '1fr',
                            md: 'repeat(2, 1fr)',
                            lg: 'repeat(4, 1fr)' 
                        },
                        gap: 3,
                        width: '100%'
                    }}
                >
                    {[{
                        icon: <CameraAltOutlined sx={{ fontSize: '3rem' }} color="success" />,
                        title: 'AI Plant Identification',
                        desc: 'Upload a photo and instantly identify plants with details on medicinal properties and care.',
                        link: '/products'
                    }, {
                        icon: <WbSunnyOutlined sx={{ fontSize: '3rem' }} color="warning" />,
                        title: 'Weather‑Based Suggestions',
                        desc: 'Personalized crop recommendations using your location\'s weather patterns.',
                        link: '/products'
                    }, {
                        icon: <LocalPharmacyOutlined sx={{ fontSize: '3rem' }} color="error" />,
                        title: 'Herbal Remedies',
                        desc: 'Discover natural treatments for common ailments with verified benefits.',
                        link: '/remedies'
                    }, {
                        icon: <ShoppingBasketOutlined sx={{ fontSize: '3rem' }} color="primary" />,
                        title: 'Verified Products',
                        desc: 'Shop curated organic plants and herbal products, verified for quality.',
                        link: '/products'
                    }].map((f) => (
                        <Paper 
                            key={f.title}
                            variant="outlined" 
                            onClick={() => navigate(f.link)}
                            sx={{ 
                                p: 3, 
                                borderRadius: 3, 
                                height: '100%',
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: 'translateY(0)',
                                userSelect: 'none',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                bgcolor: 'background.paper',
                                borderColor: 'divider',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease',
                                },
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                                    borderColor: 'primary.main',
                                    '&::before': {
                                        opacity: 1,
                                    }
                                },
                                '&:active': {
                                    transform: 'translateY(-4px)',
                                    transition: 'all 0.1s ease',
                                }
                            }}
                        >
                            <Stack spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                                <Box sx={{ 
                                    p: 2, 
                                    borderRadius: 2, 
                                    bgcolor: 'grey.100',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    mb: 1
                                }}>
                                    {f.icon}
                                </Box>
                                <Typography variant="h6" fontWeight={700} textAlign="center" sx={{ color: 'text.primary' }}>
                                    {f.title}
                                </Typography>
                                <Typography color="text.secondary" textAlign="center" sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                                    {f.desc}
                                </Typography>
                            </Stack>
                        </Paper>
                    ))}
                </Box>
            </Container>

            {/* Best Rated Products */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
                <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800}>Best Rated Products</Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                        Discover our top-rated products loved by our customers
                    </Typography>
                </Stack>
                
                {loading ? (
                    <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 2 }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Box key={i} sx={{ minWidth: 220, height: 300, bgcolor: 'grey.200', borderRadius: 2, animation: 'pulse 1.5s ease-in-out infinite' }} />
                        ))}
                    </Stack>
                ) : error ? (
                    <Typography color="error" textAlign="center">Failed to load products</Typography>
                ) : topRatedProducts.length > 0 ? (
                    <Stack direction="row" spacing={3} sx={{ overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 4 } }}>
                        {topRatedProducts.map((product) => (
                            <Card key={product.id} sx={{ minWidth: 220, borderRadius: 3, boxShadow: 3, flexShrink: 0 }}>
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={getPrimaryImageUrl(product)}
                                    alt={product.name}
                                    sx={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&q=60';
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                                        {product.name}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 1 }}>
                                        <Typography variant="body2" color="warning.main">
                                            ★ {product.rating}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ({product.reviews || 0} reviews)
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h6" color="primary.main">
                                        ₹{product.price}
                                    </Typography>
                                    <Button 
                                        component={RouterLink} 
                                        to={`/pdp/${product.id}`}
                                        variant="contained" 
                                        color="primary" 
                                        fullWidth 
                                        sx={{ mt: 1 }}
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                ) : (
                    <Typography textAlign="center" color="text.secondary">
                        No rated products available yet
                    </Typography>
                )}
            </Container>

            {/* Stats */}
            <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 8 } }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        {[
                            { k: 'Plants Identified', v: '10,000+' },
                            { k: 'Happy Users', v: '5,000+' },
                            { k: 'Verified Products', v: '500+' },
                            { k: 'Accuracy Rate', v: '95%' },
                        ].map((stat) => (
                            <Grid key={stat.k} item xs={6} md={3}>
                                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                                    <Typography variant="h4" fontWeight={800}>{stat.v}</Typography>
                                    <Typography color="text.secondary">{stat.k}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Footer */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" fontWeight={800}>GreenCart</Typography>
                            <Typography color="text.secondary" sx={{ mt: 1 }}>
                                Your smart agriculture and herbal health platform. Grow smart, live green.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle1" fontWeight={700}>Quick Links</Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                <Button component={RouterLink} to="/about" size="small">About</Button>
                                <Button component={RouterLink} to="/contact" size="small">Contact</Button>
                                <Button component={RouterLink} to="/products" size="small">Products</Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle1" fontWeight={700}>Contact</Typography>
                            <Typography color="text.secondary" sx={{ mt: 1 }}>info@greencart.com</Typography>
                            <Typography color="text.secondary">+91 98765 43210</Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">© 2024 GreenCart. All rights reserved.</Typography>
                </Paper>
            </Container>
        </Box>
    );
}