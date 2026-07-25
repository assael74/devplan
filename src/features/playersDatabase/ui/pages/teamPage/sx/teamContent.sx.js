// features/playersDatabase/ui/pages/teamPage/sx/teamContent.sx.js

import { teamContentLayoutSx } from './teamContent.layout.sx.js'
import { teamContentTableSx } from './teamContent.table.sx.js'
import { teamContentActionsSx } from './teamContent.actions.sx.js'

/**
 * Team page content styles.
 *
 * teamContent.layout.sx.js
 * - Main content grid and players panel shell.
 *
 * teamContent.table.sx.js
 * - Players table, cells, profile display and row actions.
 *
 * teamContent.actions.sx.js
 * - Side actions panel, filters and action buttons.
 */
export const teamContentSx = {
  ...teamContentLayoutSx,
  ...teamContentTableSx,
  ...teamContentActionsSx,
}
