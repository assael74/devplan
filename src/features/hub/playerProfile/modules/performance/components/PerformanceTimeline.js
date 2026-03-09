import { Box, Typography } from '@mui/joy'
import PerformanceGameCard from './PerformanceGameCard'
import { timelineSx } from '../Performance.sx'

export default function PerformanceTimeline({
  events = [],
  variant = 'played',
  isMobile,
  clubAvatarSrc,
  onOpenVideo,
  emptyText,
  limit = 12,
}) {
  if (!events.length) {
    return <Typography level="body-sm" sx={{ opacity: 0.75 }}>{emptyText}</Typography>
  }

  return (
    <Box sx={timelineSx.list}>
      {events.slice(0, limit).map((e) => (
        <PerformanceGameCard
          key={e.id}
          e={e}
          variant={variant}
          isMobile={isMobile}
          clubAvatarSrc={clubAvatarSrc}
          onOpenVideo={onOpenVideo}
        />
      ))}
    </Box>
  )
}
