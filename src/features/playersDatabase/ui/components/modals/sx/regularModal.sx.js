// src/features/playersDatabase/ui/components/modals/sx/regularModal.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const regularModalSx = {
  header: {
    bgcolor: devPlanColors.primaryLight,
  },

  destructiveHeader: {
    bgcolor: 'danger.softBg',
    color: 'danger.softColor',
  },

  destructiveHeaderIcon: {
    bgcolor: 'danger.softBg',
    color: 'danger.600',
    border: '1px solid',
    borderColor: 'danger.200',
  },

  content: {
    minWidth: 0,
  },

  headerActions: {
    minWidth: 0,
    mb: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 0.75,
  },
}
