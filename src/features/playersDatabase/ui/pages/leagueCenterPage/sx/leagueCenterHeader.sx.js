// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterHeader.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import { pageHeaderTitleSx } from '../../../components/page/sx/pageHeader.sx.js'

export const leagueCenterHeaderSx = {
  pageTitle: {
    ...pageHeaderTitleSx,
    color: '#0b1f4d',
  },

  headerActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  primaryButton: {
    bgcolor: devPlanColors.primary,
    color: '#fff',
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
    },
  },

  secondaryButton: {
    color: devPlanColors.primary,
    borderColor: devPlanColors.primary,
    bgcolor: '#fff',

    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primaryDark,
    },
  },
}
