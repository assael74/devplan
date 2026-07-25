// features/playersDatabase/ui/components/tables/tables.sx.js

import { pdbTableLayoutSx } from './tables.layout.sx.js'
import { pdbTableBaseSx } from './tables.base.sx.js'
import { pdbTableSortSx } from './tables.sort.sx.js'
import { pdbTableLinkSx } from './tables.link.sx.js'
import { pdbTableExpandedSx } from './tables.expanded.sx.js'

export const pdbTableSx = {
  ...pdbTableLayoutSx,
  ...pdbTableBaseSx,
  ...pdbTableSortSx,
  ...pdbTableLinkSx,
  ...pdbTableExpandedSx,
}
