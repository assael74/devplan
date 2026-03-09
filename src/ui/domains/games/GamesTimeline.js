// ui/games/GamesTimeline.js
import { Box, Typography } from '@mui/joy'
import GameCard from './GameCard.js'
import { gamesUiSx as sx } from './games.sx.js'

export default function GamesTimeline({
  events = [],
  variant = 'played',
  clubAvatarSrc,
  onEdit,
  emptyText = 'אין פריטים',
  limit = 50,
}) {
  if (!events.length) {
    return (
      <Typography level="body-sm" sx={{ opacity: 0.75 }}>
        {emptyText}
      </Typography>
    )
  }

  return (
    <Box sx={sx.timelineList}>
      {events.slice(0, limit).map((e) => (
        <GameCard
          key={e.id}
          e={e}
          variant={variant}
          clubAvatarSrc={clubAvatarSrc}
          onEdit={onEdit}
        />
      ))}
    </Box>
  )
}
