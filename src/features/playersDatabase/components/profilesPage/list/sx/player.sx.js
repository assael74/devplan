// features/playersDatabase/components/profilesPage/list/sx/player.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  line: alpha(devPlanColors.primaryDark, 0.12),
  ink: devPlanColors.primaryDark,
  muted: alpha(devPlanColors.primaryDark, 0.68),
}

export const playerSx = {
  row: {
    width: '100%',
    minWidth: 0,
    border: `1px solid ${alpha(devPlanColors.primaryDark, 0.16)}`,
    borderRadius: '8px',
    bgcolor: alpha(devPlanColors.primaryLight, 0.18),
    p: 0.7,
    display: 'grid',
    gap: 0.55,
    boxShadow: `0 1px 2px ${alpha(devPlanColors.primaryDark, 0.05)}`,
    transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
    '&:hover': {
      borderColor: alpha(devPlanColors.secondary, 0.5),
      bgcolor: alpha(devPlanColors.primaryLight, 0.28),
      boxShadow: `0 8px 18px ${alpha(devPlanColors.primaryDark, 0.08)}`,
      transform: 'translateY(-1px)',
    },
  },

  rowClickable: {
    cursor: 'pointer',
  },

  rowStatic: {
    cursor: 'default',
  },

  rowLoading: {
    borderColor: alpha(devPlanColors.primary, 0.42),
    bgcolor: alpha(devPlanColors.primaryLight, 0.3),
    boxShadow: `0 0 0 1px ${alpha(devPlanColors.primary, 0.12)}, 0 6px 14px ${alpha(devPlanColors.primaryDark, 0.08)}`,
  },

  rowSelected: {
    borderColor: alpha(devPlanColors.secondary, 0.82),
    bgcolor: alpha(devPlanColors.secondary, 0.14),
    boxShadow: `0 0 0 1px ${alpha(devPlanColors.secondary, 0.18)}, 0 8px 20px ${alpha(devPlanColors.primaryDark, 0.1)}`,
    '&:hover': {
      borderColor: alpha(devPlanColors.secondary, 0.92),
      bgcolor: alpha(devPlanColors.secondary, 0.18),
      boxShadow: `0 0 0 1px ${alpha(devPlanColors.secondary, 0.24)}, 0 10px 22px ${alpha(devPlanColors.primaryDark, 0.12)}`,
      transform: 'translateY(-1px)',
    },
  },

  selectableStack: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gap: 0.45,
  },

  selectableActions: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.45,
  },

  checkbox: {
    mt: 0.4,
    flex: '0 0 auto',
  },

  mainCompact: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(0, 1fr)',
      lg: 'minmax(240px, 1.1fr) minmax(280px, 1.35fr) minmax(104px, 0.46fr)',
    },
    alignItems: 'center',
    gap: 1,
  },

  identityCellCompact: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  identityTextCompact: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.12,
  },

  identityHeadlineRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    flexWrap: 'wrap',
  },

  avatarCompact: {
    width: 34,
    height: 34,
    border: `1px solid ${palette.line}`,
    boxShadow: `0 4px 12px ${alpha(devPlanColors.primaryDark, 0.08)}`,
    flex: '0 0 auto',
  },

  rowTitle: {
    color: palette.ink,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  entityText: {
    minWidth: 0,
    color: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  entityLink: {
    minWidth: 0,
    color: 'inherit',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    '&:hover': {
      color: '#0b6bcb',
      textDecoration: 'underline',
    },
  },

  subtextCompact: {
    minWidth: 0,
    color: palette.muted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    mt: 0.05,
  },

  subtextDividerCompact: {
    color: palette.muted,
    flex: '0 0 auto',
  },

  teamInlineInfo: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.3,
    flex: '0 1 auto',
  },

  statsTableCompact: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    overflow: 'hidden',
    bgcolor: alpha(devPlanColors.primaryLight, 0.14),
  },

  statCellCompact: {
    minWidth: 0,
    minHeight: 46,
    px: 0.35,
    py: 0.35,
    borderInlineEnd: `1px solid ${palette.line}`,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    gap: 0.15,
  },

  statCellGoals: {
    bgcolor: alpha('#dff4e5', 0.9),
    color: '#1f5132',
    '& .MuiTypography-root': {
      color: 'inherit',
    },
  },

  statLabelCompact: {
    maxWidth: '100%',
    color: palette.muted,
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  statValueCompact: {
    minWidth: 0,
    color: palette.ink,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 1.1,
  },

  rowLoadingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.3,
    px: 0.45,
    py: 0.15,
    borderRadius: '999px',
    bgcolor: alpha(devPlanColors.primary, 0.1),
    color: palette.ink,
    fontWeight: 700,
    flex: '0 0 auto',
  },

  rowLoadingSpinner: {
    width: 14,
    height: 14,
    flex: '0 0 auto',
  },

  rowLoadingText: {
    fontWeight: 700,
    lineHeight: 1,
  },
}
