// features/playersDatabase/ui/pages/searchPage/results/sx/searchResultsTable.sx.js

import { dataTableColumnsSx as columnSx } from '../../../../components/tables/dataTable/sx/dataTableColumns.sx.js'
import { buildTableColumnWidth } from '../../../../components/tables/tableWidths.js'

export const searchResultsTableSx = {
  profileCell: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  favoriteColumn: width => ({
    ...columnSx.actionsColumn,
    ...buildTableColumnWidth(width),
    px: 0.25,
    overflow: 'visible',
  }),

  actionsColumn: width => ({
    ...columnSx.actionsColumn,
    ...buildTableColumnWidth(width),
    px: 0.25,
    overflow: 'visible',
    textOverflow: 'clip',
    whiteSpace: 'normal',
  }),
}
