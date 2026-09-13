// features/playersDatabase/ui/pages/leaguePage/sx/leagueTeamsTable.sx.js

import { dataTableVariantsSx as variantSx } from '../../../components/tables/dataTable/sx/dataTableVariants.sx.js'

export const leagueTeamsTableSx = {
  headerInfo: {
    alignItems: 'flex-end',
    gap: 0.35,
  },

  headerInfoText: {
    color: 'neutral.500',
    fontSize: '0.68rem',
    fontWeight: 500,
    lineHeight: 1.25,
  },

  tableWrap: variantSx.borderlessWrap,
}
