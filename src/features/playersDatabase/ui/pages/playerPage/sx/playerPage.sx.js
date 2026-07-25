// features/playersDatabase/ui/pages/playerPage/sx/playerPage.sx.js

import { playerPageLayoutSx } from './playerPage.layout.sx.js'
import { playerPageHeaderSx } from './playerPage.header.sx.js'
import { playerPageActionsSx } from './playerPage.actions.sx.js'
import { playerPageStatsSx } from './playerPage.stats.sx.js'

export const playerPageSx = {
  ...playerPageLayoutSx,
  ...playerPageHeaderSx,
  ...playerPageActionsSx,
  ...playerPageStatsSx,
}
