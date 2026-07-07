// features/playersDatabase/components/profilesPage/list/listToolbar/listToolbar.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const palette = {
  line: '#d8e0e7',
}

export const listToolbarSx = {
  root: {
    px: 1,
    pb: 0.75,
    pt: 0.35,
    border: `1px solid ${palette.line}`,
    borderTop: `3px solid ${alpha(devPlanColors.secondary, 0.92)}`,
    borderLeft: `1px solid ${alpha(devPlanColors.secondary, 0.92)}`,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    bgcolor: '#f4f8fb',
    display: 'grid',
    gap: 0.75,
    //minHeight: 90,
    //maxHeight: 90,
    //height: 90,
    boxShadow: `0 12px 26px rgba(12, 24, 36, 0.16)`,
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
    bgcolor: devPlanColors.primary,
    color: '#ffffff',
    borderRadius: '8px',
    fontWeight: 700,
    '&:hover': {
      bgcolor: devPlanColors.secondary,
    },
  },

  actionPrintButton: {
    bgcolor: devPlanColors.primary,
    color: '#ffffff',
    borderRadius: '8px',
    fontWeight: 700,
    '&:hover': {
      bgcolor: devPlanColors.secondary,
    },
  },

  printCount: {
    px: 0.75,
    py: 0.45,
    borderRadius: '8px',
    bgcolor: '#ffffff',
    border: `1px solid ${palette.line}`,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    whiteSpace: 'nowrap',
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
}
