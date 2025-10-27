import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Stack, CircularProgress, Alert } from '@mui/material';
import { eventsApi } from '../../lib/eventsApi';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

const EventsPage = () => {
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
      const data = await eventsApi.getEvents();
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

  // Filter out past events
  const isEventInFuture = (eventDate) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    return eventDateObj >= now;
  };

  const upcomingEvents = events.filter(event => isEventInFuture(event.date));

  if (loading) {
    return (
      <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Stack spacing={4} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
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
            Our Events
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
            Join our exciting events and workshops to learn more about sustainable agriculture and herbal wellness
          </Typography>
        </Stack>

        {upcomingEvents.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 12,
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
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Check back soon for exciting events and workshops!
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {upcomingEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      borderColor: 'primary.main'
                    },
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={event.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'}
                    alt={event.title}
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.01)'
                      }
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600} 
                      sx={{ 
                        mb: 0.5,
                        lineHeight: 1.2,
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
                        mb: 1, 
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {event.description}
                    </Typography>
                    
                    <Stack spacing={1} sx={{ mb: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EventIcon fontSize="small" color="primary" sx={{ fontSize: '1rem' }} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary'
                          }}
                        >
                          {formatDate(event.date)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LocationOnIcon fontSize="small" color="primary" sx={{ fontSize: '1rem' }} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary'
                          }}
                        >
                          {event.venue}
                        </Typography>
                      </Stack>
                    </Stack>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      fullWidth
                      disabled={event.is_full}
                      sx={{ 
                        mt: 'auto',
                        py: 0.8,
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        boxShadow: event.is_full ? 'none' : '0 2px 4px rgba(22, 163, 74, 0.2)',
                        bgcolor: event.is_full ? 'grey.400' : 'primary.main',
                        '&:hover': {
                          boxShadow: event.is_full ? 'none' : '0 3px 6px rgba(22, 163, 74, 0.3)',
                          transform: event.is_full ? 'none' : 'translateY(-1px)',
                          bgcolor: event.is_full ? 'grey.500' : 'primary.dark',
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'grey.400',
                          color: 'white'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!event.is_full) {
                          navigate(`/events/${event._id}`);
                        }
                      }}
                    >
                      {event.is_full ? 'FULLY OCCUPIED' : 'REGISTER'}
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

export default EventsPage;