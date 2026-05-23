// src/features/hub/teamProfile/desktop/modules/games/components/details/TrendPanel.js

import React from 'react'
import { Box, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { trendSx as sx } from './sx/trend.sx.js'

const getPointColor = point => {
  return point.isPositive ? '#16a34a' : '#dc2626'
}

export default function TrendPanel({
  view,
  title = 'מגמת השפעה מצטברת',
  subtitle,
  legend = 'כל נקודה מייצגת משחק. ירוק מעל קו התרומה, אדום מתחת לקו התרומה.',
  onClose,
}) {
  const summary = view?.summary || {}

  const subText =
    subtitle ||
    `${view?.entityName || ''} · ${summary.games || 0} משחקים · נוכחי ${summary.currentImpactText || '—'}`

  return (
    <Box sx={sx.panel}>
      <Box sx={sx.head}>
        <Box sx={sx.titleWrap}>
          <Typography level="title-sm" sx={sx.title}>
            {title}
          </Typography>

          <Typography level="body-xs" sx={sx.sub}>
            {subText}
          </Typography>
        </Box>

        <Box sx={sx.actions}>
          <IconButton size="sm" variant="plain">
            {iconUi({ id: 'download' })}
          </IconButton>

          <IconButton size="sm" variant="plain" onClick={onClose}>
            {iconUi({ id: 'close' })}
          </IconButton>
        </Box>
      </Box>

      <Box sx={sx.chartScroll}>
        <Box sx={sx.chartBox(view.width)}>
          <svg
            width={view.width}
            height={view.height}
            viewBox={`0 0 ${view.width} ${view.height}`}
            role="img"
          >
            <line
              x1={view.sidePad}
              x2={view.width - view.sidePad}
              y1={view.zeroY}
              y2={view.zeroY}
              stroke="currentColor"
              opacity="0.18"
            />

            <path
              d={view.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {view.points.map(point => (
              <g key={point.key}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  fill={getPointColor(point)}
                >
                  <title>{point.title}</title>
                </circle>

                {point.showRound ? (
                  <>
                    <text
                      x={point.x}
                      y={view.height - 20}
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                      opacity="0.72"
                    >
                      מחזור
                    </text>

                    <text
                      x={point.x}
                      y={view.height - 7}
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                      opacity="0.72"
                    >
                      {point.round}
                    </text>
                  </>
                ) : null}
              </g>
            ))}
          </svg>
        </Box>
      </Box>

      <Box sx={sx.legend}>
        <Typography level="body-xs" sx={sx.legendText}>
          {legend}
        </Typography>
      </Box>
    </Box>
  )
}
