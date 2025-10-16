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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api } from '../../lib/api';

export default function AdminRemedies() {
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    illness: '',
    category: '',
    keywords: [],
    description: '',
    benefits: [],
    preparation: '',
    dosage: '',
    duration: '',
    precautions: '',
    effectiveness: '',
    imageUrl: '',
    tags: []
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploadResult, setCsvUploadResult] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);

  async function loadRemedies() {
    try {
      setLoading(true);
      const data = await api.listRemedies();
      setRemedies(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await api.listRemedyCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Failed to load categories:', e.message);
      // Fallback to default categories
      setCategories([
        { id: 'digestive', name: 'Digestive' },
        { id: 'respiratory', name: 'Respiratory' },
        { id: 'immune', name: 'Immune' },
        { id: 'skin', name: 'Skin' },
        { id: 'stress', name: 'Stress' },
        { id: 'pain', name: 'Pain' },
        { id: 'cardiovascular', name: 'Cardiovascular' },
        { id: 'mental', name: 'Mental' }
      ]);
    }
  }

  useEffect(() => {
    loadRemedies();
    loadCategories();
  }, []);

  function onEdit(remedy) {
    setForm({
      id: remedy.id,
      name: remedy.name || '',
      illness: remedy.illness || '',
      category: remedy.category || '',
      keywords: remedy.keywords || [],
      description: remedy.description || '',
      benefits: remedy.benefits || [],
      preparation: remedy.preparation || '',
      dosage: remedy.dosage || '',
      duration: remedy.duration || '',
      precautions: remedy.precautions || '',
      effectiveness: remedy.effectiveness || '',
      imageUrl: remedy.imageUrl || '',
      tags: remedy.tags || []
    });
    setOpen(true);
  }

  function onAdd() {
    setForm({
      id: null,
      name: '',
      illness: '',
      category: '',
      keywords: [],
      description: '',
      benefits: [],
      preparation: '',
      dosage: '',
      duration: '',
      precautions: '',
      effectiveness: '',
      imageUrl: '',
      tags: []
    });
    setImageFile(null);
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setError('');

      if (!form.name || !form.illness) {
        throw new Error('Name and illness are required');
      }

      let imageUrl = form.imageUrl;
      if (imageFile) {
        const res = await api.uploadImage(imageFile);
        imageUrl = res.url;
      }

      const payload = { ...form, imageUrl };
      
      if (form.id) {
        await api.updateRemedy(form.id, payload);
        setToast({ open: true, message: 'Remedy updated successfully', severity: 'success' });
      } else {
        await api.createRemedy(payload);
        setToast({ open: true, message: 'Remedy created successfully', severity: 'success' });
      }
      
      setOpen(false);
      setImageFile(null);
      await loadRemedies();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this remedy?')) return;
    try {
      await api.deleteRemedy(id);
      setToast({ open: true, message: 'Remedy deleted successfully', severity: 'success' });
      await loadRemedies();
    } catch (e) {
      setError(e.message);
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  async function handleCsvUpload() {
    if (!csvFile) {
      setToast({ open: true, message: 'Please select a CSV file', severity: 'error' });
      return;
    }

    try {
      const result = await api.bulkUploadRemedies(csvFile);
      setCsvUploadResult(result);
      setToast({ 
        open: true, 
        message: `Successfully uploaded ${result.inserted} remedies`, 
        severity: 'success' 
      });
      await loadRemedies();
    } catch (e) {
      setToast({ open: true, message: e.message, severity: 'error' });
    }
  }

  function downloadCsvTemplate() {
    const headers = [
      'name', 'illness', 'category', 'keywords', 'description', 'benefits', 
      'preparation', 'dosage', 'duration', 'precautions', 'effectiveness', 'imageUrl', 'tags'
    ];
    
    const sampleData = [
      'Ginger Tea',
      'Nausea & Indigestion',
      'digestive',
      'nausea, indigestion, stomach upset, morning sickness',
      'Fresh ginger root tea to soothe stomach discomfort and reduce nausea.',
      'Reduces nausea, Aids digestion, Anti-inflammatory, Relieves motion sickness',
      'Boil 1 inch fresh ginger in 2 cups water for 10 minutes. Strain and drink warm.',
      '2-3 cups daily as needed',
      'Until symptoms subside',
      'Avoid if you have bleeding disorders or are taking blood thinners',
      'High - Works within 30 minutes',
      '',
      'Digestive, Anti-nausea, Natural'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remedies_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function handleArrayInput(field, value) {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setForm(prev => ({ ...prev, [field]: items }));
  }

  return (
    <Box>
      <Box className="panel-header">
        <h2>Herbal Remedies Management</h2>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadCsvTemplate}
          >
            Download CSV Template
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setCsvUploadOpen(true)}
          >
            Bulk Upload CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Add Remedy
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Illness</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Keywords</TableCell>
              <TableCell>Effectiveness</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : remedies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No remedies found. Add some remedies or upload a CSV file.
                </TableCell>
              </TableRow>
            ) : (
              remedies.map((remedy) => (
                <TableRow key={remedy.id}>
                  <TableCell>{remedy.name}</TableCell>
                  <TableCell>{remedy.illness}</TableCell>
                  <TableCell>
                    <Chip 
                      label={remedy.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(remedy.keywords || []).slice(0, 3).map((keyword, index) => (
                        <Chip key={index} label={keyword} size="small" />
                      ))}
                      {(remedy.keywords || []).length > 3 && (
                        <Chip label={`+${(remedy.keywords || []).length - 3} more`} size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{remedy.effectiveness}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => onEdit(remedy)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => onDelete(remedy.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Remedy Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{form.id ? 'Edit Remedy' : 'Add New Remedy'}</DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Remedy Name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="Illness/Condition"
                  value={form.illness}
                  onChange={(e) => setForm(prev => ({ ...prev, illness: e.target.value }))}
                  required
                  fullWidth
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    label="Category"
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat.id || cat} value={cat.id || cat}>
                        {cat.name || cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Effectiveness"
                  value={form.effectiveness}
                  onChange={(e) => setForm(prev => ({ ...prev, effectiveness: e.target.value }))}
                  fullWidth
                  placeholder="e.g., High - Works within 30 minutes"
                />
              </Stack>

              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="Keywords (comma-separated)"
                value={(form.keywords || []).join(', ')}
                onChange={(e) => handleArrayInput('keywords', e.target.value)}
                fullWidth
                placeholder="nausea, indigestion, stomach upset"
              />

              <TextField
                label="Benefits (comma-separated)"
                value={(form.benefits || []).join(', ')}
                onChange={(e) => handleArrayInput('benefits', e.target.value)}
                fullWidth
                placeholder="Reduces nausea, Aids digestion, Anti-inflammatory"
              />

              <TextField
                label="Preparation Instructions"
                value={form.preparation}
                onChange={(e) => setForm(prev => ({ ...prev, preparation: e.target.value }))}
                multiline
                rows={3}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Dosage"
                  value={form.dosage}
                  onChange={(e) => setForm(prev => ({ ...prev, dosage: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Duration"
                  value={form.duration}
                  onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Precautions"
                value={form.precautions}
                onChange={(e) => setForm(prev => ({ ...prev, precautions: e.target.value }))}
                multiline
                rows={2}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Image URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Tags (comma-separated)"
                  value={(form.tags || []).join(', ')}
                  onChange={(e) => handleArrayInput('tags', e.target.value)}
                  fullWidth
                  placeholder="Digestive, Natural, Herbal"
                />
              </Stack>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Image (optional)
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  style={{ 
                    padding: '10px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    width: '100%'
                  }}
                />
                {imageFile && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selected: {imageFile.name}
                  </Typography>
                )}
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

      {/* CSV Upload Dialog */}
      <Dialog open={csvUploadOpen} onClose={() => setCsvUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload Remedies</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Upload a CSV file with remedy data. Download the template first to see the required format.
            </Typography>
            
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />

            {csvUploadResult && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Upload Results</Typography>
                  <Typography>✅ Successfully inserted: {csvUploadResult.inserted}</Typography>
                  <Typography>📊 Total rows processed: {csvUploadResult.total_rows}</Typography>
                  {csvUploadResult.errors.length > 0 && (
                    <>
                      <Typography color="error" sx={{ mt: 1 }}>❌ Errors:</Typography>
                      {csvUploadResult.errors.slice(0, 5).map((error, index) => (
                        <Typography key={index} variant="body2" color="error">
                          • {error}
                        </Typography>
                      ))}
                      {csvUploadResult.errors.length > 5 && (
                        <Typography variant="body2" color="error">
                          ... and {csvUploadResult.errors.length - 5} more errors
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCsvUploadOpen(false)}>Close</Button>
          <Button onClick={handleCsvUpload} variant="contained" disabled={!csvFile}>
            Upload
          </Button>
        </DialogActions>
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
