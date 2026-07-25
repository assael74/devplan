// features/playersDatabase/ui/pages/leaguePage/sx/leaguePage.sx.js

import { leaguePageLayoutSx } from './leaguePage.layout.sx.js'
import { leaguePageHeaderSx } from './leaguePage.header.sx.js'
import { leaguePageActionsSx } from './leaguePage.actions.sx.js'
import { leaguePageStatsSx } from './leaguePage.stats.sx.js'

export const leaguePageSx = {
  ...leaguePageLayoutSx,
  ...leaguePageHeaderSx,
  ...leaguePageActionsSx,
  ...leaguePageStatsSx,
}
