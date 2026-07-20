// features/playersDatabase/components/profilesPage/list/sx/noteTooltip.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  ink: devPlanColors.primaryDark,
  muted: alpha(devPlanColors.primaryDark, 0.58),
}

export const noteTooltipSx = {
  noteIconWrap: {
    width: 19,
    height: 19,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ml: 0.35,
    borderRadius: '6px',
    flex: '0 0 auto',
    cursor: 'help',
    transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease',
    border: `1px solid ${alpha(devPlanColors.primaryDark, 0.08)}`,
    bgcolor: alpha(devPlanColors.primaryDark, 0.03),
    '&:hover': {
      transform: 'translateY(-1px)',
    },
  },

  noteIconWrapHasNotes: {
    borderColor: alpha('#15803d', 0.22),
    bgcolor: alpha('#15803d', 0.08),
    '&:hover': {
      borderColor: alpha('#15803d', 0.3),
      bgcolor: alpha('#15803d', 0.12),
    },
  },

  noteIconWrapDisabled: {
    cursor: 'default',
    opacity: 0.5,
    pointerEvents: 'none',
    borderColor: alpha(devPlanColors.primaryDark, 0.06),
    bgcolor: alpha(devPlanColors.primaryDark, 0.02),
    transform: 'none',
    '&:hover': {
      transform: 'none',
      borderColor: alpha(devPlanColors.primaryDark, 0.06),
      bgcolor: alpha(devPlanColors.primaryDark, 0.02),
    },
  },

  noteIcon: {
    fontSize: 13,
  },

  noteIconNeutral: {
    color: alpha(devPlanColors.primaryDark, 0.58),
  },

  noteIconHasNotes: {
    color: '#15803d',
  },

  tooltip: {
    minWidth: 0,
    maxWidth: 260,
    p: 1.15,
    display: 'grid',
    gap: 0.75,
  },

  title: {
    color: palette.ink,
    fontWeight: 700,
    lineHeight: 1.1,
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
}
