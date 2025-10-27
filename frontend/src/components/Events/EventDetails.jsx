import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, CardMedia, Button, Alert, Stack, CircularProgress, TextField, IconButton } from '@mui/material';
import { eventsApi } from '../../lib/eventsApi';
import { loadRazorpay, createRazorpayOrder } from '../../lib/payment';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import LoginIcon from '@mui/icons-material/Login';

const EventDetails = ({ user }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [tickets, setTickets] = useState(1);

  useEffect(() => {
    fetchEvent();
    // Pre-fill form with user data if logged in
    if (user) {
      setAttendeeName(user.name || '');
      setAttendeeEmail(user.email || '');
      setAttendeePhone(user.phone || '');
    }
  }, [eventId, user]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getEvents();
      const eventDetails = data.find(e => e._id === eventId);
      if (eventDetails) {
        setEvent(eventDetails);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      setError('Failed to load event details');
      console.error('Error fetching event:', err);
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

  const handleOpenInMap = () => {
    // Construct location string
    const location = `${event.venue}, ${event.location}`;
    // Google Maps URL - works on all platforms
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    // Open in new tab
    window.open(mapsUrl, '_blank');
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

    // Check if event data is available
    if (!event) {
      setRegisterError('Event data not loaded. Please try again.');
      return;
    }
    
    // Check if eventId is valid
    if (!eventId) {
      setRegisterError('Invalid event ID. Please try again.');
      return;
    }

    try {
      setRegistering(true);
      setRegisterError(null);

      // Register for the event
      const registrationData = {
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_phone: attendeePhone,
        tickets: parseInt(tickets)
      };

      console.log('Registering for event with ID:', eventId);
      console.log('Registration data:', registrationData);

      const registrationResponse = await eventsApi.registerEvent(eventId, registrationData);
      
      // Log the response for debugging
      console.log('Registration response:', registrationResponse);
      
      // Check if registrationResponse exists
      if (!registrationResponse) {
        throw new Error('No response received from registration server');
      }
      
      // The backend returns the registration object directly
      // No need to unwrap it from a 'registration' property
      
      // Show success and redirect to confirmation
      setRegisterSuccess(true);
      setTimeout(() => {
        navigate(`/events/confirmation`);
      }, 2000);
    } catch (err) {
      setRegisterError(err.message || 'Failed to register for event');
      console.error('Error registering for event:', err);
    } finally {
      setRegistering(false);
    }
  };

  // This function is deprecated as we're using registration instead of payment
  const processPayment = async (bookingId, eventTitle) => {
    // For backward compatibility, we'll just show a success message
    setRegisterSuccess(true);
    setTimeout(() => {
      navigate(`/events/confirmation`);
    }, 2000);
  }

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="warning">Event not found</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        {registerSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Successfully registered for the event! Redirecting to confirmation...
          </Alert>
        )}

        {registerError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setRegisterError(null)}>
            {registerError}
          </Alert>
        )}
        
        <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardMedia
            component="img"
            height="300"
            image={event.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'}
            alt={event.title}
            sx={{ objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';
            }}
          />
          
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Event Info */}
              <Stack spacing={2}>
                <Typography variant="h4" fontWeight={800}>
                  {event.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {event.description}
                </Typography>
              </Stack>
              
              {/* Event Details */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                <Stack spacing={3} sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <EventIcon color="primary" />
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(event.date)}
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  <Stack direction="row" spacing={2} alignItems="center">
                    <LocationOnIcon color="primary" />
                    <Stack sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Venue
                      </Typography>
                      <Typography variant="body1">
                        {event.venue}, {event.location}
                      </Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MapIcon />}
                      onClick={handleOpenInMap}
                      sx={{
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      Open in Map
                    </Button>
                  </Stack>
                  
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PeopleIcon color="primary" />
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        Event Type
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        Free Event
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  {event.max_attendees && (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PeopleIcon color="primary" />
                      <Stack>
                        <Typography variant="body2" color="text.secondary">
                          Availability
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight={600}
                          color={event.is_full ? 'error.main' : 'success.main'}
                        >
                          {event.is_full 
                            ? 'Fully Occupied' 
                            : `${event.available_slots || 0} slot(s) available`
                          }
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
                
                {/* Booking Form */}
                <Card sx={{ flex: 1, p: 3, bgcolor: event.is_full ? 'grey.100' : 'grey.50' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    {event.is_full ? 'Event Fully Occupied' : 'Register for Event'}
                  </Typography>
                  
                  {!user ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
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
                  ) : event.is_full ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight={600}>
                        This event has reached its maximum capacity.
                      </Typography>
                      <Typography variant="body2">
                        Unfortunately, no more registrations are being accepted at this time.
                      </Typography>
                    </Alert>
                  ) : (
                    <Stack spacing={3}>
                    <TextField
                      label="Full Name"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      fullWidth
                      required
                      disabled={!user}
                    />
                    
                    <TextField
                      label="Email"
                      type="email"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      fullWidth
                      required
                      disabled={!user}
                    />
                    
                    <TextField
                      label="Phone Number"
                      type="tel"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      fullWidth
                      required
                      disabled={!user}
                    />
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body1">Tickets:</Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => setTickets(Math.max(1, tickets - 1))}
                        disabled={event.is_full || !user}
                      >
                        -
                      </Button>
                      <Typography variant="h6">{tickets}</Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                          const maxAllowed = event.available_slots || 100;
                          setTickets(Math.min(maxAllowed, tickets + 1));
                        }}
                        disabled={event.is_full || !user || (event.available_slots && tickets >= event.available_slots)}
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
                      disabled={registering || registerSuccess || event.is_full || !user}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: (event.is_full || !user) ? 'none' : '0 4px 12px rgba(22, 163, 74, 0.25)',
                        '&:hover': {
                          boxShadow: (event.is_full || !user) ? 'none' : '0 6px 16px rgba(22, 163, 74, 0.35)'
                        }
                      }}
                    >
                      {registering ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : !user ? (
                        'Login Required'
                      ) : event.is_full ? (
                        'Event Fully Occupied'
                      ) : (
                        `Register Now`
                      )}
                    </Button>
                  </Stack>
                  )}
                </Card>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default EventDetails;