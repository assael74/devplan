// playerProfile/sharedUi/insights/playerGames/print/printCards.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  getCardSub,
  getCardTitle,
  getCardValue,
  getPrintToneSx,
  getPrintToneTitleSx,
  getPrintToneValueSx,
  hasText,
} from './printView.helpers.js'

import { printSx as sx } from './print.sx.js'

export function PrintMetaItem({ item }) {
  return (
    <Box
      className="dpPrintCard"
      sx={{
        ...sx.metaItem,
        ...getPrintToneSx(item?.color),
      }}
    >
      <Typography
        sx={{
          ...sx.metaLabel,
          ...getPrintToneTitleSx(item?.color),
        }}
      >
        {getCardTitle(item)}
      </Typography>

      <Typography
        sx={{
          ...sx.metaValue,
          ...getPrintToneValueSx(item?.color),
        }}
      >
        {getCardValue(item)}
      </Typography>
    </Box>
  )
}

export function PrintMetricCard({ item }) {
  const sub = getCardSub(item)

  return (
    <Box
      className="dpPrintCard"
      sx={{
        ...sx.metricCard,
        ...getPrintToneSx(item?.color),
      }}
    >
      <Typography
        sx={{
          ...sx.metricTitle,
          ...getPrintToneTitleSx(item?.color),
        }}
      >
        {getCardTitle(item)}
      </Typography>

      <Typography
        sx={{
          ...sx.metricValue,
          ...getPrintToneValueSx(item?.color),
        }}
      >
        {getCardValue(item)}
      </Typography>

      {hasText(sub) && (
        <Typography sx={sx.metricSub}>
          {sub}
        </Typography>
      )}
    </Box>
  )
}

export function PrintSmallFact({ item }) {
  return (
    <Box
      className="dpPrintRow"
      sx={{
        ...sx.smallFact,
        ...getPrintToneSx(item?.color),
      }}
    >
      <Typography
        sx={{
          ...sx.smallFactLabel,
          ...getPrintToneTitleSx(item?.color),
        }}
      >
        {getCardTitle(item)}
      </Typography>

      <Typography
        sx={{
          ...sx.smallFactValue,
          ...getPrintToneValueSx(item?.color),
        }}
      >
        {getCardValue(item)}
      </Typography>
    </Box>
  )
}
