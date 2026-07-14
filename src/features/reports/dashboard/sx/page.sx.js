// src/features/reports/dashboard/sx/page.sx.js

import { devPlanColors } from '../../../../ui/core/theme/Colors.js'

export const pageSx = {
  page: {
    width: '100%',
    height: 'calc(100dvh - 64px)',
    maxHeight: 'calc(100dvh - 64px)',
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: '300px minmax(0, 1fr)',
    gridTemplateRows: '72px minmax(0, 1fr)',
    gridTemplateAreas: `
      "sidebar header"
      "sidebar view"
    `,
    gap: 1.5,
    p: 1.5,
    overflow: 'hidden',
    bgcolor: '#F4F7F9',
    borderRadius: 'sm',

    '@media (max-width: 820px)': {
      display: 'flex',
      flexDirection: 'column',
      height: 'auto',
      maxHeight: 'none',
      minHeight: '100%',
      overflowY: 'auto',
    },
  },

  workspace: {
    gridColumn: '2 / 3',
    gridRow: '1 / 3',
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: '72px minmax(0, 1fr)',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateAreas: `
      "header"
      "view"
    `,
    gap: 1.5,
    background: `linear-gradient(180deg, ${devPlanColors.primaryLight} 0px, #F4F7F9 180px)`,
    borderRadius: 'sm',

    '@media (max-width: 1100px)': {
      gap: 1,
    },

    '@media (max-width: 820px)': {
      gridColumn: 'auto',
      gridRow: 'auto',
      background: 'transparent',
    },
  },
}
