import React from 'react';
import { typeSx as sx } from './sx/type.sx'
import { PLAYERS_TYPES } from '../../../../shared/players/players.constants.js'
import { iconUi } from '../../../core/icons/iconUi.js';
import { Sheet, Typography, Stack, Box, FormControl } from '@mui/joy';

export default function PlayerTypeSelector({ value, onChange, size = 'sm' }) {
  const fontSize = size === 'sm' ? '10px' : '14px'
  const levelTypo = size === 'sm' ? "body-xs" : "body-md"
  return (
    <FormControl>
      <Typography level="body-md" sx={{ fontSize: '12px', mb: 0.5, ml: 0.5, fontWeight: 500 }}>
        סוג שחקן
      </Typography>
      <Stack direction='row' spacing={1} sx={sx.stack}>
        {PLAYERS_TYPES.map((type) => (
          <Sheet variant="outlined" key={type.id} onClick={() => onChange(type.id)} sx={sx.sheet(value, type, size)}>
            <Typography
              level={levelTypo}
              fontWeight="md"
              textAlign='right'
              startDecorator={iconUi({ id: type.idIcon, size: size })}
              sx={{ fontSize: fontSize, whiteSpace: 'nowrap', pt: 0.2, pl: 0.2 }}
            >
              {type.labelH}
            </Typography>
          </Sheet>
        ))}
      </Stack>
    </FormControl>

  );
}
