import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { scoutStatusChipSx as sx } from './sx/scoutStatusChip.sx.js'

const CHIP_META = {
  immediacy: {
    watch: { label: 'מעקב', iconId: 'hour', tone: 'watch' },
    priority: { label: 'עדיפות גבוהה', iconId: 'highPriority', tone: 'priority' },
    immediate: { label: 'לבדוק עכשיו', iconId: 'immediateReview', tone: 'immediate' },
    remove: { label: 'הוסר', iconId: 'notActive', tone: 'neutral' },
    unknown: { label: 'לא נקבעה', iconId: 'noData', tone: 'neutral' },
  },
  interest: {
    reasonable: { label: 'עניין סביר', iconId: 'view', tone: 'reasonable' },
    curious: { label: 'מסקרן', iconId: 'targets', tone: 'curious' },
    interesting: { label: 'מעניין', iconId: 'insights', tone: 'interesting' },
    super_interesting: { label: 'מעניין מאוד', iconId: 'strength', tone: 'superInteresting' },
    unknown: { label: 'לא נקבע', iconId: 'noData', tone: 'neutral' },
  },
}

const normalizeValue = value => String(value || '').trim().toLowerCase()

export default function ScoutStatusChip({
  type = 'immediacy',
  value = 'unknown',
  label = '',
  iconId = '',
  size = 'md',
  selected = false,
  meta = '',
  tooltip = '',
  onClick,
}) {
  const family = CHIP_META[type] || CHIP_META.immediacy
  const chip = family[normalizeValue(value)] || family.unknown
  const interactive = typeof onClick === 'function'
  const content = (
    <Box
      component={interactive ? 'button' : 'span'}
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      aria-label={[label || chip.label, meta].filter(Boolean).join(', ')}
      sx={sx.root({ size, tone: chip.tone, selected, interactive })}
    >
      <Box aria-hidden='true' sx={sx.icon({ size })}>
        {iconUi({ id: iconId || chip.iconId, size: 'sm' })}
      </Box>
      <Typography component='span' sx={sx.label({ size })}>{label || chip.label}</Typography>
      {meta !== '' && meta !== null && meta !== undefined ? (
        <Typography component='span' sx={sx.meta({ size })}>{meta}</Typography>
      ) : null}
    </Box>
  )

  if (!tooltip) return content

  return (
    <Tooltip title={tooltip} arrow>
      {content}
    </Tooltip>
  )
}
