// src/features/playersDatabase/ui/pages/clubsPage/sx/clubsPage.sx.js
import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import { pageCoreLayoutSx } from '../../../components/page/sx/pageCoreLayout.sx.js'
import { pageHeaderTitleSx } from '../../../components/page/sx/pageHeader.sx.js'

export const clubsPageSx = {
  ...pageCoreLayoutSx,
  pageTitle: {
    ...pageHeaderTitleSx,
    color: devPlanColors.primaryDark,
  },

  headerActionsPanel: {
    gap: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  primaryButton: {
    bgcolor: devPlanColors.primary,
    color: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },

  panelContent: {
    flex: 1,
    minHeight: 0,
    p: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarGutter: 'stable',
    bgcolor: '#F4F7FA',
  },

  clubsMainColumn: {
    gridTemplateRows: 'minmax(0, 1fr)',
  },

  clubsPanel: {
    height: '100%',
    minHeight: 0,
  },

}
