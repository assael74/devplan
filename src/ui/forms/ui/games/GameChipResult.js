import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import { FormControl, FormLabel, Chip, Box }from '@mui/joy';

export default function GameChipResult({
  goalsFor,
  goalsAgainst,
  size = 'sm'
}) {
  const gf = Number(goalsFor || 0)
  const ga = Number(goalsAgainst || 0)

  const resultLabel = goalsFor === '' || goalsAgainst === '' ? 'ללא תוצאה' : gf > ga ? 'ניצחון' : gf < ga ? 'הפסד' : 'תיקו'

  const resultColor = goalsFor === '' || goalsAgainst === '' ? 'neutral' : gf > ga ? 'success' : gf < ga ? 'danger' : 'warning'

  return (
    <FormControl sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px', visibility: 'hidden' }}>תוצאה</FormLabel>
      <Box sx={{ minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <Chip
          size={size}
          variant="soft"
          color={resultColor}
          sx={{
            width: '100%',
            justifyContent: 'center',
            fontWeight: 700,
          }}
          startDecorator={iconUi({id: 'result'})}
        >
          {resultLabel}
        </Chip>
      </Box>
    </FormControl>
  );
}
