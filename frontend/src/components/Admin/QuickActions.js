import React from 'react';
import { Card, CardHeader, CardContent, Grid, Button, Typography } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function QuickActions({ onAddUser, onAddProduct, onViewOrders }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 3 }}>
      <CardHeader title={<Typography variant="h6" fontWeight={800}>Quick Actions</Typography>} subheader={<Typography variant="body2" color="success.main">Common administrative tasks</Typography>} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="primary" startIcon={<PersonAddAltIcon />} sx={{ borderRadius: 3, py: 2 }} onClick={onAddUser}>Add User</Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="success" startIcon={<Inventory2Icon />} sx={{ borderRadius: 3, py: 2 }} onClick={onAddProduct}>Add Product</Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" color="secondary" startIcon={<VisibilityIcon />} sx={{ borderRadius: 3, py: 2 }} onClick={onViewOrders}>View Orders</Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}















