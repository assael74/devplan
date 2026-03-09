import * as React from 'react';
import { extendTheme } from '@mui/joy/styles';
import { CssVarsProvider } from '@mui/joy/styles';
import { typeBackground, chipColorTheme } from '../../../b_styleObjects/Colors.js'
import { chipTypeProps } from './X_Style'
import { iconUi } from '../../../b_styleObjects/icons/IconIndex';
import { Box, Typography, Chip } from '@mui/joy';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';

export default function GameViewTypeSelector({ value = 'teams', onChange, label, id, size = 'sm' }) {
  return (
    <CssVarsProvider theme={chipColorTheme}>
      <FormControl>
        <Chip
          color={value}
          variant="solid"
          size={size}
          onClick={() => onChange(value === 'teams' ? 'players' : 'teams')}
          startDecorator={iconUi({ id: value , sx: { ml: 0.5 } })}
          {...chipTypeProps}
          >
          {value !== 'teams' ? 'שחקנים' : 'קבוצה'}
          </Chip>
      </FormControl>
    </CssVarsProvider>

  );
}
