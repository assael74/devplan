// src/features/playersDatabase/ui/pages/entryPage/sx/entryContent.sx.js

import { entryContentPreviewSx } from './entryContent.preview.sx.js'
import { entryContentRoutesSx } from './entryContent.routes.sx.js'
import { entryContentInfoSx } from './entryContent.info.sx.js'

/**
 * Entry page content styles
 *
 * entryContent.preview.sx.js
 * - Header preview illustration and its chart/player cards.
 *
 * entryContent.routes.sx.js
 * - Main navigation cards and search/league route visuals.
 *
 * entryContent.info.sx.js
 * - Information grid, capabilities list and KPI statistics grid.
 */
export const entryContentSx = {
  ...entryContentPreviewSx,
  ...entryContentRoutesSx,
  ...entryContentInfoSx,
}
