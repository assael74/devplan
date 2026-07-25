// src/features/playersDatabase/ui/pages/entryPage/sx/entryContent.info.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const entryContentInfoSx = {
  infoGrid: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1fr) 360px',
    },
    gap: 2,
    alignItems: 'stretch',
    overflow: 'hidden',

    '& > *': {
      minWidth: 0,
      minHeight: 0,
      height: '100%',
    },
  },

  capabilities: {
    height: 100,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    color: devPlanColors.secondary,
    pr: 0.75,

    '& p': {
      lineHeight: 1.55,
    },
  },

  statsGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1.25,

    '& > *': {
      minWidth: 0,
      minHeight: 98,
      maxHeight: 108,
      p: 1.25,
    },

    '& h2': {
      fontSize: 27,
      lineHeight: 1,
    },

    '& [class*="MuiTypography-body-sm"]': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 13,
    },

    '& [class*="MuiTypography-body-xs"]': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 11,
    },
  }
}
