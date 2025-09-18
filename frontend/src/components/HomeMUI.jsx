import React from 'react';
import { Box, Container, Typography, Stack, Grid, Paper, Button, Divider } from '@mui/material';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';
import LocalPharmacyOutlined from '@mui/icons-material/LocalPharmacyOutlined';
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined';
import ArrowForwardIosRounded from '@mui/icons-material/ArrowForwardIosRounded';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// Framer Motion variants
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

export default function HomeMUI() {
  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Hero (static, no floating elements) */}
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
          <Stack spacing={2} component={motion.div} initial="hidden" animate="show" variants={stagger}>
            <Typography
              component={motion.h1}
              variants={fadeUp}
              variant="h2"
              fontWeight={800}
              sx={{ fontSize: { xs: 32, sm: 42, md: 56 } }}
            >
              AI‑Enhanced Plant E‑Commerce
            </Typography>
            <Typography component={motion.p} variants={fadeUp} variant="h6" sx={{ color: 'grey.100', maxWidth: 800 }}>
              Discover, identify, and plan your garden with eco‑friendly guidance.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} component={motion.div} variants={fadeUp}>
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

      {/* Subtle Leaf Particle Band (below hero, no product movement) */}
      <Box sx={{ position: 'relative', height: 72, bgcolor: theme => theme.palette.background.paper, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
        {/* Optional soft gradient background */}
        <Box sx={{ position: 'absolute', inset: 0, background: theme => `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)` }} />
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
          {[...Array(10)].map((_, i) => {
            const delay = i * 1.2;
            const duration = 12 + (i % 5);
            const size = 10 + (i % 4) * 4; // 10-22px
            const startY = (i % 2 === 0) ? 8 : 28;
            return (
              <motion.div
                key={i}
                initial={{ x: '105%', y: startY, rotate: 0 }}
                animate={{ x: '-10%', rotate: [0, 8, -6, 0] }}
                transition={{ delay, duration, ease: 'linear', repeat: Infinity }}
                style={{ position: 'absolute' }}
              >
                {/* Simple leaf-like SVG path with currentColor; low-contrast green */}
                <Box component="svg" width={size} height={size} viewBox="0 0 24 24" sx={{ color: 'success.light' }}>
                  <path fill="currentColor" d="M12 2c5 4 7 8 7 11a7 7 0 1 1-14 0c0-3 2-7 7-11Z"/>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 2 }}
          component={motion.div}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          <Typography variant="h4" fontWeight={800} variants={fadeUp} component={motion.h2}>Why Choose GreenCart?</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 720 }} component={motion.p} variants={fadeUp}>
            Powerful tools to help you grow smarter and live greener.
          </Typography>
        </Stack>
        <Grid container spacing={3} component={motion.div} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
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
              <motion.div variants={fadeUp}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Stack spacing={1.5} alignItems="flex-start">
                    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'grey.100' }}>{f.icon}</Box>
                    <Typography variant="h6" fontWeight={700}>{f.title}</Typography>
                    <Typography color="text.secondary">{f.desc}</Typography>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} component={motion.div} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            {[
              { k: 'Plants Identified', v: '10,000+' },
              { k: 'Happy Users', v: '5,000+' },
              { k: 'Verified Products', v: '500+' },
              { k: 'Accuracy Rate', v: '95%' },
            ].map((stat) => (
              <Grid key={stat.k} item xs={6} md={3}>
                <motion.div variants={fadeUp}>
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h4" fontWeight={800}>{stat.v}</Typography>
                    <Typography color="text.secondary">{stat.k}</Typography>
                  </Paper>
                </motion.div>
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
