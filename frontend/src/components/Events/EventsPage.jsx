import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Stack, CircularProgress, Alert, Dialog, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import { eventsApi } from '../../lib/eventsApi';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';

const EventsPage = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [tickets, setTickets] = useState(1);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFullDate = (dateString) => {
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

  const handleOpenInMap = (event, e) => {
    e.stopPropagation();
    const location = `${event.venue}, ${event.location}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
    // Pre-fill form with user data if logged in
    if (user) {
      setAttendeeName(user.name || '');
      setAttendeeEmail(user.email || '');
      setAttendeePhone(user.phone || '');
    }
    setTickets(1);
    setRegisterError(null);
    setRegisterSuccess(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setRegisterError(null);
    setRegisterSuccess(false);
    setRegistering(false);
  };

  const handleRegisterEvent = async () => {
    // Check if user is logged in first
    if (!user) {
      setRegisterError('Please login to register for events');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    // Validate form
    if (!attendeeName || !attendeeEmail || !attendeePhone) {
      setRegisterError('Please fill in all required fields');
      return;
    }

    if (tickets <= 0) {
      setRegisterError('Please select at least 1 ticket');
      return;
    }

    try {
      setRegistering(true);
      setRegisterError(null);

      const registrationData = {
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_phone: attendeePhone,
        tickets: parseInt(tickets)
      };

      await eventsApi.registerEvent(selectedEvent._id, registrationData);
      
      setRegisterSuccess(true);
      setTimeout(() => {
        handleCloseDialog();
        navigate('/events/confirmation');
      }, 2000);
    } catch (err) {
      setRegisterError(err.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
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
          <Grid container spacing={3}>
            {upcomingEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                    },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleViewEvent(event)}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={event.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'}
                    alt={event.title}
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      sx={{ 
                        mb: 1.5,
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.6rem'
                      }}
                    >
                      {event.title}
                    </Typography>
                    
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnIcon fontSize="small" color="primary" sx={{ fontSize: '1.1rem' }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.85rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {event.venue}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EventIcon fontSize="small" color="primary" sx={{ fontSize: '1.1rem' }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: '0.85rem' }}
                        >
                          {formatDate(event.date)}
                        </Typography>
                      </Stack>
                    </Stack>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      fullWidth
                      sx={{ 
                        mt: 2,
                        py: 1,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEvent(event);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Event Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedEvent.title}
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDialog}
                  sx={{
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {/* Event Image */}
              <Box
                component="img"
                src={selectedEvent.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'}
                alt={selectedEvent.title}
                sx={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';
                }}
              />
              
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Description */}
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      About This Event
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedEvent.description}
                    </Typography>
                  </Box>

                  {/* Event Details */}
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Event Details
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <EventIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Date & Time
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatFullDate(selectedEvent.date)}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Stack direction="row" spacing={2} alignItems="center">
                        <LocationOnIcon color="primary" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Venue
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedEvent.venue}, {selectedEvent.location}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<MapIcon />}
                          onClick={(e) => handleOpenInMap(selectedEvent, e)}
                        >
                          Open Map
                        </Button>
                      </Stack>
                      
                      <Stack direction="row" spacing={2} alignItems="center">
                        <PeopleIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Event Type
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color="primary.main">
                            Free Event
                          </Typography>
                        </Box>
                      </Stack>
                      
                      {selectedEvent.max_attendees && (
                        <Stack direction="row" spacing={2} alignItems="center">
                          <PeopleIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Availability
                            </Typography>
                            <Typography 
                              variant="body1" 
                              fontWeight={600}
                              color={selectedEvent.is_full ? 'error.main' : 'success.main'}
                            >
                              {selectedEvent.is_full 
                                ? 'Fully Occupied' 
                                : `${selectedEvent.available_slots || 0} slot(s) available`
                              }
                            </Typography>
                          </Box>
                        </Stack>
                      )}
                    </Stack>
                  </Box>

                  {/* Registration Messages */}
                  {registerSuccess && (
                    <Alert severity="success">
                      Successfully registered for the event! Redirecting to confirmation...
                    </Alert>
                  )}

                  {registerError && (
                    <Alert severity="error" onClose={() => setRegisterError(null)}>
                      {registerError}
                    </Alert>
                  )}

                  {/* Registration Form */}
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {selectedEvent.is_full ? 'Event Fully Occupied' : 'Register for Event'}
                    </Typography>
                    
                    {!user ? (
                      <Alert severity="info">
                        <Stack spacing={2}>
                          <Typography variant="body1" fontWeight={600}>
                            Login Required
                          </Typography>
                          <Typography variant="body2">
                            You need to be logged in to register for this event.
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<LoginIcon />}
                            onClick={() => navigate('/login')}
                            sx={{ alignSelf: 'flex-start' }}
                          >
                            Login to Register
                          </Button>
                        </Stack>
                      </Alert>
                    ) : selectedEvent.is_full ? (
                      <Alert severity="warning">
                        <Typography variant="body1" fontWeight={600}>
                          This event has reached its maximum capacity.
                        </Typography>
                        <Typography variant="body2">
                          Unfortunately, no more registrations are being accepted at this time.
                        </Typography>
                      </Alert>
                    ) : (
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField
                          label="Full Name"
                          value={attendeeName}
                          onChange={(e) => setAttendeeName(e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />
                        
                        <TextField
                          label="Email"
                          type="email"
                          value={attendeeEmail}
                          onChange={(e) => setAttendeeEmail(e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />
                        
                        <TextField
                          label="Phone Number"
                          type="tel"
                          value={attendeePhone}
                          onChange={(e) => setAttendeePhone(e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body1">Number of Tickets:</Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setTickets(Math.max(1, tickets - 1))}
                          >
                            -
                          </Button>
                          <Typography variant="h6" sx={{ minWidth: '30px', textAlign: 'center' }}>
                            {tickets}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              const maxAllowed = selectedEvent.available_slots || 100;
                              setTickets(Math.min(maxAllowed, tickets + 1));
                            }}
                            disabled={selectedEvent.available_slots && tickets >= selectedEvent.available_slots}
                          >
                            +
                          </Button>
                        </Stack>
                        
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="large"
                          fullWidth
                          onClick={handleRegisterEvent}
                          disabled={registering || registerSuccess}
                          sx={{ 
                            py: 1.5,
                            fontWeight: 600,
                            mt: 2
                          }}
                        >
                          {registering ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Register Now'
                          )}
                        </Button>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EventsPage;