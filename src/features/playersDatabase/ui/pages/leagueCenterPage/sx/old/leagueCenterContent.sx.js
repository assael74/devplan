// features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterContent.sx.js

import { leagueCenterFiltersSx } from './leagueCenterContent.filters.sx.js'
import { leagueCenterTableSx } from './leagueCenterContent.table.sx.js'
import { leagueCenterMissingSx } from './leagueCenterContent.missing.sx.js'

export const leagueCenterContentSx = {
  ...leagueCenterFiltersSx,
  ...leagueCenterTableSx,
  ...leagueCenterMissingSx,
}
