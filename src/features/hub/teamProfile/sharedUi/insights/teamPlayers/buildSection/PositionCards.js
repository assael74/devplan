// teamPlayers/buildSection/PositionCards.js

import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import RangeCardsGrid from '../shared/RangeCardsGrid.js'
import PositionInsight from './PositionInsight.js'
import PositionModeSwitch from './PositionModeSwitch.js'

import { layersSx as sx } from './sx/layers.sx.js'

import {
  buildPositionLayersModel,
  getPositionStatus,
  positionStatusMeta,
} from '../../../../sharedLogic/players/insightsLogic/viewModel/index.js'

const emptyArray = []

const LayerSummary = ({ layer }) => {
  const alertTone = layer.alertCount ? 'warning' : 'success'
  const alertLabel = layer.alertCount
    ? `${layer.alertCount} לבדיקה`
    : 'מאוזן'

  return (
    <Box sx={sx.layerSummary}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={sx.layerIcon}>
          {iconUi({ id: layer.icon, size: 'sm' })}
        </Box>

        <Box sx={{ minWidth: 0, display: 'grid', gap: 0.1 }}>
          <Typography level="title-sm" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {layer.title}
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.tertiary', lineHeight: 1.2 }}>
            {layer.total} עמדות · {layer.normalCount} תקינות
          </Typography>
        </Box>
      </Box>

      <Chip
        size="sm"
        variant="soft"
        color={alertTone}
        sx={{ flex: '0 0 auto', fontWeight: 700 }}
      >
        {alertLabel}
      </Chip>
    </Box>
  )
}

const StatusStrip = ({ cards = emptyArray }) => {
  const counts = cards.reduce((acc, card) => {
    const status = getPositionStatus(card)

    acc[status] = (acc[status] || 0) + 1

    return acc
  }, {})

  return (
    <Box sx={sx.statusStrip}>
      {Object.entries(positionStatusMeta).map(([status, meta]) => {
        const count = counts[status] || 0

        if (!count) return null

        return (
          <Chip
            key={status}
            size="sm"
            variant="soft"
            color={meta.color}
            sx={{ fontWeight: 700 }}
          >
            {meta.label} · {count}
          </Chip>
        )
      })}
    </Box>
  )
}

const OkChips = ({ cards = emptyArray }) => {
  const safeCards = Array.isArray(cards) ? cards : emptyArray

  if (!safeCards.length) return null

  return (
    <Box sx={sx.okChips}>
      {safeCards.map((card) => (
        <Chip
          key={card.id}
          size="sm"
          variant="soft"
          color="success"
          onClick={card.onClick}
          sx={sx.okChip}
        >
          {card.label} · {card.value}
        </Chip>
      ))}
    </Box>
  )
}

const LayerContent = ({
  layer,
  selectedCard,
  selectedTakeaway,
  renderDetails,
  mode,
  onModeChange,
}) => {
  return (
    <Box sx={{ display: 'grid', gap: 1, pt: 0.35 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
        <StatusStrip cards={layer.cards} />

        <PositionModeSwitch
          value={mode}
          onChange={onModeChange}
        />
      </Box>

      {layer.alerts.length ? (
        <Box sx={{ display: 'grid', gap: 0.65 }}>
          <Typography level="body-xs" sx={sx.groupTitle}>
            דורש בדיקה
          </Typography>

          <RangeCardsGrid cards={layer.alerts} compact />
        </Box>
      ) : null}

      {layer.normal.length ? (
        <Box sx={{ display: 'grid', gap: 0.65 }}>
          <Typography level="body-xs" sx={sx.groupTitle}>
            עמדות תקינות
          </Typography>

          <OkChips cards={layer.normal} />
        </Box>
      ) : null}

      <PositionInsight
        layer={layer}
        selectedCard={selectedCard}
        selectedTakeaway={selectedTakeaway}
        renderDetails={renderDetails}
      />
    </Box>
  )
}

export default function PositionCards({
  cards = emptyArray,
  selectedCard,
  selectedTakeaway,
  renderDetails,
  mode = 'primary',
  onModeChange,
}) {
  const layers = React.useMemo(() => {
    return buildPositionLayersModel(cards)
  }, [cards])

  if (!layers.length) return null

  return (
    <AccordionGroup variant="plain" disableDivider sx={sx.group}>
      {layers.map((layer) => {
        return (
          <Accordion key={layer.id}>
            <AccordionSummary>
              <LayerSummary layer={layer} />
            </AccordionSummary>

            <AccordionDetails>
              <LayerContent
                layer={layer}
                selectedCard={selectedCard}
                selectedTakeaway={selectedTakeaway}
                renderDetails={renderDetails}
                mode={mode}
                onModeChange={onModeChange}
              />
            </AccordionDetails>
          </Accordion>
        )
      })}
    </AccordionGroup>
  )
}
