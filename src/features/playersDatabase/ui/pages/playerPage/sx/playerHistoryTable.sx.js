// features/playersDatabase/ui/pages/playerPage/sx/playerHistoryTable.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import { dataTableVariantsSx as variantSx } from '../../../components/tables/dataTable/sx/dataTableVariants.sx.js'

export const playerHistoryTableSx = {
  tableWrap: variantSx.borderlessWrap,
  historyTable: variantSx.ellipsisCells,

  profileCell: {
    width: '100%',
    minWidth: 0,
    py: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  seasonCell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
  },

  currentSeasonChip: {
    minHeight: 22,
    px: 0.65,
    color: devPlanColors.primary,
    bgcolor: devPlanColors.primaryLight,
    fontSize: 10,
    fontWeight: 700,
  },
}
