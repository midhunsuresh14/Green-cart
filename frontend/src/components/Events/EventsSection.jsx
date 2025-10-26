import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Stack, Skeleton } from '@mui/material';
import { eventsApi } from '../../lib/eventsApi';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events from API...');
      const data = await eventsApi.getEvents();
      console.log('Fetched events:', data); // Debug log
      setEvents(data);
    } catch (err) {
      setError('Failed to load events: ' + err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `₹${price.toFixed(2)}`;
  };

  // Filter out past events (this is already handled by the backend, but we'll add a client-side check too)
  const isEventInFuture = (eventDate) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    return eventDateObj >= now;
  };

  const upcomingEvents = events.filter(event => isEventInFuture(event.date));

  if (loading) {
    return (
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <Chip icon={<EventIcon />} label="Events" color="primary" variant="outlined" />
            <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
              Upcoming Events
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
              Join our exciting events and workshops to learn more about sustainable agriculture and herbal wellness
            </Typography>
          </Stack>
          <Grid container spacing={4}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={6} lg={4} key={i}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}
                >
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Skeleton width="80%" height={30} sx={{ mb: 1 }} />
                    <Skeleton width="100%" height={20} sx={{ mb: 1 }} />
                    <Skeleton width="100%" height={20} sx={{ mb: 2 }} />
                    
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Skeleton width="60%" height={20} />
                      <Skeleton width="70%" height={20} />
                      <Skeleton width="50%" height={20} />
                    </Stack>
                    
                    <Skeleton width="100%" height={40} sx={{ mt: 'auto' }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <Chip icon={<EventIcon />} label="Events" color="primary" variant="outlined" />
            <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
              Upcoming Events
            </Typography>
          </Stack>
          <Typography textAlign="center" color="error">
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }} id="events">
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
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
            Upcoming Events
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
            Join our exciting events and workshops to learn more about sustainable agriculture and herbal wellness
          </Typography>
        </Stack>

        {upcomingEvents.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'grey.50'
            }}
          >
            <EventIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              No Upcoming Events
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Check back soon for exciting events and workshops!
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Explore Our Products
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {upcomingEvents.map((event) => (
              <Grid item xs={12} md={6} lg={4} key={event._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      borderColor: 'primary.main'
                    },
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'}
                    alt={event.title}
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      sx={{ 
                        mb: 1,
                        lineHeight: 1.3,
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {event.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2, 
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {event.description}
                    </Typography>
                    
                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EventIcon fontSize="small" color="primary" />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary'
                          }}
                        >
                          {formatDate(event.date)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnIcon fontSize="small" color="primary" />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary'
                          }}
                        >
                          {event.venue}, {event.location}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PeopleIcon fontSize="small" color="primary" />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 700,
                            color: 'primary.main',
                            fontSize: '1.1rem'
                          }}
                        >
                          ₹{event.price.toFixed(2)} per ticket
                        </Typography>
                      </Stack>
                    </Stack>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      fullWidth
                      sx={{ 
                        mt: 'auto',
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(22, 163, 74, 0.35)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event._id}`);
                      }}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default EventsSection;