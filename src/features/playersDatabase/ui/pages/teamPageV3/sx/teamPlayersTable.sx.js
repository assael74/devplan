// features/playersDatabase/ui/pages/teamPage/sx/teamPlayersTable.sx.js

import { dataTableVariantsSx as variantSx } from '../../../components/tables/dataTable/sx/dataTableVariants.sx.js'

export const teamPlayersTableSx = {
  tableWrap: variantSx.borderlessWrap,

  playersTable: {
    ...variantSx.ellipsisCells,

    '& th[data-column="fullName"], & td[data-column="fullName"]': {
      textAlign: 'left',
    },
  },
}
