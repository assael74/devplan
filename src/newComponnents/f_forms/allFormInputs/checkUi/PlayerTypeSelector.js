import React from 'react';
import { optionPlayerProps } from './X_Style'
import { optionTypePlayer } from '../../../x_utils/optionLists.js'
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import { Sheet, Typography, Stack, Box, FormControl } from '@mui/joy';

export default function PlayerTypeSelector({ value, onChange, size = 'sm' }) {
  const fontSize = size === 'sm' ? '11px' : '14px'
  const levelTypo = size === 'sm' ? "body-xs" : "body-md"
  return (
    <FormControl>
      <Typography level="body-md" sx={{ fontSize: '12px', mb: 1, ml: 0.5, fontWeight: 500 }}>
        סוג שחקן
      </Typography>
      <Stack
        direction='row'
        spacing={1}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 'md',
          p: 0.5,
          width: 'fit-content',
          bgcolor: 'background.level1',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {optionTypePlayer.map((type) => (
          <Sheet key={type.id} onClick={() => onChange(type.id)} {...optionPlayerProps(value, type, size)}>
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
