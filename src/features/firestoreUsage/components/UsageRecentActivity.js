import React from 'react'
import {
  Box,
  Card,
  Chip,
  Typography,
} from '@mui/joy'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const formatTime = value => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('he-IL', {
    timeStyle: 'medium',
  }).format(date)
}

export default function UsageRecentActivity({
  entries = [],
  onEntryClick,
}) {
  const rows = entries.slice(0, 5)

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 'lg', boxShadow: 'sm' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.5,
        }}
      >
        <Typography level="title-lg">
          מה השתנה עכשיו
        </Typography>

        <Chip size="sm" variant="soft" color="primary">
          אחרונים
        </Chip>
      </Box>

      {rows.length === 0 ? (
        <Typography level="body-sm" textColor="text.tertiary">
          אין עדיין אירועים אחרונים בסשן.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {rows.map((entry, index) => (
            <Box
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => onEntryClick?.(entry)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onEntryClick?.(entry)
                }
              }}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 1,
                p: 1,
                borderRadius: 'md',
                bgcolor: index === 0 ? 'primary.softBg' : 'background.level1',
                cursor: 'pointer',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography level="body-sm" fontWeight="lg" noWrap>
                  {entry.action}
                </Typography>

                <Typography level="body-xs" textColor="text.tertiary" noWrap>
                  {entry.feature} · {entry.collection} · {entry.operation}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'left', direction: 'ltr' }}>
                <Typography level="body-xs" textColor="text.tertiary">
                  {formatTime(entry.createdAt)}
                </Typography>

                <Typography level="body-xs" fontWeight="lg">
                  {numberFormatter.format(entry.totalEstimatedKb)} KB
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  )
}
