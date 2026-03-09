import * as React from 'react';
import { Input, FormControl, FormLabel, Select, Option, Box } from '@mui/joy';

export default function CoachEditField({ value = {}, onChange, size = 'sm' }) {
  const handleChange = (field, newValue) => {
    const updated = { ...value, [field]: newValue };
    onChange(updated);
  };

  return (
    <Box>
      <FormLabel required sx={{ fontSize: '12px' }}>פרטי המאמן</FormLabel>
      <Input
        value={value.fullName || ''}
        autoComplete="off"
        onChange={(e) => {
          const val = e.target.value;
          if (val.length <= 12) handleChange('fullName', val);
        }}
        placeholder="שם"
        variant="soft"
        size={size}
        startDecorator={
          <Select
            value={value.role || ''}
            size="md"
            disabled
            variant="plain"
            sx={{ width: 130, ml: -1, mt: 0.2 }}
          >
            {STAFF_ROLE_OPTIONS.map(({ role, label }) => (
              <Option key={role} value={role}>{label}</Option>
            ))}
          </Select>
        }
        endDecorator={
          <Input
            value={value.phone || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val) && val.length <= 10) {
                handleChange('phone', val);
              }
            }}
            placeholder="טלפון"
            size="sm"
            autoComplete="off"
            variant="solid"
            sx={{ width: 120, mr: -1.4, borderRadius: "sm" }}
          />
        }
        sx={{ width: '100%' }}
      />
    </Box>
  );
}
