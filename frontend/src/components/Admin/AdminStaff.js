import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { createStaff, listUsers, deleteUser } from '../../lib/api';

export default function AdminStaff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDrawer, setOpenDrawer] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'store_manager'
    });

    const loadStaff = async () => {
        try {
            setLoading(true);
            const allUsers = await listUsers();
            // Filter only staff members
            const staffMembers = allUsers.filter(u => u.role === 'store_manager' || u.role === 'delivery_boy');
            setStaff(staffMembers);
        } catch (e) {
            setError('Failed to load staff members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaff();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await createStaff(formData);
            setSuccess('Staff member created successfully!');
            setFormData({ name: '', email: '', password: '', role: 'store_manager' });
            setOpenDrawer(false);
            loadStaff();
        } catch (e) {
            setError(e.message || 'Failed to create staff member');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this staff member?')) {
            try {
                await deleteUser(id);
                loadStaff();
            } catch (e) {
                setError('Failed to delete staff member');
            }
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={700}>Staff Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setOpenDrawer(true)}
                >
                    Add Staff Member
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell fontWeight={600}>Name</TableCell>
                            <TableCell fontWeight={600}>Email</TableCell>
                            <TableCell fontWeight={600}>Role</TableCell>
                            <TableCell fontWeight={600}>Created At</TableCell>
                            <TableCell fontWeight={600} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {staff.map((member) => (
                            <TableRow key={member.id} hover>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={member.role === 'store_manager' ? 'Store Manager' : 'Delivery Boy'}
                                        size="small"
                                        color={member.role === 'store_manager' ? 'primary' : 'secondary'}
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell>{member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell align="right">
                                    <Button color="error" size="small" onClick={() => handleDelete(member.id)}>Remove</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {staff.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No staff members found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDrawer} onClose={() => setOpenDrawer(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={700}>Register New Staff Member</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Temporary Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    label="Role"
                                    onChange={handleInputChange}
                                    required
                                >
                                    <MenuItem value="store_manager">Store Manager</MenuItem>
                                    <MenuItem value="delivery_boy">Delivery Boy</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpenDrawer(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Create Account</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
