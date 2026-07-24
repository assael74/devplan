// features/playersDatabase/ui/pages/searchPage/results/SearchActiveQuery.js

import { Box, Chip, Typography } from '@mui/joy'

import { searchActiveQuerySx as sx } from './sx/searchActiveQuery.sx.js'

export default function SearchActiveQuery({
  items = [],
  onRemove,
  compact = false,
  label = 'פילטרים פעילים',
  emptyLabel = 'לא הוגדרו פילטרים.',
}) {
  return (
    <Box sx={compact ? sx.compact : sx.root}>
      {!compact && (
        <Typography level='body-xs' sx={sx.label}>
          {label}
        </Typography>
      )}

      <Box sx={sx.items}>
        {items.length ? items.map(item => (
          <Chip
            key={item.key}
            size='sm'
            variant='soft'
            sx={sx.chip}
            onClick={() => onRemove(item.key)}
          >
            {item.label}
          </Chip>
        )) : (
          <Typography level='body-xs' sx={sx.empty}>
            {emptyLabel}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
