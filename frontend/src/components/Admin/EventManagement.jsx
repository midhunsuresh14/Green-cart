import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, CardMedia, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Alert, Stack, Chip, Tabs, Tab } from '@mui/material';
import { eventsApi } from '../../lib/eventsApi';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    venue: '',
    image: '',
    max_attendees: ''
  });

  useEffect(() => {
    if (activeTab === 0) {
      fetchEvents();
    } else {
      fetchRegistrations();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.adminGetEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.adminGetRegistrations();
      setRegistrations(data);
    } catch (err) {
      setError('Failed to load registrations');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        location: event.location || '',
        venue: event.venue || '',
        image: event.image || '',
        max_attendees: event.max_attendees || ''
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        venue: '',
        image: '',
        max_attendees: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
    // Reset form data when closing
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      venue: '',
      price: '',
      image: '',
      max_attendees: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.date !== '' &&
      formData.location.trim() !== '' &&
      formData.venue.trim() !== ''
    );
  };

  const isFutureDate = (dateString) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const now = new Date();
    // Add a small buffer to account for time differences
    const buffer = new Date(now.getTime() + 5 * 60000); // 5 minutes buffer
    return selectedDate > buffer;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!isFormValid()) {
        setError('Please fill in all required fields with valid values');
        return;
      }

      // Validate that the event date is in the future
      if (!isFutureDate(formData.date)) {
        setError('Event date must be at least 5 minutes in the future for it to appear on the public events page');
        return;
      }

      // Validate max_attendees if provided
      if (formData.max_attendees && (isNaN(parseInt(formData.max_attendees)) || parseInt(formData.max_attendees) < 0)) {
        setError('Please enter a valid number for max attendees');
        return;
      }

      const eventData = {
        ...formData,
        price: 0,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined
      };

      if (editingEvent) {
        // Update existing event
        await eventsApi.updateEvent(editingEvent._id, eventData);
      } else {
        // Create new event
        await eventsApi.createEvent(eventData);
      }
      handleCloseDialog();
      fetchEvents(); // Refresh events list
      setError(null); // Clear any previous errors
    } catch (err) {
      setError('Failed to save event: ' + (err.message || 'Unknown error'));
      console.error('Error saving event:', err);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsApi.deleteEvent(eventId);
        fetchEvents(); // Refresh events list
      } catch (err) {
        setError('Failed to delete event');
        console.error('Error deleting event:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading events...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Event Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Event
        </Button>
      </Stack>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Events" />
        <Tab label="Registrations" />
      </Tabs>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={event.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80'}
                  alt={event.title}
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }}>
                    {event.description}
                  </Typography>
                  
                  <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <EventIcon fontSize="small" color="primary" sx={{ fontSize: '0.9rem' }} />
                      <Typography variant="caption">
                        {formatDate(event.date)}
                      </Typography>
                    </Stack>
                    <Typography variant="caption">
                      Venue: {event.venue}, {event.location}
                    </Typography>
                    {event.max_attendees && (
                      <Typography variant="caption">
                        Max Attendees: {event.max_attendees}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Registered: {event.registration_count || 0} users ({event.total_attendees || 0} attendees)
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={0.5}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<EditIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleOpenDialog(event)}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleDelete(event._id)}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Box>
          {loading ? (
            <Typography>Loading registrations...</Typography>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Event Registrations ({registrations.length})
              </Typography>
              {registrations.length === 0 ? (
                <Typography color="text.secondary">No registrations found.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {registrations.map((reg) => (
                    <Grid item xs={12} md={6} key={reg._id}>
                      <Card sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {reg.event_title}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            Attendee: {reg.attendee_name || reg.user_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Email: {reg.attendee_email || reg.user_email}
                          </Typography>
                          {reg.attendee_phone && (
                            <Typography variant="body2" color="text.secondary">
                              Phone: {reg.attendee_phone}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            Tickets: {reg.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Registered by: {reg.user_name} ({reg.user_email})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Registration Date: {new Date(reg.registration_date).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="success.main">
                            Status: {reg.status}
                          </Typography>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      )}
      
      {activeTab === 0 && events.length === 0 && (
        <Typography textAlign="center" color="text.secondary" sx={{ py: 8 }}>
          No events found. Create your first event!
        </Typography>
      )}
      
      {/* Event Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
            />
            
            <TextField
              label="Event Date & Time"
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date(Date.now() + 10 * 60000).toISOString().slice(0, 16) // 10 minutes from now
              }}
            />
            
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              required
            />
            
            <TextField
              label="Venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              fullWidth
              required
            />
            
            <TextField
              label="Image URL"
              name="image"
              value={formData.image}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Max Attendees (optional)"
              type="number"
              name="max_attendees"
              value={formData.max_attendees}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            {editingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagement;