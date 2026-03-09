import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Stack, Chip } from '@mui/joy';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';
import { optionProjectStatus } from '../../../x_utils/optionLists.js';

export default function ProjectStatusSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'סטטוס פניה',
  size = 'sm'
}) {
  const safeValue = value === '' ? null : value;
  const isValueOn = value !== ''

  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        value={safeValue}
        size={size}
        disabled={disabled}
        onChange={(_, val) => onChange(val ?? '')}
        placeholder="בחר סטטוס"
        indicator="▼"
        renderValue={(option) => {
          if (!option) return null;
          const opt = optionProjectStatus.find(o => o.id === option.value);
          if (!opt) return option.label ?? null;

          return (
            <Chip
              size="sm"
              variant="soft"
              sx={{ px: 1, backgroundColor: opt.color }}
              startDecorator={iconUi({ id: opt.idIcon, size: 'sm' })}
            >
              {opt.labelH}
            </Chip>
          );
        }}
        slotProps={{
          listbox: {
            sx: { maxHeight: 240, width: '100%' },
          },
          button: { sx: { py: 0.5 } },
        }}
      >
        {isValueOn && (
          <Option key='' value='' label='הסרת השחקן' >
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: 'remove' })}
              הסרת שחקן מהתהליך
            </Stack>
          </Option>
        )}
        {optionProjectStatus.map((opt) => (
          <Option
            key={opt.id}
            value={opt.id}
            label={opt.labelH}
            sx={(theme) => {
              const palette = theme.vars.palette[opt.color] || theme.vars.palette.neutral;
              return {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: opt.color,
                color: palette.softColor,
                '&:hover': {
                  backgroundColor: palette.softHoverBg,
                  color: palette.softColor,
                },
                borderRight: `4px solid ${palette.solidBg}`,
                pr: 1,
              };
            }}
          >
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
