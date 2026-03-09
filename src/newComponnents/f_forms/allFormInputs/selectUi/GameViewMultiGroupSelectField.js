import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack, Box, Chip, ChipDelete } from '@mui/joy';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex';
import { statsMobileGroupViewOptions } from '../../../x_utils/statsUtils';

export default function GameViewMultiGroupSelectField({
  value = [],
  onChange,
  error = false,
  disabled = false,
  required,
  label,
  view,
  size = 'sm',
}) {
  const maxParm = view === 'profilePlayer' ? 4 : 2
  const handleChange = (_, newValue) => {
    if (!newValue) return;

    // חילוץ מזהים מכל סוג
    const selectedIds = newValue.map((val) =>
      typeof val === 'string' ? val : val.value
    );

    // אם 'all' נבחר → השאר רק אותו
    if (selectedIds.includes('all')) {
      onChange(['all']);
      return;
    }

    // מגבלת פרמטרים לפי סוג תצוגה
    const maxParm = view === 'profilePlayer' ? 4 : 2;
    if (selectedIds.length > maxParm) return;

    onChange(selectedIds);
  };

  const handleRemoveChip = (idToRemove, e) => {
    e.stopPropagation();

    const removeId = typeof idToRemove === 'string' ? idToRemove : idToRemove.value;

    const updated = value.filter((id) => {
      const currentId = typeof id === 'string' ? id : id.value;
      return currentId !== removeId;
    });

    onChange(updated);
  };

  const renderValue = (selected) => {
    if (!selected || selected.length === 0) return 'בחר תצוגה';

    const selectedIds = selected.map((s) =>
      typeof s === 'string' ? s : s.value
    );

    if (selectedIds.includes('all')) {
      return (
        <Chip
          size="sm"
          variant="soft"
          endDecorator={
            <ChipDelete
              onClick={(e) => handleRemoveChip('all', e)}
              sx={{ mr: 0.2 }}
            />
          }
        >
          כל השדות
        </Chip>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selectedIds.map((id) => {
          const opt = statsMobileGroupViewOptions.find((o) => o.id === id);
          return (
            <Chip
              key={id}
              size="sm"
              variant="soft"
              endDecorator={
                <ChipDelete
                  onClick={(e) => handleRemoveChip(id, e)}
                  sx={{ mr: 0.2 }}
                />
              }
            >
              {opt?.labelH || id}
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
        onChange={handleChange}
        placeholder="בחר פרמטרים לתצוגה"
        indicator="▼"
        renderValue={renderValue}
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%',
              p: 0.3,
            },
          },
        }}
      >
        {view === 'profilePlayer' && (
          <Option value="all">
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: 'all' })}
              כל השדות
            </Stack>
          </Option>
        )}
        {statsMobileGroupViewOptions.map((opt) => (
          <Option key={opt.id} value={opt.id}>
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: opt.idIcon })}
              <Typography level="body-sm">{opt.labelH}</Typography>
            </Stack>
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}
