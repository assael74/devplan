import { Box, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

const clean = value => String(value || '').trim().toLowerCase()

const ROSTER_STATUS_PRESENTATION = Object.freeze({
  youngerAgeGroup: Object.freeze({
    label: 'שנתון צעיר',
    iconId: 'rosterYounger',
    color: 'primary',
  }),
  retired: Object.freeze({
    label: 'פרש',
    iconId: 'rosterRetired',
    color: 'neutral',
  }),
  transferredin: Object.freeze({
    label: 'הצטרף במהלך העונה',
    iconId: 'rosterJoined',
    color: 'success',
  }),
})

const TRANSFER_DIRECTION_PRESENTATION = Object.freeze({
  up: Object.freeze({
    label: 'עבר לקבוצה ברמה גבוהה יותר',
    iconId: 'sortUp',
    color: 'success',
  }),
  down: Object.freeze({
    label: 'עבר לקבוצה ברמה נמוכה יותר',
    iconId: 'sortDown',
    color: 'danger',
  }),
  lateral: Object.freeze({
    label: 'עבר לקבוצה באותה רמה',
    iconId: 'swapVert',
    color: 'primary',
  }),
})

export const resolvePlayerRosterStatusPresentation = ({
  rosterStatus = '',
  manualTransferDirection = '',
  isYoungerAgeGroup = false,
} = {}) => {
  const status = clean(rosterStatus)

  if (status === 'transferredout') {
    return TRANSFER_DIRECTION_PRESENTATION[clean(manualTransferDirection)] || {
      label: 'עבר קבוצה במהלך העונה',
      iconId: 'rosterLeft',
      color: 'danger',
    }
  }

  if (isYoungerAgeGroup || status === 'youngeragegroup') {
    return ROSTER_STATUS_PRESENTATION.youngerAgeGroup
  }

  return ROSTER_STATUS_PRESENTATION[status] || null
}

const badgeSx = ({ color }, size) => ({
  width: size,
  height: size,
  minWidth: size,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  color: `var(--joy-palette-${color}-700)`,
  bgcolor: `var(--joy-palette-${color}-100)`,
  border: `1px solid var(--joy-palette-${color}-300)`,
  lineHeight: 1,
  '& svg': { fontSize: Math.round(size * 0.65) },
})

export default function PlayerRosterStatusBadge({
  rosterStatus = '',
  manualTransferDirection = '',
  isYoungerAgeGroup = false,
  size = 20,
  sx,
}) {
  const presentation = resolvePlayerRosterStatusPresentation({
    rosterStatus,
    manualTransferDirection,
    isYoungerAgeGroup,
  })

  if (!presentation) return null

  return (
    <Tooltip title={presentation.label}>
      <Box
        component='span'
        aria-label={presentation.label}
        sx={[badgeSx(presentation, size), sx]}
      >
        {iconUi({ id: presentation.iconId, size: 'sm' })}
      </Box>
    </Tooltip>
  )
}
