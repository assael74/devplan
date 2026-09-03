import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamBalanceProfileSx as sx } from './sx/teamBalanceProfile.sx.js'

const RELIABILITY = {
  sufficient: 'תמונה מלאה',
  high: 'תמונה מלאה',
  medium: 'תמונה חלקית',
  partial: 'תמונה חלקית',
  low: 'מידע לא מספיק',
  insufficient: 'מידע לא מספיק',
  unavailable: 'מידע לא מספיק',
}

const MetricTooltip = ({ card, teamName }) => (
  <Box sx={sx.tooltipContent}>
    <Typography sx={sx.tooltipTitle}>{card.profileTitle || card.title}</Typography>
    <Typography sx={sx.tooltipLabel}>מה המדד בודק</Typography>
    <Typography sx={sx.tooltipText}>{card.description}</Typography>
    <Typography sx={sx.tooltipLabel}>מה נמצא בקבוצה הזאת</Typography>
    <Typography sx={sx.tooltipText}>
      {card.band
        ? `ב${teamName || 'קבוצה'}: ${card.profileFinding}`
        : card.availabilityReason}
    </Typography>
    {card.band ? (
      <>
        <Typography sx={sx.tooltipLabel}>מה המשמעות</Typography>
        <Typography sx={sx.tooltipText}>
          {card.profileImplication}
        </Typography>
      </>
    ) : null}
    <Typography sx={sx.tooltipTechnicalTitle}>איך מחושב</Typography>
    <Typography sx={sx.tooltipText}>{card.tooltip}</Typography>
  </Box>
)

const BalanceMetric = ({ card, teamName }) => (
  <Box sx={sx.metric}>
    <Box sx={sx.metricHeader}>
      <Typography sx={sx.metricTitle}>{card.profileTitle || card.title}</Typography>
      <Tooltip
        title={<MetricTooltip card={card} teamName={teamName} />}
        placement='bottom'
        variant='soft'
        slotProps={{ tooltip: { sx: sx.tooltip } }}
      >
        <Box component='span' sx={sx.info} aria-label={`הסבר על ${card.profileTitle || card.title}`}>
          {iconUi({ id: 'info', size: 'sm' })}
        </Box>
      </Tooltip>
    </Box>
    <Typography sx={[sx.metricValue, !card.band && sx.metricValueEmpty]}>
      {card.profileValue}
    </Typography>
    <Typography sx={sx.metricMeaning}>{card.profileFinding}</Typography>
  </Box>
)

export default function TeamBalanceProfileSection({ balance = null, teamName = '' }) {
  const reliabilityKey = String(balance?.reliability?.key || '').trim()
  const reliabilityLabel = RELIABILITY[reliabilityKey] || 'מידע לא מספיק'
  const cards = Array.isArray(balance?.cards) ? balance.cards : []

  return (
    <Box sx={sx.section}>
      <Box sx={sx.header}>
        <Typography sx={sx.title}>ניתוח סגל</Typography>
        <Tooltip
          title='חלק מהמדדים אינם זמינים, ולכן מוצגת תמונה חלקית של חלוקת הסגל.'
          placement='bottom'
          variant='soft'
          slotProps={{ tooltip: { sx: sx.reliabilityTooltip } }}
        >
          <Box sx={sx.reliability}>
            <Typography component='span' sx={sx.reliabilityLabel}>{reliabilityLabel}</Typography>
            {iconUi({ id: 'info', size: 'sm' })}
          </Box>
        </Tooltip>
      </Box>

      <Box sx={sx.metrics}>
        {cards.map(card => (
          <BalanceMetric
            key={card.key}
            card={card}
            teamName={teamName}
          />
        ))}
      </Box>
    </Box>
  )
}
