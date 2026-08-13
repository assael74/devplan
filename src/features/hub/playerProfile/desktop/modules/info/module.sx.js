// playerProfile/desktop/modules/info/module.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const moduleSx = {
  stickyToolbar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gap: 0.65,
    p: 0.65,
    borderRadius: 'md',
    bgcolor: devPlanColors.surface,
    border: '1px solid',
    borderColor: devPlanColors.border,
    mb: 1,
    boxShadow: '0 10px 24px rgba(16, 43, 64, 0.10)',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 1,
    alignItems: 'stretch',
    minWidth: 0,

    '& > *': {
      minWidth: 0,
    },
  },
}
