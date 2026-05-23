// teamProfile/sharedUi/insights/teamGames/sections/cards/TeamScoringCards.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

const getToneByValue = ({
  value,
  good = 0,
  warning = -0.5,
}) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return 'neutral'
  if (n >= good) return 'success'
  if (n >= warning) return 'warning'

  return 'danger'
}

const getRatingTone = (rating) => {
  const n = Number(rating)

  if (!Number.isFinite(n)) return 'neutral'
  if (n >= 6.15) return 'success'
  if (n >= 5.9) return 'warning'

  return 'danger'
}

const formatSigned = (value) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return '—'
  if (n > 0) return `+${n.toFixed(2)}`

  return n.toFixed(2)
}

const formatValue = (value, fallback = '—') => {
  if (value === undefined || value === null || value === '') return fallback

  return value
}

const cardSx = (tone = 'neutral') => ({
  p: 1.25,
  minHeight: 112,
  borderRadius: 'xl',
  border: '1px solid',
  borderColor: `${tone}.outlinedBorder`,
  bgcolor: `${tone}.softBg`,
  display: 'grid',
  alignContent: 'space-between',
  gap: 1,
})

const gridSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(4, minmax(0, 1fr))',
  },
  gap: 1,
}

const topSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  minWidth: 0,
}

const titleSx = {
  color: 'text.secondary',
  fontWeight: 700,
}

const valueSx = {
  fontWeight: 700,
  lineHeight: 1,
}

const subSx = {
  color: 'text.tertiary',
  lineHeight: 1.35,
}

function MetricCard({
  title,
  value,
  sub,
  icon,
  tone,
}) {
  return (
    <Sheet variant="soft" sx={cardSx(tone)}>
      <Box sx={topSx}>
        <Typography level="body-sm" sx={titleSx}>
          {title}
        </Typography>

        <Box>
          {iconUi({
            id: icon || 'insights',
            size: 'sm',
          })}
        </Box>
      </Box>

      <Box>
        <Typography level="h3" sx={valueSx}>
          {value}
        </Typography>

        <Typography level="body-xs" sx={subSx}>
          {sub}
        </Typography>
      </Box>
    </Sheet>
  )
}

function EmptyScoringCard() {
  return (
    <Sheet variant="soft" sx={cardSx('neutral')}>
      <Box sx={topSx}>
        <Typography level="body-sm" sx={titleSx}>
          אין נתוני סקורינג
        </Typography>

        <Box>
          {iconUi({
            id: 'insights',
            size: 'sm',
          })}
        </Box>
      </Box>

      <Box>
        <Typography level="h3" sx={valueSx}>
          —
        </Typography>

        <Typography level="body-xs" sx={subSx}>
          המדד דורש משחקי ליגה ששוחקו, תוצאה ויעד קבוצה
        </Typography>
      </Box>
    </Sheet>
  )
}

export default function TeamScoringCards({ summary }) {
  if (!summary) {
    return (
      <Box sx={gridSx}>
        <EmptyScoringCard />
      </Box>
    )
  }
  
  return (
    <Box sx={gridSx}>
      <MetricCard
        title="מדד יעילות"
        value={formatValue(summary.teamRating)}
        sub="איכות ביצוע ביחס לציפייה"
        icon="insights"
        tone={getRatingTone(summary.teamRating)}
      />

      <MetricCard
        title="מדד השפעה"
        value={formatSigned(summary.tva)}
        sub="ערך מצטבר ביחס לציון 6.0"
        icon="impact"
        tone={getToneByValue({
          value: summary.tva,
          good: 0,
          warning: -0.5,
        })}
      />

      <MetricCard
        title="פער נקודות"
        value={formatSigned(summary.pointsPaceDelta)}
        sub={`${summary.actualPoints ?? 0} בפועל / ${summary.expectedPoints ?? 0} יעד`}
        icon="target"
        tone={getToneByValue({
          value: summary.pointsPaceDelta,
          good: 0,
          warning: -1,
        })}
      />

      <MetricCard
        title="מדגם"
        value={formatValue(summary.ratedGames)}
        sub={summary.reliability?.label || 'בדיקת אמינות'}
        icon="played"
        tone={summary.reliability?.level === 'high' ? 'success' : 'warning'}
      />
    </Box>
  )
}
