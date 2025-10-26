import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Button, Alert, Stack } from '@mui/material';
import { eventsApi } from '../../lib/eventsApi';
import { QRCodeCanvas } from 'qrcode.react';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DownloadIcon from '@mui/icons-material/Download';

const EventTicket = () => {
  const { ticketId } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getTicket(ticketId);
      setTicketData(data);
    } catch (err) {
      setError('Failed to load ticket');
      console.error('Error fetching ticket:', err);
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

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll just show an alert
    alert('In a real implementation, this would download a PDF ticket');
  };

  if (loading) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="sm">
          <Box sx={{ height: 300, bgcolor: 'grey.200', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="sm">
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  if (!ticketData) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="sm">
          <Alert severity="warning">Ticket not found</Alert>
        </Container>
      </Box>
    );
  }

  const { ticket, event, user } = ticketData;

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <Typography variant="h4" textAlign="center" sx={{ mb: 4 }}>
          Your Event Ticket
        </Typography>
        
        <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Event Info */}
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Typography variant="h5" fontWeight={700}>
                  {event.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {event.description}
                </Typography>
              </Stack>
              
              {/* Ticket Details */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* QR Code */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <QRCodeCanvas 
                    value={ticket.ticket_code} 
                    size={180} 
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                </Box>
                
                {/* Ticket Info */}
                <Stack spacing={2} sx={{ flex: 1 }}>
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
                        {event.venue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AccountCircleIcon color="primary" />
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        Attendee
                      </Typography>
                      <Typography variant="body1">
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              
              {/* Ticket Code */}
              <Stack spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Ticket Code
                </Typography>
                <Typography variant="h4" fontWeight={700} letterSpacing={2}>
                  {ticket.ticket_code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Show this code at the entrance
                </Typography>
              </Stack>
              
              {/* Download Button */}
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                fullWidth
              >
                Download Ticket
              </Button>
            </Stack>
          </CardContent>
        </Card>
        
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
          This ticket is non-transferable and must be presented at the event entrance
        </Typography>
      </Container>
    </Box>
  );
};

export default EventTicket;