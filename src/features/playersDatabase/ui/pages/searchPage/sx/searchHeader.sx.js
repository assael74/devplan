// src/features/playersDatabase/ui/pages/searchPage/sx/searchHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import { pageHeaderSurfaceSx, pageHeaderTitleSx } from '../../../components/page/sx/pageHeader.sx.js'

export const searchHeaderSx = {
  root: {
    ...pageHeaderSurfaceSx,
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) auto',
    },
    gap: 2,
    alignItems: 'end',
  },

  copy: {
    minWidth: 0,
    gap: 0.75,
    alignItems: 'flex-start',
  },

  title: {
    ...pageHeaderTitleSx,
    color: devPlanColors.primaryDark,
  },

  actions: {
    alignSelf: 'start',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  auditButton: {
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: 'divider',
    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  reportButton: {
    bgcolor: devPlanColors.primary,
    color: '#FFFFFF',
    borderColor: devPlanColors.primary,
    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
      borderColor: devPlanColors.primaryDark,
    },
    '&.Mui-disabled': {
      bgcolor: devPlanColors.primaryLight,
      color: devPlanColors.secondary,
      borderColor: devPlanColors.primaryLight,
    },
  },

  leaguesButton: {
    bgcolor: '#fff',
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,
    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
