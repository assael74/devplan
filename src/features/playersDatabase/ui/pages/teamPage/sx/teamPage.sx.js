// features/playersDatabase/ui/pages/teamPage/sx/teamPage.sx.js

import { teamPageLayoutSx } from './teamPage.layout.sx.js'
import { teamPageHeaderSx } from './teamPage.header.sx.js'
import { teamPageActionsSx } from './teamPage.actions.sx.js'
import { teamPageStatsSx } from './teamPage.stats.sx.js'
import { teamPageStatusSx } from './teamPage.status.sx.js'

export const teamPageSx = {
  ...teamPageLayoutSx,
  ...teamPageHeaderSx,
  ...teamPageActionsSx,
  ...teamPageStatsSx,
  ...teamPageStatusSx,
  loadingState: {
    minHeight: 320,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  }
}
