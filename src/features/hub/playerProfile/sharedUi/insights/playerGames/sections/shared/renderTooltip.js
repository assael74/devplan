// playerProfile/sharedUi/insights/playerGames/sections/shared/renderTooltip.js

import React from 'react'

import TooltipContent from './TooltipContent.js'

export function renderTooltip(tooltip) {
  if (!tooltip) return null

  if (React.isValidElement(tooltip)) {
    return tooltip
  }

  return (
    <TooltipContent
      title={tooltip.title}
      rows={tooltip.rows}
    />
  )
}
