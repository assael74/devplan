import * as React from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Option,
  Typography,
  Stack,
  Chip,
  Box,
  ChipDelete
} from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { statsParmOptions } from '../../../../shared/stats/stats.options.js';

export default function StatsMultiParmTypeSelectField({
  value = [],
  onChange,
  error = false,
  disabled = false,
  required,
  label,
  size = 'sm',
}) {
  const allOptions = statsParmOptions.filter(opt => opt.id !== 'all');
  const allIds = allOptions.map(opt => opt.id);
  const showAll = value.length === allIds.length;

  const handleChange = (_, newValue) => {
    if (!newValue) return;

    const isAllSelected = newValue.includes('all');
    const alreadyAllSelected = value.length === allIds.length;

    if (isAllSelected) {
      if (alreadyAllSelected) {
        onChange([]); // ניקוי
      } else {
        onChange(allIds); // בחירת הכול
      }
    } else {
      onChange(newValue);
    }
  };

  const handleRemoveChip = (idToRemove, e) => {
    e.stopPropagation();
    const updated = value.filter((id) => id !== idToRemove.value);
    onChange(updated);
  };

  const renderValue = (selected) => {
    if (!selected || selected.length === 0) return 'בחר פרמטרים';

    const isAllSelected = selected.length === allIds.length;
    if (isAllSelected) {
      return (
        <Chip size="sm" variant="soft" color="primary">
          כל הפרמטרים
        </Chip>
      );
    }
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((val) => {
          const opt = statsParmOptions.find((o) => o.id === val.value);
          return (
            <Chip
              key={val}
              size="sm"
              variant="soft"
              endDecorator={
                <ChipDelete
                  onClick={(e) => handleRemoveChip(val, e)}
                  sx={{ mr: 0.2 }}
                />
              }
            >
              {opt?.labelH || val}
            </Chip>
          );
        })}
      </Box>
    );
  };

  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Select
        multiple
        value={value}
        size={size}
        onChange={(_, val) => {
          const allIds = statsParmOptions.map((o) => o.id).filter((id) => id !== 'all');
          if (val.includes('all')) {
            const isAllSelected = value.length === allIds.length;
            onChange(isAllSelected ? [] : allIds);
          } else {
            onChange(val);
          }
        }}
        placeholder="סוג פרמטר"
        indicator="▼"
        renderValue={renderValue}
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%',
            },
          },
        }}
      >
        {statsParmOptions.map((opt) => (
          <Option key={opt.id} value={opt.id}>
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: opt.idIcon })}
              {opt.labelH}
            </Stack>
          </Option>
        ))}
      </Select>

    </FormControl>
  );
}
