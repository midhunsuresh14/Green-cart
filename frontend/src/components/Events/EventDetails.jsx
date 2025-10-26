import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, CardMedia, Button, Alert, Stack, CircularProgress, TextField } from '@mui/material';
import { eventsApi } from '../../lib/eventsApi';
import { loadRazorpay, createRazorpayOrder } from '../../lib/payment';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [tickets, setTickets] = useState(1);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

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

  const handleBookEvent = async () => {
    // Validate form
    if (!attendeeName || !attendeeEmail || !attendeePhone) {
      setBookingError('Please fill in all required fields');
      return;
    }

    if (tickets <= 0) {
      setBookingError('Please select at least 1 ticket');
      return;
    }

    // Check if event data is available
    if (!event) {
      setBookingError('Event data not loaded. Please try again.');
      return;
    }
    
    // Check if eventId is valid
    if (!eventId) {
      setBookingError('Invalid event ID. Please try again.');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);

      // Book the event first
      const bookingData = {
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_phone: attendeePhone,
        tickets: parseInt(tickets)
      };

      console.log('Booking event with ID:', eventId);
      console.log('Booking data:', bookingData);

      const bookingResponse = await eventsApi.bookEvent(eventId, bookingData);
      
      // Log the response for debugging
      console.log('Booking response:', bookingResponse);
      
      // Check if bookingResponse exists
      if (!bookingResponse) {
        throw new Error('No response received from booking server');
      }
      
      // Handle different possible response structures
      let booking;
      if (bookingResponse.booking) {
        booking = bookingResponse.booking;
      } else if (bookingResponse.data && bookingResponse.data.booking) {
        booking = bookingResponse.data.booking;
      } else {
        // If we can't find the booking in expected locations, throw an error
        throw new Error('Invalid booking response structure: ' + JSON.stringify(bookingResponse));
      }
      
      // Check if booking ID exists
      if (!booking._id) {
        throw new Error('Invalid booking response: Missing booking ID');
      }
      
      if (event.price > 0) {
        // Process payment for paid events
        await processPayment(booking._id, event.title);
      } else {
        // For free events, redirect to ticket page
        setBookingSuccess(true);
        setTimeout(() => {
          navigate(`/events/tickets/${booking._id}`);
        }, 2000);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to book event');
      console.error('Error booking event:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const processPayment = async (bookingId, eventTitle) => {
    try {
      // Load Razorpay script
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        throw new Error('Failed to load payment gateway. Please try again.');
      }

      // Create Razorpay order
      const order = await createRazorpayOrder(bookingId);
      
      // Configure payment options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'GreenCart Events',
        description: `Event Booking: ${eventTitle}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            await eventsApi.processEventPayment(bookingId, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            
            // Show success and redirect to ticket
            setBookingSuccess(true);
            setTimeout(() => {
              navigate(`/events/tickets/${bookingId}`);
            }, 2000);
          } catch (err) {
            setBookingError('Payment verification failed. Please contact support.');
            console.error('Payment verification error:', err);
          }
        },
        prefill: {
          name: attendeeName,
          email: attendeeEmail,
          contact: attendeePhone
        },
        theme: {
          color: '#16a34a'
        }
      };

      // Open payment modal
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      setBookingError(err.message || 'Payment processing failed');
      console.error('Payment error:', err);
    }
  };

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
        {bookingSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Event booked successfully! Redirecting to your ticket...
          </Alert>
        )}
        
        {bookingError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setBookingError(null)}>
            {bookingError}
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
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        Venue
                      </Typography>
                      <Typography variant="body1">
                        {event.venue}, {event.location}
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PeopleIcon color="primary" />
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        ₹{event.price.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
                
                {/* Booking Form */}
                <Card sx={{ flex: 1, p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    Book Your Tickets
                  </Typography>
                  
                  <Stack spacing={3}>
                    <TextField
                      label="Full Name"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      fullWidth
                      required
                    />
                    
                    <TextField
                      label="Email"
                      type="email"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      fullWidth
                      required
                    />
                    
                    <TextField
                      label="Phone Number"
                      type="tel"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      fullWidth
                      required
                    />
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body1">Tickets:</Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => setTickets(Math.max(1, tickets - 1))}
                      >
                        -
                      </Button>
                      <Typography variant="h6">{tickets}</Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => setTickets(tickets + 1)}
                      >
                        +
                      </Button>
                    </Stack>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      fullWidth
                      onClick={handleBookEvent}
                      disabled={bookingLoading || bookingSuccess}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(22, 163, 74, 0.35)'
                        }
                      }}
                    >
                      {bookingLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        `Book Now ₹${(event.price * tickets).toFixed(2)}`
                      )}
                    </Button>
                  </Stack>
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