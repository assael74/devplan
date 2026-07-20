// features/playersDatabase/components/profilesPage/toolbar/toolbar.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

const palette = {
  line: alpha(devPlanColors.primaryDark, 0.12),
  ink: devPlanColors.primaryDark,
  muted: alpha(devPlanColors.primaryDark, 0.68),
  soft: alpha(devPlanColors.primaryLight, 0.6),
  softBorder: alpha(devPlanColors.primary, 0.32),
  softSelected: alpha(devPlanColors.primary, 0.14),
  selectedStart: '#173b57',
  selectedMid: '#245273',
  selectedEnd: '#4c87b1',
}

export const toolbarSx = {
  root: {
    px: 1,
    py: 0.75,
    borderBottom: `1px solid ${palette.line}`,
    display: 'grid',
    gap: 0.85,
    alignItems: 'stretch',
    bgcolor: devPlanColors.primaryLight,
  },

  main: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: '220px 220px 220px 220px minmax(0, 1fr)',
    },
    gap: 0.75,
    alignItems: 'center',
  },

  mainWithoutRegion: {
    gridTemplateColumns: {
      xs: '1fr',
      xl: '220px 220px 220px minmax(0, 1fr)',
    },
  },

  field: {
    borderRadius: '8px',
  },

  label: {
    color: 'text.secondary',
    fontWeight: 700,
    fontSize: '0.68rem',
  },

  selectValue: selected => ({
    fontWeight: 600,
    color: selected ? 'text.primary' : 'text.tertiary',
  }),

  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.5,
    minWidth: 0,
    justifySelf: 'stretch',
    '& button': {
      minHeight: 24,
      borderRadius: '8px',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      flex: '0 0 auto',
    },
  },

  secondaryArea: {
    width: '100%',
    display: 'grid',
    alignItems: 'center',
    gap: 0.5,
    minHeight: 30,
    p: 0.35,
    borderRadius: '10px',
    border: `1px solid ${palette.line}`,
    bgcolor: alpha(devPlanColors.primaryLight, 0.82),
  },

  hint: {
    color: palette.ink,
    fontWeight: 700,
    fontSize: '0.86rem',
    px: 0.65,
    display: 'flex',
    alignItems: 'center',
    minHeight: 30,
    letterSpacing: 0.1,
  },

  chipRow: {
    width: '100%',
    display: 'flex',
    gap: 0.35,
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    minHeight: 30,
    p: 0.35,
    bgcolor: 'transparent',
    borderRadius: '10px',
    overflowX: 'auto',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
  },

  chipCardBody: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  chipCard: {
    flex: '0 0 auto',
    minWidth: 0,
    maxWidth: '100%',
    border: `1px solid ${palette.line}`,
    borderRadius: 'md',
    bgcolor: '#ffffff',
    p: '0.2rem 0.55rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.55,
    appearance: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    transition:
      'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
    boxShadow: `0 1px 0 ${alpha(devPlanColors.primaryDark, 0.02)}`,
    position: 'relative',
    color: palette.ink,
    '& .MuiTypography-root': {
      color: 'inherit',
    },
    '& .MuiSvgIcon-root, & svg': {
      color: alpha(devPlanColors.primaryDark, 0.78),
    },
    '&:hover': {
      zIndex: 2,
      borderColor: palette.softBorder,
      bgcolor: palette.soft,
      boxShadow: `0 6px 14px ${alpha(devPlanColors.primaryDark, 0.08)}`,
      transform: 'translateY(-1px)',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.45,
      bgcolor: alpha(devPlanColors.primaryLight, 0.4),
      borderColor: alpha(devPlanColors.primaryDark, 0.08),
      '&:hover': {
        borderColor: alpha(devPlanColors.primaryDark, 0.08),
        bgcolor: alpha(devPlanColors.primaryLight, 0.4),
      },
    },
  },

  chipCardSelected: {
    bgcolor: palette.softSelected,
    backgroundImage: `linear-gradient(135deg, ${palette.selectedStart} 0%, ${palette.selectedMid} 52%, ${palette.selectedEnd} 100%)`,
    borderColor: alpha('#7fc4f0', 0.9),
    boxShadow: `0 0 0 1px ${alpha('#7fc4f0', 0.28)}, 0 10px 22px ${alpha(devPlanColors.primaryDark, 0.18)}`,
    color: '#ffffff',
    '& .MuiTypography-root, & .MuiSvgIcon-root, & svg': {
      color: 'inherit',
    },
    '& .MuiChip-startDecorator': {
      color: '#ffffff',
    },
    '& .MuiChip-deleteIcon': {
      color: 'rgba(255, 255, 255, 0.9)',
    },
    '&:hover': {
      borderColor: alpha('#b6e0fb', 0.96),
      backgroundImage: `linear-gradient(135deg, #11283a 0%, #2b5e84 54%, #5a96c1 100%)`,
      boxShadow: `0 0 0 1px ${alpha('#b6e0fb', 0.34)}, 0 12px 24px ${alpha(devPlanColors.primaryDark, 0.22)}`,
    },
  },

  chipCardTitle: {
    minWidth: 0,
    maxWidth: 104,
    fontWeight: 700,
    lineHeight: 1.05,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    fontSize: '0.7rem',
  },

  chipCardSubtitle: {
    minWidth: 0,
    maxWidth: 104,
    color: palette.muted,
    fontWeight: 700,
    lineHeight: 1.05,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    fontSize: 8,
  },

  chipCardMetrics: selected => ({
    display: 'inline-flex',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    gap: 0.4,
    minWidth: 0,
    color: selected ? alpha(devPlanColors.primaryLight, 0.92) : alpha(devPlanColors.primary, 0.82),
    fontWeight: 700,
    fontSize: 10,
    ml: 0.35,
  }),

  chipMetric: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.4,
    lineHeight: 1,
  },

  chipMetricValue: {
    color: palette.ink,
    fontWeight: 700,
    fontSize: 10,
  },

  chipIcon: {
    fontSize: 13,
  },
}
