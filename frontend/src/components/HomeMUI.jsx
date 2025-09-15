import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from '@mui/material';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';
import LocalPharmacyOutlined from '@mui/icons-material/LocalPharmacyOutlined';
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined';
import ArrowForwardIosRounded from '@mui/icons-material/ArrowForwardIosRounded';
import { Link as RouterLink } from 'react-router-dom';

export default function HomeMUI() {
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
        <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={800}>Why Choose GreenCart?</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
            Powerful tools to help you grow smarter and live greener.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {[{
            icon: <CameraAltOutlined color="success" />,
            title: 'AI Plant Identification',
            desc: 'Upload a photo and instantly identify plants with details on medicinal properties and care.'
          }, {
            icon: <WbSunnyOutlined color="warning" />,
            title: 'Weather‑Based Suggestions',
            desc: 'Personalized crop recommendations using your location’s weather patterns.'
          }, {
            icon: <LocalPharmacyOutlined color="error" />,
            title: 'Herbal Remedies',
            desc: 'Discover natural treatments for common ailments with verified benefits.'
          }, {
            icon: <ShoppingBasketOutlined color="primary" />,
            title: 'Verified Products',
            desc: 'Shop curated organic plants and herbal products, verified for quality.'
          }].map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Stack spacing={1.5} alignItems="flex-start">
                  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'grey.100' }}>{f.icon}</Box>
                  <Typography variant="h6" fontWeight={700}>{f.title}</Typography>
                  <Typography color="text.secondary">{f.desc}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works */}
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={800}>How GreenCart Works</Typography>
        </Stack>
        <Grid container spacing={3}>
          {[{
            n: 1,
            title: 'Upload & Identify',
            desc: 'Take a photo of any plant and upload it to our AI for instant identification.',
            img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80'
          }, {
            n: 2,
            title: 'Get Recommendations',
            desc: 'Receive suggestions for crops, remedies, and care based on your needs.',
            img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'
          }, {
            n: 3,
            title: 'Shop & Grow',
            desc: 'Purchase verified plants and products to start your green journey.',
            img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80'
          }].map((s) => (
            <Grid key={s.n} item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardMedia component="img" height="160" image={s.img} alt={s.title} />
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="overline" color="text.secondary">Step {s.n}</Typography>
                    <Typography variant="h6" fontWeight={700}>{s.title}</Typography>
                    <Typography color="text.secondary">{s.desc}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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