import React from 'react';
import { Card, CardHeader, CardContent, Stack, Typography, LinearProgress, Avatar } from '@mui/material';

const top = [
  { name: 'Monstera Deliciosa', sales: 124, growth: '+15.2%', amount: '₹5,580' },
  { name: 'Snake Plant', sales: 98, growth: '+8.7%', amount: '₹2,842' },
  { name: 'Peace Lily', sales: 87, growth: '+12.3%', amount: '₹3,132' },
  { name: 'Pothos', sales: 76, growth: '+6.1%', amount: '₹1,824' },
  { name: 'Fiddle Leaf Fig', sales: 65, growth: '+9.8%', amount: '₹3,250' },
];

export default function TopProducts() {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardHeader title={<Typography variant="h6" fontWeight={800}>Top Products</Typography>} subheader={<Typography variant="body2" color="success.main">Best selling items this month</Typography>} />
      <CardContent>
        <Stack spacing={2}>
          {top.map((p, i) => (
            <Stack key={p.name} spacing={1.5} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.light', color: 'success.dark', fontSize: 14, fontWeight: 700 }}>{i + 1}</Avatar>
                  <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.2 }}>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.sales} sales</Typography>
                  </Stack>
                </Stack>
                <Stack alignItems="flex-end" sx={{ flexShrink: 0 }}>
                  <Typography variant="body2" color="success.main" fontWeight={700}>{p.growth}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{p.amount}</Typography>
                </Stack>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, (p.sales / 124) * 100)} 
                sx={{ 
                  height: 6, 
                  borderRadius: 999, 
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: 'success.main',
                    borderRadius: 999
                  } 
                }} 
              />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}



























