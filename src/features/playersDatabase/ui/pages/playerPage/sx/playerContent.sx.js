// features/playersDatabase/ui/pages/playerPage/sx/playerContent.sx.js

import { playerContentLayoutSx } from './playerContent.layout.sx.js'
import { playerContentHistorySx } from './playerContent.history.sx.js'
import { playerContentTableSx } from './playerContent.table.sx.js'
import { playerContentActionsSx } from './playerContent.actions.sx.js'

export const playerContentSx = {
  ...playerContentLayoutSx,
  ...playerContentHistorySx,
  ...playerContentTableSx,
  ...playerContentActionsSx,
}
