import React from 'react';
import { Box, Container, Typography, Stack, Grid, Paper, Button, Divider, Card, CardContent, CardMedia, Chip } from '@mui/material';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';
import LocalPharmacyOutlined from '@mui/icons-material/LocalPharmacyOutlined';
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined';
import ArrowForwardIosRounded from '@mui/icons-material/ArrowForwardIosRounded';
import EventIcon from '@mui/icons-material/Event';
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

    // Get some products for the slideshow (take first 10)
    const slideshowProducts = React.useMemo(() => {
        if (!products || products.length === 0) return [];
        return [...products].slice(0, 10);
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

    // Format price in INR
    const formatINR = (value) => {
        if (value == null) return '';
        const num = Number(value);
        return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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

            {/* Product Slideshow */}
            <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'grey.50' }}>
                <Container maxWidth="lg">
                    <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight={800}>Featured Products</Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                            Discover our handpicked selection of premium products
                        </Typography>
                    </Stack>
                    
                    {loading ? (
                        <Stack direction="row" spacing={2} sx={{ overflowX: 'hidden', pb: 2 }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Box key={i} sx={{ minWidth: 280, height: 350, bgcolor: 'grey.200', borderRadius: 2, animation: 'pulse 1.5s ease-in-out infinite' }} />
                            ))}
                        </Stack>
                    ) : error ? (
                        <Typography color="error" textAlign="center">Failed to load products</Typography>
                    ) : slideshowProducts.length > 0 ? (
                        <>
                            <Box sx={{ 
                                position: 'relative',
                                overflow: 'hidden',
                                height: 400,
                                width: '100%',
                                maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '250px',
                                    background: 'linear-gradient(to right, rgb(250, 250, 250) 0%, rgba(250, 250, 250, 0.95) 15%, rgba(250, 250, 250, 0.7) 40%, transparent 100%)',
                                    zIndex: 2,
                                    pointerEvents: 'none'
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '250px',
                                    background: 'linear-gradient(to left, rgb(250, 250, 250) 0%, rgba(250, 250, 250, 0.95) 15%, rgba(250, 250, 250, 0.7) 40%, transparent 100%)',
                                    zIndex: 2,
                                    pointerEvents: 'none'
                                }
                            }}>
                                <Stack 
                                    direction="row" 
                                    spacing={2}
                                    sx={{ 
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: 'max-content',
                                        animation: 'slideshow 30s linear infinite',
                                        '&:hover': {
                                            animationPlayState: 'paused'
                                        },
                                        '@keyframes slideshow': {
                                            '0%': {
                                                transform: 'translateX(0)'
                                            },
                                            '100%': {
                                                transform: `translateX(-${(slideshowProducts.length * 320) - 1200}px)`
                                            }
                                        }
                                    }}
                                >
                                    {[...slideshowProducts, ...slideshowProducts].map((product, index) => (
                                        <Box
                                            key={`${product.id}-${index}`}
                                            component={RouterLink}
                                            to={`/pdp/${product.id}`}
                                            sx={{
                                                width: 300,
                                                height: 400,
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                mx: 1,
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s ease',
                                                opacity: 0.9,
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                                                    opacity: 1,
                                                    zIndex: 1,
                                                    '&::after': {
                                                        opacity: 0.1
                                                    }
                                                },
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)',
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s ease',
                                                    pointerEvents: 'none'
                                                }
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={getPrimaryImageUrl(product)}
                                                alt={product.name}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: 'block',
                                                    filter: 'brightness(1)',
                                                    transition: 'filter 0.3s ease'
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&q=60';
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                            {/* Explore All Products Button */}
                            <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
                                <Button 
                                    component={RouterLink} 
                                    to="/products"
                                    variant="contained" 
                                    color="primary" 
                                    size="large"
                                    sx={{ 
                                        py: 1.5,
                                        px: 4,
                                        fontWeight: 600,
                                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                                        '&:hover': {
                                            boxShadow: '0 6px 16px rgba(22, 163, 74, 0.35)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    Explore All Products
                                </Button>
                            </Stack>
                        </>
                    ) : (
                        <Typography textAlign="center" color="text.secondary">
                            No products available yet
                        </Typography>
                    )}
                </Container>
            </Box>

            {/* Explore Events Section */}
            <Box sx={{ py: 8, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Stack spacing={4} alignItems="center" textAlign="center">
                        <Chip 
                            icon={<EventIcon />} 
                            label="Events" 
                            color="primary" 
                            variant="outlined" 
                            sx={{ 
                                height: 32,
                                '& .MuiChip-icon': {
                                    color: 'primary.main'
                                }
                            }} 
                        />
                        <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
                            Explore Our Events
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
                            Join our exciting events and workshops to learn more about sustainable agriculture and herbal wellness
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="large"
                            sx={{ 
                                py: 1.5,
                                px: 4,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(22, 163, 74, 0.35)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                            onClick={() => navigate('/events')}
                        >
                            View All Events
                        </Button>
                    </Stack>
                </Container>
            </Box>

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
