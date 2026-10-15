// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamSeasonPicker.js

import { Box, Chip, Typography } from '@mui/joy'

import { teamInformationSx as sx } from '../sx/teamInformation.sx.js'

export default function TeamSeasonPicker({ seasons = [], onSelect }) {
  if (!seasons.length) return null

  return (
    <Box className='dpScrollThin' sx={sx.rosterSeasonChips} aria-label='בחירת עונה לשנתון'>
      {seasons.map(season => (
        <Chip
          key={season.key}
          component='button'
          type='button'
          aria-pressed={season.selected}
          size='sm'
          variant='soft'
          color='neutral'
          sx={[sx.rosterSeasonChip, season.selected && sx.rosterSeasonChipSelected]}
          onClick={() => onSelect?.(season.optionKey)}
        >
          <Box sx={sx.rosterSeasonChipContent}>
            <Typography component='span' sx={sx.rosterSeasonChipText}>{season.label}</Typography>
          </Box>
        </Chip>
      ))}
    </Box>
  )
}
