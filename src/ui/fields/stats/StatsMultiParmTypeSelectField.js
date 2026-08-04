// ui/fields/stats/StatsMultiParmTypeSelectField.js

import React from 'react';
import {
  Box,
  Chip,
  ChipDelete,
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
} from '@mui/joy';
import { iconUi } from '../../core/icons/iconUi.js';
import { statsParmOptions } from '../../../shared/stats/stats.options.js';

const options = statsParmOptions.filter((option) => option.id !== 'all');
const optionIds = options.map((option) => option.id);

export default function StatsMultiParmTypeSelectField({
  value = [],
  onChange,
  error = false,
  disabled = false,
  required = false,
  readOnly = false,
  label,
  size = 'sm',
}) {
  const selectedValues = Array.isArray(value)
    ? value
    : [];

  const emitChange = (nextValue) => {
    if (typeof onChange !== 'function') return;
    onChange(nextValue);
  };

  const handleRemoveChip = (selected, event) => {
    event.stopPropagation();
    emitChange(selectedValues.filter((id) => id !== selected.value));
  };

  const handleChange = (_, nextValue) => {
    if (nextValue.includes('all')) {
      const isAllSelected = selectedValues.length === optionIds.length;
      emitChange(isAllSelected ? [] : optionIds);
      return;
    }

    emitChange(nextValue);
  };

  const renderValue = (selected) => {
    if (!selected || selected.length === 0) {
      return 'בחר פרמטרים';
    }

    if (selected.length === optionIds.length) {
      return (
        <Chip size="sm" variant="soft" color="primary">
          כל הפרמטרים
        </Chip>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
        }}
      >
        {selected.map((selectedItem) => {
          const option = statsParmOptions.find((item) => (
            item.id === selectedItem.value
          ));

          return (
            <Chip
              key={selectedItem.value}
              size="sm"
              variant="soft"
              endDecorator={(
                <ChipDelete
                  onClick={(event) => {
                    handleRemoveChip(selectedItem, event);
                  }}
                  sx={{ mr: 0.2 }}
                />
              )}
            >
              {option ? option.labelH : selectedItem.value}
            </Chip>
          );
        })}
      </Box>
    );
  };

  return (
    <FormControl
      error={error}
      required={required}
      disabled={disabled}
      sx={{ width: '100%' }}
    >
      {label ? (
        <FormLabel required={required} sx={{ fontSize: 12 }}>
          {label}
        </FormLabel>
      ) : null}

      <Select
        multiple
        value={selectedValues}
        size={size}
        disabled={disabled || readOnly}
        onChange={handleChange}
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
        {statsParmOptions.map((option) => (
          <Option key={option.id} value={option.id}>
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: option.idIcon })}
              {option.labelH}
            </Stack>
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}
