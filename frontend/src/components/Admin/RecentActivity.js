import React from 'react';
import { Card, CardHeader, CardContent, List, ListItem, ListItemIcon, ListItemText, Chip, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const items = [
  { icon: <CheckCircleOutlineIcon color="success" />, text: 'New user registration: sarah.johnson@email.com', time: '2 minutes ago', status: 'Success', color: 'success' },
  { icon: <InfoOutlinedIcon color="info" />, text: 'Order #ORD-1234 placed by Michael Chen', time: '15 minutes ago', status: 'Info', color: 'info' },
  { icon: <WarningAmberOutlinedIcon color="warning" />, text: 'Snake Plant stock running low (5 remaining)', time: '1 hour ago', status: 'Warning', color: 'warning' },
  { icon: <CheckCircleOutlineIcon color="success" />, text: 'New remedy added: Aphid Treatment Spray', time: '2 hours ago', status: 'Success', color: 'success' },
];

export default function RecentActivity() {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <CardHeader title={<Typography variant="h6" fontWeight={800}>Recent Activity</Typography>} subheader={<Typography variant="body2" color="success.main">Latest updates from your store</Typography>} />
      <CardContent>
        <List sx={{ py: 0 }}>
          {items.map((i, idx) => (
            <ListItem key={idx} sx={{ px: 0, alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: 36, mt: '2px' }}>{i.icon}</ListItemIcon>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                <ListItemText
                  primary={<Typography variant="body1" color="text.primary">{i.text}</Typography>}
                  secondary={<Typography variant="caption" color="text.secondary">{i.time}</Typography>}
                />
                <Chip size="small" label={i.status} color={i.color} variant="soft" sx={{ px: 0.5 }} />
              </Stack>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}















