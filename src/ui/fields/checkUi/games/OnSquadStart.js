/// ui/fields/checkUi/games/OnSquadStart.js
import * as React from 'react';
import { Switch, Box, Typography }from '@mui/joy';

const typoStyle = (size) => ({
  fontSize: size === 'sm' ? '12px' : '14px',
  level:'body-sm',
  fontWeight:'lg',
  sx: {
    mb: size === 'sm' ? 1 : 0,
    mr: size === 'sm' ? 0 : 1
  }
})

export default function OnSquadStart({ value = true, onChange, size }) {
  const direction = size === 'sm' ? 'column' : 'row'
  return (
    <Box sx={{ display: 'flex', flexDirection: direction, alignItems: 'center' }}>
      <Typography {...typoStyle(size)}>
        בהרכב
      </Typography>
      <Switch checked={value} onChange={onChange} size={size} />
    </Box>
  );
}
