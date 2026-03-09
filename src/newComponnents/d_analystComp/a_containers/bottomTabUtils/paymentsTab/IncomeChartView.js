// bottomTabUtils/tabs/views/IncomeChartView.js
import React from 'react';
import { Box, Typography } from '@mui/joy';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { groupBy } from 'lodash';
import { getMonthYearLabel } from '../../../../x_utils/dateUtiles.js';

export default function IncomeChartView({ payments = [] }) {
  const grouped = groupBy(payments, (p) => p.paymentFor);

  const data = Object.entries(grouped).map(([month, list]) => ({
    name: getMonthYearLabel(month),
    total: list.reduce((sum, p) => sum + (p.price || 0), 0),
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box>
      <Typography level="h5" sx={{ mb: 2 }}>הכנסה לפי חודש</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 15 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-35} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toLocaleString()} ₪`} />
          <Bar dataKey="total" fill="#007c91" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
