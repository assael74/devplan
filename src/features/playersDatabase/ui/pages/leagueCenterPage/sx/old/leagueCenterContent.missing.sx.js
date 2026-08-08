// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContent.missing.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const leagueCenterMissingSx = {
  workQueuePanel: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    alignSelf: 'stretch',
    overflow: 'hidden',
    borderColor: '#d8e2e9',
    boxShadow: 'none',
    bgcolor: '#f3f6f8',

    '& > div > div:first-of-type': {
      pb: 0.75,
      borderBottom: '1px solid #d8e2e9',
    },
  },

  workQueueList: {
    minHeight: 0,
    flex: 1,
    alignContent: 'start',
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  workQueueItem: {
    width: '100%',
    minHeight: 52,
    px: 1,
    py: 0.75,
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr)',
    gap: 0.75,
    alignItems: 'center',
    justifyItems: 'stretch',
    textAlign: 'right',
    borderRadius: 8,
    border: '1px solid #d6e0e7',
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    boxShadow: '0 2px 7px rgba(16, 43, 64, 0.025)',

    '&:hover': {
      bgcolor: devPlanColors.tertiaryLight,
      borderColor: devPlanColors.tertiary,
    },
  },

  workQueueCount: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: '#e2ebf1',
    color: devPlanColors.primary,
    fontWeight: 700,
  },

  workQueueCopy: {
    minWidth: 0,
  },

  workQueueTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  workQueueCaption: {
    mt: 0.25,
    color: devPlanColors.secondary,
    lineHeight: 1.2,
  },
}
