import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Button, Alert, Stack, CircularProgress } from '@mui/material';
import { eventsApi } from '../../lib/eventsApi';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const EventConfirmation = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegistration();
  }, [registrationId]);

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getRegistration(registrationId);
      setRegistration(data.registration);
      setEvent(data.event);
    } catch (err) {
      setError('Failed to load registration details');
      console.error('Error fetching registration:', err);
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

  if (!registration || !event) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="warning">Registration details not found</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Stack spacing={4} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
              
              <Stack spacing={2}>
                <Typography variant="h4" fontWeight={800}>
                  Registration Confirmed!
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Thank you for registering for {event.title}
                </Typography>
              </Stack>
              
              <Card sx={{ width: '100%', p: 3, bgcolor: 'grey.50' }}>
                <Stack spacing={3}>
                  <Typography variant="h6" fontWeight={700}>
                    Event Details
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <EventIcon color="primary" />
                      <Stack alignItems="flex-start">
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
                      <Stack alignItems="flex-start">
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
                      <Stack alignItems="flex-start">
                        <Typography variant="body2" color="text.secondary">
                          Registration ID
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {registration._id}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
              
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/events')}
                >
                  View All Events
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default EventConfirmation;