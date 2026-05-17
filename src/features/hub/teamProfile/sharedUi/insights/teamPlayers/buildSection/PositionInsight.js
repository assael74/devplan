// teamPlayers/buildSection/PositionLayerInsight.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { insightSx as sx } from './sx/insight.sx.js'

import {
  isSelectedInPositionLayer,
} from '../../../../sharedLogic/players/insightsLogic/viewModel/index.js'

const emptyArray = []

const getInsightTitle = ({ selectedCard, selectedTakeaway }) => {
  return (
    selectedTakeaway?.item?.actionLabel ||
    selectedTakeaway?.item?.label ||
    selectedCard?.label ||
    'פירוט'
  )
}

const getInsightText = (selectedTakeaway = {}) => {
  return selectedTakeaway?.item?.text || ''
}

const InsightDetails = ({ details = emptyArray }) => {
  const safeDetails = Array.isArray(details) ? details : emptyArray

  if (!safeDetails.length) return null

  return (
    <Box sx={sx.details}>
      {safeDetails.map((detail, index) => {
        const key = detail.id || detail.label || `detail-${index}`

        return (
          <Box key={key} sx={sx.detailItem}>
            {detail.label ? (
              <Typography level="body-xs" sx={sx.detailLabel}>
                {detail.label}
              </Typography>
            ) : null}

            {detail.text ? (
              <Typography level="body-sm" sx={sx.detailText}>
                {detail.text}
              </Typography>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}

export default function PositionInsight({
  layer,
  selectedCard,
  selectedTakeaway,
  renderDetails,
}) {
  const showPanel = isSelectedInPositionLayer({ layer, selectedCard }) && selectedTakeaway

  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setOpen(false)
  }, [selectedCard?.id])

  if (!showPanel) return null

  const title = getInsightTitle({
    selectedCard,
    selectedTakeaway,
  })

  const text = getInsightText(selectedTakeaway)

  return (
    <Box sx={sx.panel}>
      <Box
        role="button"
        tabIndex={0}
        sx={sx.head}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen((value) => !value)
          }
        }}
      >
        <Box sx={sx.titleWrap}>
          <Box sx={sx.icon}>
            {iconUi({ id: selectedTakeaway?.item.id })}
          </Box>

          <Box sx={sx.text}>
            <Typography level="title-sm" sx={sx.title}>
              {title}
            </Typography>

            {text ? (
              <Typography level="body-xs" sx={sx.sub}>
                {text}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box sx={sx.toggleIcon(open)}>
          {iconUi({ id: 'arrowDown' })}
        </Box>
      </Box>

      <Box sx={sx.collapse(open)}>
        <Box sx={sx.collapseInner}>
          <Box sx={sx.body}>
            <InsightDetails details={selectedTakeaway.details} />

            {typeof renderDetails === 'function' ? (
              <Box sx={sx.players}>
                {renderDetails()}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
