// features/playersDatabase/components/profilesPage/list/listToolbar/listToolbar.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  line: '#d8e0e7',
  ink: '#17202a',
  muted: '#64717f',
}

export const listToolbarSx = {
  root: {
    px: 1,
    pb: 0.75,
    pt: 0.35,
    border: `1px solid ${palette.line}`,
    borderTop: `2px solid ${alpha(devPlanColors.secondary, 0.92)}`,
    borderLeft: `1px solid ${alpha(devPlanColors.secondary, 0.92)}`,
    borderRadius: '12px',
    bgcolor: '#f4f8fb',
    display: 'grid',
    gap: 0.75,
    minHeight: 90,
    maxHeight: 90,
    height: 90,
    boxShadow: `0 12px 26px rgba(12, 24, 36, 0.16)`,
  },

  railShell: {
    width: '100%',
    minWidth: 0,
  },

  chipsStrip: {
    minWidth: 0,
    width: '100%',
    flex: '1 1 auto',
    overflowX: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    whiteSpace: 'nowrap',
    py: 0.85,
    px: 0.25,
    borderRadius: '10px',
    background: 'transparent',
    border: `1px solid rgba(23, 32, 42, 0.05)`,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    scrollbarColor: 'transparent transparent',
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent',
      borderRadius: 999,
      border: 0,
    },
  },

  chipsShell: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    paddingInline: 1,
  },

  scrollButton: side => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 3,
    minWidth: 34,
    width: 34,
    height: 34,
    p: 0,
    borderRadius: '999px',
    border: `1px solid ${alpha(devPlanColors.secondary, 0.3)}`,
    bgcolor: devPlanColors.secondary,
    color: '#ffffff',
    boxShadow: `0 6px 14px ${alpha(devPlanColors.primaryDark, 0.18)}`,
    ...(side === 'left' ? { insetInlineStart: 0 } : { insetInlineEnd: 0 }),
    '&:hover': {
      bgcolor: devPlanColors.primary,
      borderColor: alpha(devPlanColors.secondary, 0.55),
    },
    '& .MuiSvgIcon-root, & svg': {
      color: '#ffffff',
    },
  }),

  chipRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 'fit-content',
    py: 0.2
  },

  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    minWidth: 0,
    borderTop: `1px solid rgba(23, 32, 42, 0.08)`,
    pt: 0.75,
  },

  actionButton: {
    bgcolor: devPlanColors.secondary,
    color: '#ffffff',
    borderRadius: '8px',
    fontWeight: 700,
    '&:hover': {
      bgcolor: devPlanColors.primary,
    },
  },

  actionPrintButton: {
    bgcolor: devPlanColors.secondary,
    color: '#ffffff',
    borderRadius: '8px',
    fontWeight: 700,
    '&:hover': {
      bgcolor: devPlanColors.primary,
    },
  },

  primaryActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
    '& button': {
      borderRadius: '8px',
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },
  },

  sortAction: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: '0 0 220px',
  },

  label: {
    color: 'text.secondary',
    fontWeight: 700,
  },

  empty: {
    color: 'text.secondary',
    fontWeight: 600,
  },
}
