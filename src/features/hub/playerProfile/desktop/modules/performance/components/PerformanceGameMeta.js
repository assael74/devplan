// src/features/players/playerProfile/modules/performance/components/PerformanceGameMeta.js

import { Box, Typography } from '@mui/joy'
import { getFullDateIl, getDayName, timeAgoIl, getTimeUntilMeeting } from '../../../../../../../shared/format/dateUtiles.js'

export default function PerformanceGameMeta({ e, variant = 'played', isMobile }) {
  const date = e?.date
  const hour = e?.hour

  if (!date) return null

  // 🟢 משחקים ששוחקו
  if (variant === 'played') {
    const ago = timeAgoIl({ date, hour })

    return (
      <Box sx={{ mt: 0.35, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Typography level="body-xs" sx={{ opacity: 0.8 }}>
          {getFullDateIl(date, isMobile)}
          {hour ? ` · ${hour}` : ''}
        </Typography>

        {ago && (
          <Typography level="body-xs" sx={{ opacity: 0.65 }} noWrap>
            {ago}
          </Typography>
        )}
      </Box>
    )
  }

  // 🔵 משחקים קרובים
  const dayName = getDayName(date, isMobile)
  const until = getTimeUntilMeeting({ meetingDate: date, meetingHour: hour })

  return (
    <Box sx={{ mt: 0.35, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography level="body-xs" sx={{ opacity: 0.85 }} noWrap>
        {dayName} · {getFullDateIl(date, isMobile)}
        {hour ? ` · ${hour}` : ''}
      </Typography>

      {until && (
        <Typography level="body-xs" sx={{ opacity: 0.65 }} noWrap>
          {until}
        </Typography>
      )}
    </Box>
  )
}
