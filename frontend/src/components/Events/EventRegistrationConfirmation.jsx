import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Button, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const EventRegistrationConfirmation = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
              
              <Stack spacing={2}>
                <Typography variant="h4" fontWeight={800}>
                  Registration Confirmed!
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Thank you for registering for this event
                </Typography>
              </Stack>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                You will receive a confirmation email with event details shortly.
              </Typography>
              
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

export default EventRegistrationConfirmation;