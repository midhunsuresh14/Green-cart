import React from 'react';
import { Box, Container, Typography, Grid, Paper, Stack, Card, CardContent, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { aboutData } from './AboutData';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.2 } },
};

export default function About() {
  const { hero, mission, values, stats, team } = aboutData;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 10 },
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(129, 199, 132, 0.05) 100%)',
          borderRadius: { xs: 0, md: 4 },
          mx: { xs: 0, md: 2 },
          mb: 8,
          border: '1px solid',
          borderColor: 'rgba(76, 175, 80, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <Stack spacing={4} alignItems="center" textAlign="center">
              <motion.div variants={fadeUp}>
                <Typography variant="h2" fontWeight={900} sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  {hero.title}
                </Typography>
                <Box sx={{ width: 80, height: 4, bgcolor: 'primary.main', mx: 'auto', borderRadius: 2 }} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 850, lineHeight: 1.6, fontWeight: 400 }}>
                  {hero.subtitle}
                </Typography>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" gap={2}>
                  {hero.chips.map((chip, i) => (
                    <Chip key={i} label={chip.label} color={chip.color} sx={{ fontWeight: 700, px: 1, height: 40, borderRadius: 2 }} />
                  ))}
                </Stack>
              </motion.div>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Mission Section */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <Box sx={{ mb: 12 }}>
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div variants={fadeUp}>
                  <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 2 }}>
                    Purpose Driven
                  </Typography>
                  <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 1, mb: 3 }}>
                    {mission.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
                    {mission.p1}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                    {mission.p2}
                  </Typography>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div variants={fadeUp}>
                  <Box
                    sx={{
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        right: -20,
                        bottom: -20,
                        border: '2px solid',
                        borderColor: 'primary.light',
                        borderRadius: 4,
                        zIndex: -1
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={mission.image}
                      alt="Our Mission"
                      sx={{
                        width: '100%',
                        height: { xs: 300, md: 400 },
                        objectFit: 'cover',
                        borderRadius: 4,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                      }}
                    />
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Values Section */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <Box sx={{ mb: 12 }}>
            <motion.div variants={fadeUp}>
              <Typography variant="h3" fontWeight={900} textAlign="center" gutterBottom sx={{ color: 'grey.900', mb: 2 }}>
                Our Core Values
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 8, maxWidth: 650, mx: 'auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Integrity, innovation, and impact are at the heart of GreenCart.
              </Typography>
            </motion.div>

            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
              {values.map((value, index) => (
                <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -12, scale: 1.02 }}
                    style={{ width: '100%', display: 'flex' }}
                  >
                    <Card sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 5,
                      border: '1px solid',
                      borderColor: 'rgba(76, 175, 80, 0.1)',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        boxShadow: '0 30px 60px rgba(76, 175, 80, 0.15)',
                        borderColor: 'primary.light',
                        background: '#fff'
                      }
                    }}>
                      <CardContent sx={{ p: 4, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{
                          mb: 4,
                          fontSize: 44,
                          width: 84,
                          height: 84,
                          bgcolor: 'success.50',
                          color: 'success.main',
                          borderRadius: '24px',
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: '0 8px 20px rgba(76, 175, 80, 0.12)'
                        }}>
                          {value.icon}
                        </Box>
                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: 'grey.900', mb: 1.5 }}>
                          {value.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
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
          <Box sx={{
            mb: 12,
            py: { xs: 6, md: 10 },
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
            borderRadius: { xs: 4, md: 10 },
            color: 'white',
            boxShadow: '0 30px 70px rgba(27, 94, 32, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '60%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              zIndex: 0
            }} />
            <Grid container spacing={4} justifyContent="center" textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <motion.div variants={fadeUp}>
                    <Typography variant="h2" fontWeight={900} sx={{ mb: 1, fontSize: { xs: '2.5rem', md: '4.5rem' }, letterSpacing: -1 }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontSize: '0.85rem' }}>
                      {stat.label}
                    </Typography>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Team Section */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <Box sx={{ mb: 12 }}>
            <motion.div variants={fadeUp}>
              <Typography variant="h3" fontWeight={900} textAlign="center" gutterBottom sx={{ color: 'grey.900' }}>
                The Green Team
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 8, maxWidth: 650, mx: 'auto', fontSize: '1.1rem' }}>
                Meet the visionaries making sustainable agriculture a reality for everyone.
              </Typography>
            </motion.div>
            <Grid container spacing={6} justifyContent="center">
              {team.map((member, index) => (
                <Grid item xs={12} sm={8} md={5} lg={4} key={index}>
                  <motion.div variants={fadeUp} whileHover={{ y: -10 }}>
                    <Card sx={{
                      textAlign: 'center',
                      p: { xs: 5, md: 7 },
                      height: '100%',
                      borderRadius: 10,
                      border: '1px solid',
                      borderColor: 'grey.100',
                      background: '#fff',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        boxShadow: '0 50px 100px rgba(0,0,0,0.08)',
                        borderColor: 'success.light'
                      }
                    }}>
                      <Avatar
                        src={member.avatar}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          mb: 3,
                          border: '4px solid',
                          borderColor: 'primary.light',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Typography variant="h5" fontWeight={800} gutterBottom>
                        {member.name}
                      </Typography>
                      <Typography variant="subtitle1" color="primary.main" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1.5 }}>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
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
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
              color: 'white',
              borderRadius: 6,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight={900} gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '3rem' } }}>
                Ready to Start Your Green Journey?
              </Typography>
              <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, fontWeight: 400, maxWidth: 700, mx: 'auto' }}>
                Join thousands of plant enthusiasts who trust GreenCart for their sustainable gardening needs.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                <Box
                  component="a"
                  href="/products"
                  sx={{
                    px: 6,
                    py: 2,
                    bgcolor: 'white',
                    color: '#1b5e20',
                    borderRadius: 3,
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'grey.100', transform: 'scale(1.05)' }
                  }}
                >
                  Explore Catalog
                </Box>
                <Box
                  component="a"
                  href="/remedies"
                  sx={{
                    px: 6,
                    py: 2,
                    border: '2px solid white',
                    color: 'white',
                    borderRadius: 3,
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', transform: 'scale(1.05)' }
                  }}
                >
                  Discover Remedies
                </Box>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

































