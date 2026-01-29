import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import ImageUpload from '../UI/ImageUpload';
import ModelUpload from '../UI/ModelUpload';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ id: null, name: '', category: '', subcategory: '', price: '', stock: '', description: '', imageUrl: '', arModelUrl: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  async function load() {
    try {
      setLoading(true);
      const data = await api.listProducts(q);
      setItems(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function onEdit(p) {
    setForm({ id: p.id, name: p.name, category: p.category, subcategory: p.subcategory || '', price: p.price, stock: p.stock, description: p.description || '', imageUrl: p.imageUrl || '', arModelUrl: p.arModelUrl || '' });
    setImagePreview(p.imageUrl || null);
    setOpen(true);
  }

  function onAdd() {
    setForm({ id: null, name: '', category: '', subcategory: '', price: '', stock: '', description: '', imageUrl: '', arModelUrl: '' });
    setImagePreview(null);
    setOpen(true);
  }

  function resetForm() {
    setForm({ id: null, name: '', category: '', subcategory: '', price: '', stock: '', description: '', imageUrl: '', arModelUrl: '' });
    setImagePreview(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setError('');

      // Basic validations
      if (!form.name || !form.category) throw new Error('Name and Category are required');
      const priceNum = parseFloat(form.price);
      const stockNum = parseInt(form.stock || 0, 10);
      if (!(priceNum > 0)) throw new Error('Price must be > 0');
      if (stockNum < 0) throw new Error('Stock must be ≥ 0');

      // Use the imageUrl from form state (which gets updated by ImageUpload component)
      const payload = {
        name: form.name,
        category: form.category,
        subcategory: form.subcategory || '',
        price: priceNum,
        stock: stockNum,
        description: form.description,
        imageUrl: form.imageUrl,
        arModelUrl: form.arModelUrl,
      };

      if (form.id) {
        await api.updateProduct(form.id, payload);
        setToast({ open: true, message: 'Product updated', severity: 'success' });
      } else {
        await api.createProduct(payload);
        setToast({ open: true, message: 'Product created', severity: 'success' });
      }
      // Signal other tabs/pages to refresh product list
      try { localStorage.setItem('products:updated', String(Date.now())); } catch (_) { }
      resetForm();
      setOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setToast({ open: true, message: 'Product deleted', severity: 'success' });
      // Signal other tabs/pages to refresh product list
      try { localStorage.setItem('products:updated', String(Date.now())); } catch (_) { }
      await load();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  return (
    <Box>
      <Box className="panel-header">
        <h2>Products</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Add Product</Button>
      </Box>
      {error && <div className="badge warning">{error}</div>}
      <Box sx={{ mb: 1 }}>
        <TextField size="small" placeholder="Search by name or category" value={q} onChange={(e) => setQ(e.target.value)} />
      </Box>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} /> : '-'}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.subcategory || '-'}</TableCell>
                  <TableCell>₹{Number(p.price).toFixed(0)}</TableCell>
                  <TableCell>{p.stock ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(p)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(p.id)}><DeleteIcon /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth component="form" onSubmit={onSubmit}>
        <DialogTitle>{form.id ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
            <FormControl fullWidth required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select labelId="category-label" label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}>
                <MenuItem value="Plants">Plants</MenuItem>
                <MenuItem value="Crops & Seeds">Crops & Seeds</MenuItem>
                <MenuItem value="Pots & Planters">Pots & Planters</MenuItem>
                <MenuItem value="Soil & Fertilizers">Soil & Fertilizers</MenuItem>
                <MenuItem value="Gardening Tools">Gardening Tools</MenuItem>
                <MenuItem value="Herbal & Eco Products">Herbal & Eco Products</MenuItem>
              </Select>
            </FormControl>
            {form.category && (
              <FormControl fullWidth>
                <InputLabel id="subcategory-label">Subcategory</InputLabel>
                <Select labelId="subcategory-label" label="Subcategory" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}>
                  {(
                    {
                      'Plants': ['Indoor', 'Outdoor', 'Flowering', 'Air-Purifying', 'Medicinal/Herbal', 'Succulent'],
                      'Crops & Seeds': ['Vegetables', 'Fruits', 'Grains/Pulses', 'Spices/Herbs'],
                      'Pots & Planters': ['Ceramic', 'Clay/Terracotta', 'Hanging', 'Self-Watering', 'Decorative'],
                      'Soil & Fertilizers': ['Potting Mix', 'Compost/Manure', 'Chemical Fertilizers', 'Soil Conditioners'],
                      'Gardening Tools': ['Hand Tools', 'Watering Tools', 'Supports'],
                      'Herbal & Eco Products': ['Herbal Remedies', 'Eco-Friendly Packs']
                    }[form.category] || []
                  ).map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField type="number" inputProps={{ step: '0.01', min: 0 }} label="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required fullWidth />
              <TextField type="number" inputProps={{ step: '1', min: 0 }} label="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} fullWidth />
            </Stack>
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth />
            <TextField label="Image URL" placeholder="or use upload below" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} fullWidth />
            <ImageUpload
              onImageUpload={(url) => setForm({ ...form, imageUrl: url || '' })}
              label="Product Image"
              previewUrl={imagePreview}
              setPreviewUrl={setImagePreview}
            />
            <TextField label="3D Model URL" placeholder="or use upload below" value={form.arModelUrl} onChange={(e) => setForm({ ...form, arModelUrl: e.target.value })} fullWidth />
            <ModelUpload
              setValue={(url) => setForm(prev => ({ ...prev, arModelUrl: url || '' }))}
              value={form.arModelUrl}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button type="submit" variant="contained">{form.id ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast({ ...toast, open: false })}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}