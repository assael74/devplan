// TEAMPROFILE/sharedUi/insights/teamPlayers/buildSection/PositionCards.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import RangeCardsGrid from '../shared/RangeCardsGrid.js'
import PositionInsight from './PositionInsight.js'

import {
  LayerAccordionGroup,
  LayerSummary,
  ModeSwitch,
  SelectableChips,
  StatusStrip,
} from '../shared/index.js'

import { layersSx as sx } from '../shared/sx/layers.sx.js'

import {
  buildPositionLayersModel,
  getPositionStatus,
  positionStatusMeta,
} from '../../../../sharedLogic/players/insightsLogic/viewModel/index.js'

const emptyArray = []

const getLayerChip = layer => {
  if (layer.alertCount) {
    return {
      label: `${layer.alertCount} לבדיקה`,
      color: 'warning',
    }
  }

  return {
    label: 'מאוזן',
    color: 'success',
  }
}

const positionModeOptions = [
  {
    id: 'primary',
    label: 'ראשית בלבד',
  },
  {
    id: 'coverage',
    label: 'כל העמדות',
  },
]

const buildStatusItems = cards => {
  const counts = cards.reduce((acc, card) => {
    const status = getPositionStatus(card)

    acc[status] = (acc[status] || 0) + 1

    return acc
  }, {})

  return Object.entries(positionStatusMeta)
    .map(([status, meta]) => {
      const count = counts[status] || 0

      if (!count) return null

      return {
        id: status,
        label: `${meta.label} · ${count}`,
        color: meta.color,
      }
    })
    .filter(Boolean)
}

const renderLayerSummary = layer => {
  const chip = getLayerChip(layer)

  return (
    <LayerSummary
      icon={layer.icon}
      title={layer.title}
      sub={`${layer.total} עמדות · ${layer.normalCount} תקינות`}
      chipLabel={chip.label}
      chipColor={chip.color}
    />
  )
}

const NormalPositions = ({ cards = emptyArray }) => {
  if (!cards.length) return null

  return (
    <Box sx={{ display: 'grid', gap: 0.65 }}>
      <Typography level="body-xs" sx={sx.groupTitle}>
        עמדות תקינות
      </Typography>

      <SelectableChips
        items={cards}
        color="success"
        getLabel={card => `${card.label} · ${card.value}`}
        onSelect={card => {
          if (typeof card.onClick === 'function') {
            card.onClick()
          }
        }}
      />
    </Box>
  )
}

const AlertPositions = ({ cards = emptyArray }) => {
  if (!cards.length) return null

  return (
    <Box sx={{ display: 'grid', gap: 0.65 }}>
      <Typography level="body-xs" sx={sx.groupTitle}>
        דורש בדיקה
      </Typography>

      <RangeCardsGrid cards={cards} compact />
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <StatusStrip items={buildStatusItems(layer.cards)} />

        <ModeSwitch
          value={mode}
          options={positionModeOptions}
          onChange={onModeChange}
        />
      </Box>

      <AlertPositions cards={layer.alerts} />

      <NormalPositions cards={layer.normal} />

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

  return (
    <LayerAccordionGroup
      layers={layers}
      renderSummary={renderLayerSummary}
      renderContent={layer => (
        <LayerContent
          layer={layer}
          selectedCard={selectedCard}
          selectedTakeaway={selectedTakeaway}
          renderDetails={renderDetails}
          mode={mode}
          onModeChange={onModeChange}
        />
      )}
    />
  )
}
