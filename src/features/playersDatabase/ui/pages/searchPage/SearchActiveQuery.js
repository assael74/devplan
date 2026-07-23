// features/playersDatabase/ui/pages/searchPage/SearchActiveQuery.js

import { Box, Chip, Typography } from '@mui/joy'

import { searchResultsSx as sx } from './sx/searchResults.sx.js'

export default function SearchActiveQuery({ items, onRemove, compact = false }) {
  return (
    <Box sx={compact ? sx.activeQueryCompact : sx.activeQuery}>
      {!compact && (
        <Typography level='body-xs' sx={sx.activeQueryLabel}>חיפוש פעיל</Typography>
      )}

      <Box sx={sx.activeQueryItems}>
        {items.length ? items.map(item => (
          <Chip
            key={item.key}
            size='sm'
            variant='soft'
            sx={sx.activeChip}
            onClick={() => onRemove(item.key)}
          >
            {item.label}
          </Chip>
        )) : (
          <Typography level='body-xs' sx={sx.emptyQuery}>
            לא הוגדרו פילטרים — מוצגים כל השחקנים.
          </Typography>
        )}
      </Box>
    </Box>
  )
}
