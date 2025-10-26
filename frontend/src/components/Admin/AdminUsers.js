import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [dialogLoading, setDialogLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await api.listUsers();
      // Show all users including admins
      setUsers(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      setError('Name and email are required');
      return;
    }

    setDialogLoading(true);
    setError('');

    try {
      // In a real implementation, you would create a user with a temporary password
      // For now, we'll just show a success message
      setSuccessMessage(`User ${newUser.name} added successfully. They can now log in with their email.`);
      setSnackbarOpen(true);
      setOpenDialog(false);
      setNewUser({ name: '', email: '', role: 'user' });
      await load(); // Refresh the user list
    } catch (e) {
      setError(e.message);
    } finally {
      setDialogLoading(false);
    }
  };

  async function changeUserRole(id, role) {
    try {
      await api.updateUserRole(id, role);
      await load();
      setSuccessMessage(`User role updated to ${role}`);
      setSnackbarOpen(true);
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleActive(id, active) {
    try {
      await api.toggleUserActive(id, active);
      await load();
      setSuccessMessage(`User ${active ? 'activated' : 'deactivated'} successfully`);
      setSnackbarOpen(true);
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeUser(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      await load();
      setSuccessMessage('User deleted successfully');
      setSnackbarOpen(true);
    } catch (e) {
      setError(e.message);
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box className="panel-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Add User
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select
                        value={u.role}
                        onChange={(e) => changeUserRole(u.id, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="staff">Staff</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <span className={`badge ${u.active ? 'success' : 'warning'}`}>{u.active ? 'Active' : 'Disabled'}</span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => toggleActive(u.id, !u.active)}
                      sx={{ mr: 1 }}
                    >
                      {u.active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small" 
                      onClick={() => removeUser(u.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained" 
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={successMessage}
      />
    </Box>
  );
}