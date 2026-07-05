// features/playersDatabase/components/profilesPage/list/sx/player.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  line: alpha(devPlanColors.primaryDark, 0.12),
  ink: devPlanColors.primaryDark,
  muted: alpha(devPlanColors.primaryDark, 0.68),
  red: '#b42318',
}

export const playerSx = {
  row: {
    width: '100%',
    minWidth: 0,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: alpha(devPlanColors.primaryLight, 0.2),
    p: 0.7,
    display: 'grid',
    gap: 0.55,
  },

  selectable: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'start',
    gap: 0.75,
  },

  selectableContent: {
    width: '100%',
    minWidth: 0,
  },

  checkbox: {
    mt: 0.4,
    flex: '0 0 auto',
  },

  main: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(0, 1fr)',
      lg: 'minmax(210px, 1.1fr) 220px minmax(420px, 2fr)',
    },
    alignItems: 'center',
    gap: 0.7,
  },

  identityCell: {
    minWidth: 0,
  },

  rowTitle: {
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  rowMeta: {
    color: palette.muted,
    mt: 0.25,
  },

  subtext: {
    minWidth: 0,
    mt: 0.25,
    color: palette.muted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
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

  subtextDivider: {
    color: palette.muted,
    flex: '0 0 auto',
  },

  positionCell: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0.5,
  },

  select: {
    minHeight: 34,
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    bgcolor: '#ffffff',
  },

  statsTable: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(3, minmax(0, 1fr))',
      md: 'repeat(5, minmax(0, 1fr))',
    },
    border: `1px solid ${palette.line}`,
    borderRadius: '8px',
    overflow: 'hidden',
    bgcolor: alpha(devPlanColors.primaryLight, 0.14),
  },

  statCell: {
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

  statLabel: {
    maxWidth: '100%',
    color: palette.muted,
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  statValue: {
    minWidth: 0,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 1.1,
  },

  statusRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  statusLeft: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 0.45,
  },

  statusActions: {
    marginInlineStart: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.45,
  },

  errorInline: {
    color: palette.red,
    fontWeight: 700,
  },

  editButton: {
    minWidth: 28,
    minHeight: 28,
    borderRadius: '8px',
  },

  fixedChip: {
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
  },
}
