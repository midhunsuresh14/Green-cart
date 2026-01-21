import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { api } from '../../lib/api';

export default function StatsCards() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, remedies: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cardItems = [
    { title: 'Users', value: stats.users, icon: <PeopleIcon sx={{ color: '#3b82f6' }} /> },
    { title: 'Products', value: stats.products, icon: <InventoryIcon sx={{ color: '#10b981' }} /> },
    { title: 'Orders', value: stats.orders, icon: <ShoppingCartIcon sx={{ color: '#f59e0b' }} /> },
    { title: 'Remedies', value: stats.remedies, icon: <LocalPharmacyIcon sx={{ color: '#ef4444' }} /> },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <div className="cards-grid">
      {error && <div className="badge warning">{error}</div>}
      {cardItems.map((item, index) => (
        <div key={index} className="stat-card">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <h3>{item.title}</h3>
              <p className="stat-value">{item.value.toLocaleString()}</p>
            </Box>
            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: 'rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.icon}
            </Box>
          </Stack>
        </div>
      ))}
    </div>
  );
}