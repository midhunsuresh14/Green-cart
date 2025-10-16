import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Tooltip,
  Stack,
  Snackbar,
  Alert,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import { api } from '../../lib/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [subCategoryOpen, setSubCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState({ id: null, name: '', description: '' });
  const [subCategoryForm, setSubCategoryForm] = useState({ id: null, name: '', description: '', categoryId: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Load categories from API or use default structure
  async function loadCategories() {
    try {
      setLoading(true);
      // Try to fetch from API first
      const data = await api.listCategories();
      console.log('Categories API response:', data);
      if (data && Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        console.log('No categories from API, using defaults');
        setCategories(getDefaultCategories());
      }
    } catch (e) {
      console.log('Error loading categories from API, using defaults:', e.message);
      setCategories(getDefaultCategories());
    } finally {
      setLoading(false);
    }
  }

  function getDefaultCategories() {
    return [
      {
        id: 1,
        name: 'Plants',
        description: 'Indoor and outdoor plants',
        subcategories: [
          { id: 1, name: 'Indoor', description: 'Indoor plants for home decoration' },
          { id: 2, name: 'Outdoor', description: 'Outdoor plants for gardens' },
          { id: 3, name: 'Flowering', description: 'Beautiful flowering plants' },
          { id: 4, name: 'Air-Purifying', description: 'Plants that purify air' },
          { id: 5, name: 'Medicinal/Herbal', description: 'Plants with medicinal properties' },
          { id: 6, name: 'Succulent', description: 'Low-maintenance succulent plants' }
        ]
      },
      {
        id: 2,
        name: 'Crops & Seeds',
        description: 'Seeds and crops for cultivation',
        subcategories: [
          { id: 7, name: 'Vegetables', description: 'Vegetable seeds and plants' },
          { id: 8, name: 'Fruits', description: 'Fruit seeds and saplings' },
          { id: 9, name: 'Grains/Pulses', description: 'Grain and pulse seeds' },
          { id: 10, name: 'Spices/Herbs', description: 'Spice and herb seeds' }
        ]
      },
      {
        id: 3,
        name: 'Pots & Planters',
        description: 'Containers for planting',
        subcategories: [
          { id: 11, name: 'Ceramic', description: 'Ceramic pots and planters' },
          { id: 12, name: 'Clay/Terracotta', description: 'Traditional clay pots' },
          { id: 13, name: 'Hanging', description: 'Hanging planters and baskets' },
          { id: 14, name: 'Self-Watering', description: 'Self-watering planters' },
          { id: 15, name: 'Decorative', description: 'Decorative pots and planters' }
        ]
      },
      {
        id: 4,
        name: 'Soil & Fertilizers',
        description: 'Soil mixes and fertilizers',
        subcategories: [
          { id: 16, name: 'Potting Mix', description: 'Ready-to-use potting mixes' },
          { id: 17, name: 'Compost/Manure', description: 'Organic compost and manure' },
          { id: 18, name: 'Chemical Fertilizers', description: 'Chemical fertilizers and nutrients' },
          { id: 19, name: 'Soil Conditioners', description: 'Soil improvement products' }
        ]
      },
      {
        id: 5,
        name: 'Gardening Tools',
        description: 'Tools for gardening',
        subcategories: [
          { id: 20, name: 'Hand Tools', description: 'Small hand gardening tools' },
          { id: 21, name: 'Watering Tools', description: 'Watering cans and sprinklers' },
          { id: 22, name: 'Supports', description: 'Plant supports and stakes' }
        ]
      },
      {
        id: 6,
        name: 'Herbal & Eco Products',
        description: 'Eco-friendly and herbal products',
        subcategories: [
          { id: 23, name: 'Herbal Remedies', description: 'Natural herbal remedies' },
          { id: 24, name: 'Eco-Friendly Packs', description: 'Environmentally friendly packaging' }
        ]
      }
    ];
  }

  useEffect(() => {
    loadCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Category handlers
  function onEditCategory(category) {
    setForm({ id: category.id, name: category.name, description: category.description || '' });
    setOpen(true);
  }

  function onAddCategory() {
    setForm({ id: null, name: '', description: '' });
    setOpen(true);
  }

  async function onSubmitCategory(e) {
    e.preventDefault();
    try {
      setError('');
      if (!form.name) throw new Error('Category name is required');

      const payload = {
        name: form.name,
        description: form.description
      };

      if (form.id) {
        // Update existing category
        if (api.updateCategory) {
          await api.updateCategory(form.id, payload);
        } else {
          // Update local state if no API
          setCategories(prev => prev.map(cat => 
            cat.id === form.id ? { ...cat, ...payload } : cat
          ));
        }
        setToast({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        // Create new category
        if (api.createCategory) {
          await api.createCategory(payload);
        } else {
          // Add to local state if no API
          const newCategory = {
            id: Math.max(...categories.map(c => c.id), 0) + 1,
            ...payload,
            subcategories: []
          };
          setCategories(prev => [...prev, newCategory]);
        }
        setToast({ open: true, message: 'Category created successfully', severity: 'success' });
      }

      setForm({ id: null, name: '', description: '' });
      setOpen(false);
      if (api.listCategories) await loadCategories();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  async function onDeleteCategory(id) {
    if (!window.confirm('Delete this category and all its subcategories?')) return;
    try {
      if (api.deleteCategory) {
        await api.deleteCategory(id);
      } else {
        // Remove from local state if no API
        setCategories(prev => prev.filter(cat => cat.id !== id));
      }
      setToast({ open: true, message: 'Category deleted successfully', severity: 'success' });
      if (api.listCategories) await loadCategories();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  // Subcategory handlers
  function onAddSubCategory(category) {
    setSelectedCategory(category);
    setSubCategoryForm({ id: null, name: '', description: '', categoryId: category.id });
    setSubCategoryOpen(true);
  }

  function onEditSubCategory(category, subcategory) {
    setSelectedCategory(category);
    setSubCategoryForm({
      id: subcategory.id,
      name: subcategory.name,
      description: subcategory.description || '',
      categoryId: category.id
    });
    setSubCategoryOpen(true);
  }

  async function onSubmitSubCategory(e) {
    e.preventDefault();
    try {
      setError('');
      if (!subCategoryForm.name) throw new Error('Subcategory name is required');

      const payload = {
        name: subCategoryForm.name,
        description: subCategoryForm.description,
        categoryId: subCategoryForm.categoryId
      };

      if (subCategoryForm.id) {
        // Update existing subcategory
        if (api.updateSubCategory) {
          await api.updateSubCategory(subCategoryForm.id, payload);
        } else {
          // Update local state
          setCategories(prev => prev.map(cat => 
            cat.id === selectedCategory.id 
              ? {
                  ...cat,
                  subcategories: cat.subcategories.map(sub =>
                    sub.id === subCategoryForm.id ? { ...sub, ...payload } : sub
                  )
                }
              : cat
          ));
        }
        setToast({ open: true, message: 'Subcategory updated successfully', severity: 'success' });
      } else {
        // Create new subcategory
        if (api.createSubCategory) {
          await api.createSubCategory(payload);
        } else {
          // Add to local state
          const newSubCategory = {
            id: Math.max(...categories.flatMap(c => c.subcategories?.map(s => s.id) || []), 0) + 1,
            ...payload
          };
          setCategories(prev => prev.map(cat => 
            cat.id === selectedCategory.id 
              ? { ...cat, subcategories: [...(cat.subcategories || []), newSubCategory] }
              : cat
          ));
        }
        setToast({ open: true, message: 'Subcategory created successfully', severity: 'success' });
      }

      setSubCategoryForm({ id: null, name: '', description: '', categoryId: null });
      setSubCategoryOpen(false);
      if (api.listCategories) await loadCategories();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  async function onDeleteSubCategory(categoryId, subcategoryId) {
    if (!window.confirm('Delete this subcategory?')) return;
    try {
      if (api.deleteSubCategory) {
        await api.deleteSubCategory(subcategoryId);
      } else {
        // Remove from local state
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId) }
            : cat
        ));
      }
      setToast({ open: true, message: 'Subcategory deleted successfully', severity: 'success' });
      if (api.listCategories) await loadCategories();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  return (
    <Box>
      <Box className="panel-header">
        <h2>Category Management</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAddCategory}>
          Add Category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Typography>Loading categories...</Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {categories.map((category) => (
            <Accordion key={category.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <CategoryIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{category.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${category.subcategories?.length || 0} subcategories`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Edit Category">
                      <IconButton size="small" onClick={() => onEditCategory(category)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Category">
                      <IconButton size="small" color="error" onClick={() => onDeleteCategory(category.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Subcategories</Typography>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => onAddSubCategory(category)}
                  >
                    Add Subcategory
                  </Button>
                </Box>
                <List>
                  {category.subcategories?.map((subcategory) => (
                    <ListItem key={subcategory.id} divider>
                      <ListItemText
                        primary={subcategory.name}
                        secondary={subcategory.description}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Edit Subcategory">
                          <IconButton 
                            size="small" 
                            onClick={() => onEditSubCategory(category, subcategory)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Subcategory">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => onDeleteSubCategory(category.id, subcategory.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )) || (
                    <ListItem>
                      <ListItemText 
                        primary="No subcategories" 
                        secondary="Click 'Add Subcategory' to create one"
                      />
                    </ListItem>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Category Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={onSubmitCategory}>
          <DialogTitle>{form.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Category Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
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

      {/* Subcategory Dialog */}
      <Dialog open={subCategoryOpen} onClose={() => setSubCategoryOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={onSubmitSubCategory}>
          <DialogTitle>
            {subCategoryForm.id ? 'Edit Subcategory' : 'Add Subcategory'}
            {selectedCategory && (
              <Typography variant="body2" color="text.secondary">
                in {selectedCategory.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Subcategory Name"
                value={subCategoryForm.name}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubCategoryOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {subCategoryForm.id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={3000} 
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}