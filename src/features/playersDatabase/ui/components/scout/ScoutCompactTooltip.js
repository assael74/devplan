// features/playersDatabase/ui/components/scout/ScoutCompactTooltip.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { scoutCompactTooltipSx as sx } from './sx/scoutCompactTooltip.sx.js'

export default function ScoutCompactTooltip({
  title = 'פרופילי סקאוט',
  items = [],
  isCombination = false,
}) {
  return (
    <Box sx={sx.root}>
      <Typography level='title-sm' sx={sx.title}>
        {title}
      </Typography>

      {isCombination ? (
        <Typography level='body-xs' sx={sx.meta}>
          פרופיל משולב מתוך:
        </Typography>
      ) : null}

      <Box sx={sx.list}>
        {items.map(item => (
          <Typography
            key={item.id}
            level='body-sm'
            sx={sx.item}
          >
            {item.label}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}
