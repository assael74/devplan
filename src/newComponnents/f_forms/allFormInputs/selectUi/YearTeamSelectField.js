import * as React from 'react';
import { FormControl, FormLabel, Select, Option } from '@mui/joy';

export default function YearTeamSelectField({ value, onChange, label = 'שנה', size = 'sm' }) {
  const currentYear = new Date().getFullYear() - 11;
  const years = Array.from({ length: 9 }, (_, i) => currentYear - i);

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select
        variant="outlined"
        size={size}
        slotProps={{ listbox: { sx: { maxHeight: '300px', width: '100%' }}}}
        value={value ?? ''}
        placeholder="בחר שנה לשחקני הקבוצה"
        onChange={(_, newVal) => onChange?.(newVal)}
      >
        <Option value="adult">קבוצת בוגרים</Option>
        {years.map((year) => (
          <Option key={year} value={year}>
            {year}
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}
