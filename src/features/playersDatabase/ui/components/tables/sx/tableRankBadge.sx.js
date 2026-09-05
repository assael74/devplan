// features/playersDatabase/ui/components/tables/sx/tableRankBadge.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const tableRankBadgeSx = {
  root: {
    minWidth: 26,
    height: 24,
    px: 0.75,
    mx: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    bgcolor: devPlanColors.primary,
    border: `1px solid ${devPlanColors.primaryDark}`,
    color: devPlanColors.surface,
    fontWeight: 700,
    lineHeight: 1,
  },
}
