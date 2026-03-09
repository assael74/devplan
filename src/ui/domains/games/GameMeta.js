// ui/games/GameMeta.js
import { Box, Typography } from '@mui/joy'
import { getFullDateIl, getDayName, timeAgoIl, getTimeUntilMeeting } from '../../../shared/format/dateUtiles.js'

export default function GameMeta({ e, variant = 'played' }) {
  const date = e?.dateRaw || e?.game?.gameDate
  const hour = e?.game?.gameHour || e?.hour

  if (!date) return null

  if (variant === 'played') {
    const ago = timeAgoIl({ date, hour })

    return (
      <Box sx={{ mt: 0.35, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Typography level="body-xs" sx={{ opacity: 0.8 }}>
          {getFullDateIl(date)}
          {hour ? ` · ${hour}` : ''}
        </Typography>

        {ago ? (
          <Typography level="body-xs" sx={{ opacity: 0.65 }} noWrap>
            {ago}
          </Typography>
        ) : null}
      </Box>
    )
  }

  const dayName = getDayName(date)
  const until = getTimeUntilMeeting({ meetingDate: date, meetingHour: hour })

  return (
    <Box sx={{ mt: 0.35, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography level="body-xs" sx={{ opacity: 0.85 }} noWrap>
        {dayName} · {getFullDateIl(date)}
        {hour ? ` · ${hour}` : ''}
      </Typography>

      {until ? (
        <Typography level="body-xs" sx={{ opacity: 0.65 }} noWrap>
          {until}
        </Typography>
      ) : null}
    </Box>
  )
}
