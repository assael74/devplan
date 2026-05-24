// src/features/liveTagging/ui/sx/liveTagging.sx.js

import { actionsSx } from './actions.sx.js'
import { baseSx } from './base.sx.js'
import { clockSx } from './clock.sx.js'
import { eventsSx } from './events.sx.js'
import { selectionSx } from './selection.sx.js'
import { subjectSx } from './subject.sx.js'
import { zonesSx } from './zones.sx.js'

export const sx = {
  ...baseSx,
  ...selectionSx,
  ...clockSx,
  ...subjectSx,
  ...actionsSx,
  ...zonesSx,
  ...eventsSx,
}
