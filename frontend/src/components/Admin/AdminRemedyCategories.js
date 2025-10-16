import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Snackbar,
  Alert,
  Chip,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import { api } from '../../lib/api';

export default function AdminRemedyCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    icon: '🌿',
    color: '#4a7c59'
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const defaultIcons = [
    '🌿', '🫀', '🫁', '💪', '✨', '😌', '🤕', '❤️', '🧠', '🌱', 
    '🍃', '🌺', '🌸', '🌼', '🌻', '🌹', '🌷', '🌾', '🍀', '🌿'
  ];

  const defaultColors = [
    '#4a7c59', '#2d5016', '#6b8e23', '#8fbc8f', '#228b22', '#32cd32',
    '#9acd32', '#adff2f', '#7cfc00', '#7fff00', '#00ff7f', '#00fa9a',
    '#90ee90', '#98fb98', '#f0fff0', '#f5fffa', '#f0f8ff', '#e0ffff'
  ];

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await api.listRemedyCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function onEdit(category) {
    setForm({
      id: category.id,
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '🌿',
      color: category.color || '#4a7c59'
    });
    setOpen(true);
  }

  function onAdd() {
    setForm({
      id: null,
      name: '',
      description: '',
      icon: '🌿',
      color: '#4a7c59'
    });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setError('');

      if (!form.name) {
        throw new Error('Category name is required');
      }

      const payload = {
        name: form.name,
        description: form.description,
        icon: form.icon,
        color: form.color
      };
      
      if (form.id) {
        await api.updateRemedyCategory(form.id, payload);
        setToast({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        await api.createRemedyCategory(payload);
        setToast({ open: true, message: 'Category created successfully', severity: 'success' });
      }
      
      setOpen(false);
      await loadCategories();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this category? This action cannot be undone.')) return;
    try {
      await api.deleteRemedyCategory(id);
      setToast({ open: true, message: 'Category deleted successfully', severity: 'success' });
      await loadCategories();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  return (
    <Box>
      <Box className="panel-header">
        <h2>Remedy Categories Management</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading categories...</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          fontSize: '2rem',
                          mr: 2,
                          p: 1,
                          borderRadius: '50%',
                          backgroundColor: category.color + '20',
                          border: `2px solid ${category.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 60,
                          height: 60
                        }}
                      >
                        {category.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" component="h3">
                          {category.name}
                        </Typography>
                        <Chip 
                          label={category.color} 
                          size="small" 
                          sx={{ backgroundColor: category.color, color: 'white' }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {category.description || 'No description provided'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Edit Category">
                      <IconButton onClick={() => onEdit(category)} size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Category">
                      <IconButton onClick={() => onDelete(category.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {categories.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No categories found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first remedy category to get started
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
                Add First Category
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={3}>
              <TextField
                label="Category Name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                required
                fullWidth
                placeholder="e.g., Digestive Health"
              />

              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                fullWidth
                placeholder="Brief description of this category..."
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Icon
                </Typography>
                <Grid container spacing={1}>
                  {defaultIcons.map((icon, index) => (
                    <Grid item key={index}>
                      <IconButton
                        onClick={() => setForm(prev => ({ ...prev, icon }))}
                        sx={{
                          fontSize: '1.5rem',
                          border: form.icon === icon ? '2px solid #1976d2' : '1px solid #ccc',
                          borderRadius: '8px',
                          p: 1
                        }}
                      >
                        {icon}
                      </IconButton>
                    </Grid>
                  ))}
                </Grid>
                <TextField
                  label="Custom Icon"
                  value={form.icon}
                  onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                  fullWidth
                  sx={{ mt: 2 }}
                  placeholder="Enter custom emoji or icon"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Color
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {defaultColors.map((color, index) => (
                    <Grid item key={index}>
                      <IconButton
                        onClick={() => setForm(prev => ({ ...prev, color }))}
                        sx={{
                          backgroundColor: color,
                          border: form.color === color ? '3px solid #1976d2' : '1px solid #ccc',
                          borderRadius: '8px',
                          width: 40,
                          height: 40,
                          '&:hover': {
                            backgroundColor: color,
                            opacity: 0.8
                          }
                        }}
                      >
                        {form.color === color && '✓'}
                      </IconButton>
                    </Grid>
                  ))}
                </Grid>
                <TextField
                  label="Custom Color (Hex)"
                  value={form.color}
                  onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                  fullWidth
                  placeholder="#4a7c59"
                />
              </Box>

              {/* Preview */}
              <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      fontSize: '2rem',
                      mr: 2,
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: form.color + '20',
                      border: `2px solid ${form.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 50,
                      height: 50
                    }}
                  >
                    {form.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {form.name || 'Category Name'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {form.description || 'Category description'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {form.id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={toast.severity} onClose={() => setToast(prev => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
