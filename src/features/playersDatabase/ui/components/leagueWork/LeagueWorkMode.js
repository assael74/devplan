// src/features/playersDatabase/ui/components/leagueWork/LeagueWorkMode.js

import { Button, Stack, Typography } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueWorkModeSx as sx } from './leagueWorkMode.sx.js'

export default function LeagueWorkMode({ researchMode = false, onChange }) {
  return (
    <Stack direction='row' sx={sx.workMode}>
      <Typography sx={sx.workModeLabel}>מצב עבודה</Typography>
      <Stack direction='row' role='group' aria-label='מצב עבודה' sx={sx.workModeButtons}>
        <Button
          size='sm'
          startDecorator={iconUi({ id: 'upload', size: 'small', sx: { fontSize: 16, color: 'inherit' } })}
          variant={!researchMode ? 'solid' : 'plain'}
          aria-pressed={!researchMode}
          onClick={() => onChange?.(false)}
          sx={sx.workModeButton(!researchMode)}
        >
          טעינה
        </Button>
        <Button
          size='sm'
          startDecorator={iconUi({ id: 'search', size: 'small', sx: { fontSize: 16, color: 'inherit' } })}
          variant={researchMode ? 'solid' : 'plain'}
          aria-pressed={researchMode}
          onClick={() => onChange?.(true)}
          sx={sx.workModeButton(researchMode)}
        >
          חקירה
        </Button>
      </Stack>
    </Stack>
  )
}
