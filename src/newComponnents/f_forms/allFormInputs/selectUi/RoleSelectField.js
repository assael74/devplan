import * as React from 'react';
import playerImage from '../../../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';
import { STAFF_ROLE_OPTIONS } from '../../../x_utils/optionLists.js';
import { FormControl, FormLabel, Select, Option, Typography, Stack, Avatar, Box } from '@mui/joy';

export default function RoleSelectField({
  value,
  label,
  onChange,
  required,
  formProps = {},
  size = 'sm',
  options = [],
  error = false,
  disabled = false,
  placeholder = 'בחר איש צוות',
}) {
  const clubs = formProps?.clubs || [];
  const teams = formProps?.teams || [];

  const fontSize = size === 'sm' ? '0.775rem' : '0.975rem';

  const normOptions = React.useMemo(() => {
    return options.map((t) => {
      const roleMeta = STAFF_ROLE_OPTIONS.find((i) => i.id === t.type) || {};
      const clubName = (clubs.find((c) => c.id === t.clubId)?.clubName) ?? 'לא משוייך';
      const teamName = (teams.find((tm) => tm.id === t.teamId)?.teamName) ?? 'לא משוייך';
      return {
        id: t.id,
        value: t.id, // הערך של ה-Option
        label: t.fullName ?? t.displayName ?? t.name ?? '',
        icon: roleMeta.idIcon,
        roleLabel: roleMeta.labelH ?? '',
        photo: t.photo || playerImage,
        clubName,
        teamName,
        raw: t, // האובייקט המקורי
      };
    });
  }, [options, clubs, teams]);

  const selectedId = React.useMemo(() => {
    if (value && typeof value === 'object') return value.id || '';
    if (typeof value === 'string') return value;
    return '';
  }, [value]);

  const selectedOpt = React.useMemo(
    () => normOptions.find((o) => o.value === selectedId),
    [normOptions, selectedId]
  );

  const handleChange = (_e, newId) => {
    const obj = options.find((o) => o.id === newId) || null;
    onChange?.(obj);
  };

  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label || 'בחר איש צוות'}</FormLabel>

      <Select
        size={size}
        disabled={disabled}
        value={selectedId || null}
        onChange={handleChange}
        placeholder={placeholder}
        renderValue={() => (selectedOpt ? selectedOpt.label : '')}
        slotProps={{
          listbox: { sx: { maxHeight: 240, width: '100%' } },
          button: { sx: { fontSize, fontWeight: 500, color: '#333' } },
        }}
      >
        {normOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <Stack direction="row" gap={1.5} alignItems="flex-start">
              <Avatar size="sm" src={opt.photo} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {opt.icon ? iconUi({ id: opt.icon, size: 'xs' }) : null}
                  <Typography level="body-sm" fontWeight="md">
                    {opt.label}
                  </Typography>
                </Box>
                <Typography level="body-xs" color="neutral" sx={{ mt: 0.2 }}>
                  {opt.teamName} | {opt.clubName}
                </Typography>
              </Box>
            </Stack>
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}
