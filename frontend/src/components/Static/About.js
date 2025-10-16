import React from 'react';
import { Box, Container, Typography, Grid, Paper, Stack, Card, CardContent, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.2 } },
};

export default function About() {
  const values = [
    {
      icon: '🌱',
      title: 'Sustainability',
      description: 'We promote eco-friendly practices and sustainable gardening solutions for a greener future.'
    },
    {
      icon: '🧠',
      title: 'AI Innovation',
      description: 'Cutting-edge AI technology helps identify plants and provides personalized care recommendations.'
    },
    {
      icon: '✅',
      title: 'Quality Assurance',
      description: 'Every product is carefully curated and verified to ensure the highest quality for our customers.'
    },
    {
      icon: '👥',
      title: 'Community',
      description: 'Building a community of plant enthusiasts who share knowledge and grow together.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Happy Customers' },
    { number: '10,000+', label: 'Plants Identified' },
    { number: '500+', label: 'Verified Products' },
    { number: '95%', label: 'Success Rate' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Botanist with 15+ years experience in plant research and sustainable agriculture.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Head of AI Research',
      bio: 'AI specialist focused on computer vision and machine learning for botanical applications.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Head of Product',
      bio: 'Product expert ensuring quality and sustainability in every item we offer.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          py: 8,
          backgroundImage: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
          borderRadius: 2,
          mx: 2,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <motion.div variants={fadeUp}>
                <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: 32, md: 48 } }}>
                  About GreenCart
                </Typography>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800 }}>
                  Revolutionizing plant care with AI-powered identification, expert guidance, 
                  and a curated marketplace for sustainable gardening.
                </Typography>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                  <Chip label="🌱 Eco-Friendly" color="success" size="large" />
                  <Chip label="🧠 AI-Powered" color="primary" size="large" />
                  <Chip label="❤️ Community-Driven" color="secondary" size="large" />
                </Stack>
              </motion.div>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Mission Section */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <Box sx={{ mb: 8 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div variants={fadeUp}>
                  <Typography variant="h3" fontWeight={700} gutterBottom>
                    Our Mission
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: 18, lineHeight: 1.7, mb: 3 }}>
                    At GreenCart, we believe that everyone deserves access to the healing power of nature. 
                    Our mission is to make plant identification, care, and acquisition simple, accessible, 
                    and sustainable for gardeners of all levels.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: 18, lineHeight: 1.7 }}>
                    Through cutting-edge AI technology and expert curation, we're building a platform 
                    that connects people with plants, fostering healthier lifestyles and a greener planet.
                  </Typography>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div variants={fadeUp}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop"
                    alt="Our Mission"
                    sx={{
                      width: '100%',
                      height: 300,
                      objectFit: 'cover',
                      borderRadius: 3,
                      boxShadow: 3
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Values Section */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <Box sx={{ mb: 8 }}>
            <motion.div variants={fadeUp}>
              <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
                Our Values
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                These core values guide everything we do at GreenCart
              </Typography>
            </motion.div>
            <Grid container spacing={3}>
              {values.map((value, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div variants={fadeUp}>
                    <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                      <CardContent>
                        <Box sx={{ mb: 2, fontSize: 40 }}>{value.icon}</Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {value.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {value.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Stats Section */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <Box sx={{ mb: 8, py: 6, bgcolor: 'grey.50', borderRadius: 3 }}>
            <motion.div variants={fadeUp}>
              <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
                Our Impact
              </Typography>
            </motion.div>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <motion.div variants={fadeUp}>
                    <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                      <Typography variant="h3" fontWeight={800} color="primary.main">
                        {stat.number}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Team Section */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <Box sx={{ mb: 8 }}>
            <motion.div variants={fadeUp}>
              <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
                Meet Our Team
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                Passionate experts dedicated to bringing you the best plant care experience
              </Typography>
            </motion.div>
            <Grid container spacing={4}>
              {team.map((member, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div variants={fadeUp}>
                    <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                      <Avatar
                        src={member.avatar}
                        sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                      />
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {member.name}
                      </Typography>
                      <Typography variant="subtitle1" color="primary.main" gutterBottom>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.bio}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Call to Action */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              bgcolor: 'primary.main', 
              color: 'white',
              borderRadius: 3
            }}
          >
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Ready to Start Your Green Journey?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Join thousands of plant enthusiasts who trust GreenCart for their gardening needs.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Box
                component="a"
                href="/products"
                sx={{
                  display: 'inline-block',
                  px: 4,
                  py: 1.5,
                  bgcolor: 'white',
                  color: 'primary.main',
                  borderRadius: 2,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Explore Products
              </Box>
              <Box
                component="a"
                href="/remedies"
                sx={{
                  display: 'inline-block',
                  px: 4,
                  py: 1.5,
                  border: '2px solid white',
                  color: 'white',
                  borderRadius: 2,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Discover Remedies
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

































