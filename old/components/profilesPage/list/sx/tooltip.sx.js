// features/playersDatabase/components/profilesPage/list/sx/tooltip.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  ink: devPlanColors.primaryDark,
  muted: alpha(devPlanColors.primaryDark, 0.68),
}

export const tooltipSx = {
  infoIconWrap: {
    width: 18,
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '999px',
    color: devPlanColors.primaryDark,
    bgcolor: alpha(devPlanColors.primary, 0.12),
    border: `1px solid ${alpha(devPlanColors.primaryDark, 0.16)}`,
    boxShadow: `0 1px 2px ${alpha(devPlanColors.primaryDark, 0.08)}`,
    flex: '0 0 auto',
    cursor: 'help',
    transition: 'transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
    '&:hover': {
      bgcolor: alpha(devPlanColors.primary, 0.2),
      borderColor: alpha(devPlanColors.primaryDark, 0.28),
      transform: 'translateY(-1px)',
    },
  },

  infoIconWrapDisabled: {
    opacity: 0.55,
    cursor: 'default',
    pointerEvents: 'none',
    bgcolor: alpha(devPlanColors.primaryDark, 0.06),
    borderColor: alpha(devPlanColors.primaryDark, 0.08),
    boxShadow: `0 1px 1px ${alpha(devPlanColors.primaryDark, 0.04)}`,
    '&:hover': {
      bgcolor: alpha(devPlanColors.primaryDark, 0.06),
      borderColor: alpha(devPlanColors.primaryDark, 0.08),
      transform: 'none',
    },
  },

  infoIcon: {
    fontSize: 15,
  },

  infoIconPositive: {
    color: '#15803d',
  },

  infoIconMixed: {
    color: '#d97706',
  },

  infoIconNegative: {
    color: '#dc2626',
  },

  infoIconNeutral: {
    color: alpha(devPlanColors.primaryDark, 0.7),
  },

  infoIconHasNotes: {
    color: '#15803d',
  },

  tooltip: {
    minWidth: 0,
    maxWidth: 240,
    p: 1.15,
    display: 'grid',
    gap: 1,
  },

  title: {
    color: palette.ink,
    fontWeight: 700,
    lineHeight: 1.1,
  },

  section: {
    display: 'grid',
    gap: 0.25,
  },

  sectionTitle: {
    color: palette.ink,
    fontWeight: 700,
    lineHeight: 1.1,
  },

  stats: {
    display: 'grid',
    gap: 0.2,
  },

  noteText: {
    color: palette.ink,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontWeight: 700,
  },

  emptyText: {
    color: palette.muted,
    lineHeight: 1.35,
    fontWeight: 700,
  },

  metricRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  statLabel: {
    color: palette.muted,
    lineHeight: 1.25,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  statValue: {
    color: palette.ink,
    lineHeight: 1.25,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  statValuePositive: {
    color: '#15803d',
  },

  statValueNegative: {
    color: '#dc2626',
  },
}
