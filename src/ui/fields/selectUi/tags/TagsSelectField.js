// ui/fields/selectUi/roles/RoleSelectField.js
import * as React from 'react';
import roleImage from '../../../core/images/roleImage.png';
import { iconUi } from '../../../core/icons/iconUi.js';
import { FormControl, FormLabel, Select, Option, Typography, Stack, Avatar, Box } from '@mui/joy';

export default function TagsSelectField({
  value,
  label,
  onChange,
  required,
  formProps = {},
  size = 'sm',
  options = [],
  error = false,
  disabled = false,
  placeholder = 'בחר איש ת',
}) {

  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

    </FormControl>
  );
}
