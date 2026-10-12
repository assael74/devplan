// src/features/playersDatabase/ui/pages/DataOpsPage/sx/systemAuditRepair.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const systemAuditRepairSx = {
  changes: {
    display: 'grid',
    gap: 0.75,
    minWidth: 0,
  },

  change: {
    p: 1,
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderRadius: 'sm',
    bgcolor: devPlanColors.surface,
    overflowWrap: 'anywhere',
  },

  documentId: {
    display: 'block',
    overflowWrap: 'anywhere',
    color: devPlanColors.subText,
  },

  status: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
  },

  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.75,
    alignItems: 'center',
  },
}
