import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, List, ListItem, ListItemIcon, ListItemText, Chip, Stack, Typography, Avatar, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { api } from '../../lib/api';

const items = [
  { icon: <CheckCircleOutlineIcon color="success" />, text: 'New user registration: sarah.johnson@email.com', time: '2 minutes ago', status: 'Success', color: 'success' },
  { icon: <InfoOutlinedIcon color="info" />, text: 'Order #ORD-1234 placed by Michael Chen', time: '15 minutes ago', status: 'Info', color: 'info' },
  { icon: <WarningAmberOutlinedIcon color="warning" />, text: 'Snake Plant stock running low (5 remaining)', time: '1 hour ago', status: 'Warning', color: 'warning' },
  { icon: <CheckCircleOutlineIcon color="success" />, text: 'New remedy added: Aphid Treatment Spray', time: '2 hours ago', status: 'Success', color: 'success' },
];

export default function RecentActivity() {
  const [low, setLow] = useState({ items: [], count: 0, threshold: 10 });
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        
        // Fetch low stock items
        const lowStockRes = await api.lowStock();
        if (mounted) setLow(lowStockRes || { items: [], count: 0, threshold: 10 });

        // Fetch recent activities (notifications, orders, users)
        const [notificationsRes, ordersRes, usersRes] = await Promise.all([
          api.adminNotifications().catch(() => ({ notifications: [] })),
          api.listOrders().catch(() => ({ orders: [] })),
          api.listUsers().catch(() => ({ users: [] }))
        ]);

        if (mounted) {
          const recentActivities = [];
          
          // Add stock notifications
          if (notificationsRes.notifications) {
            notificationsRes.notifications.slice(0, 3).forEach(notif => {
              const timeAgo = getTimeAgo(notif.created_at);
              if (notif.type === 'low_stock') {
                recentActivities.push({
                  icon: <WarningAmberOutlinedIcon color="warning" />,
                  text: `${notif.product_name} stock is low (${notif.current_stock} remaining)`,
                  time: timeAgo,
                  status: 'Warning',
                  color: 'warning'
                });
              } else if (notif.type === 'out_of_stock') {
                recentActivities.push({
                  icon: <WarningAmberOutlinedIcon color="error" />,
                  text: `${notif.product_name} is out of stock`,
                  time: timeAgo,
                  status: 'Critical',
                  color: 'error'
                });
              }
            });
          }

          // Add recent orders
          if (ordersRes.orders) {
            ordersRes.orders.slice(0, 2).forEach(order => {
              const timeAgo = getTimeAgo(order.created_at);
              recentActivities.push({
                icon: <ShoppingCartIcon color="info" />,
                text: `Order #${order.id.slice(-6)} placed by ${order.customerName || 'Customer'}`,
                time: timeAgo,
                status: 'Order',
                color: 'info'
              });
            });
          }

          // Add recent user registrations
          if (usersRes.users) {
            const recentUsers = usersRes.users
              .filter(user => user.created_at)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 2);
            
            recentUsers.forEach(user => {
              const timeAgo = getTimeAgo(user.created_at);
              recentActivities.push({
                icon: <PersonAddIcon color="success" />,
                text: `New user registration: ${user.email}`,
                time: timeAgo,
                status: 'New User',
                color: 'success'
              });
            });
          }

          // Sort by most recent and limit to 5 items
          setActivities(recentActivities.slice(0, 5));
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load activities');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <CardHeader title={<Typography variant="h6" fontWeight={800}>Recent Activity</Typography>} subheader={<Typography variant="body2" color="success.main">Latest updates from your store</Typography>} />
      <CardContent>
        {loading && <Typography variant="body2">Loading low-stock…</Typography>}
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {!loading && !error && (
          <>
            {low.items?.length ? (
              <>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <WarningAmberOutlinedIcon color="warning" />
                  <Typography variant="subtitle1" fontWeight={700}>Low Stock Alerts</Typography>
                  <Chip size="small" label={low.count} color="warning" />
                </Stack>
                <List sx={{ py: 0 }}>
                  {low.items.map((p) => (
                    <ListItem key={p.id} sx={{ px: 0, alignItems: 'center' }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {p.imageUrl ? (
                          <Avatar alt={p.name} src={p.imageUrl} sx={{ width: 28, height: 28 }} />
                        ) : (
                          <Inventory2Icon color="disabled" />
                        )}
                      </ListItemIcon>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                        <ListItemText
                          primary={<Typography variant="body1" color="text.primary">{p.name}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{p.category || ''}</Typography>}
                        />
                        <Chip size="small" label={`Stock: ${p.stock}`} color="error" variant="soft" sx={{ px: 0.5 }} />
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlineIcon color="success" />
                <Typography variant="body2">All product stocks are healthy (≥ {low.threshold}).</Typography>
              </Stack>
            )}

            <List sx={{ py: 0, mt: 2 }}>
              {activities.length > 0 ? activities.map((activity, idx) => (
                <ListItem key={idx} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 36, mt: '2px' }}>{activity.icon}</ListItemIcon>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', justifyContent: 'space-between' }}>
                    <ListItemText
                      primary={<Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.4 }}>{activity.text}</Typography>}
                      secondary={<Typography variant="caption" color="text.secondary">{activity.time}</Typography>}
                      sx={{ flex: 1, minWidth: 0 }}
                    />
                    <Chip 
                      size="small" 
                      label={activity.status} 
                      color={activity.color} 
                      variant="outlined" 
                      sx={{ 
                        px: 0.5, 
                        fontSize: '0.7rem',
                        height: '20px',
                        flexShrink: 0,
                        ml: 1
                      }} 
                    />
                  </Stack>
                </ListItem>
              )) : (
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <InfoOutlinedIcon color="disabled" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" color="text.secondary">No recent activities</Typography>}
                  />
                </ListItem>
              )}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}



















