// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomePositionLayers.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  LayerAccordionGroup,
  LayerSummary,
  ModeSwitch,
  SelectableChips,
  StatusStrip,
} from '../shared/index.js'

import OutcomeDetails from './OutcomeDetails.js'
import OutcomePositionCards from './OutcomePositionCards.js'

import { layersSx as sx } from '../shared/sx/layers.sx.js'

const emptyArray = []

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

const layerMeta = {
  attack: {
    id: 'attack',
    title: 'שכבת התקפה',
    icon: 'attack',
    order: 1,
  },
  atMidfield: {
    id: 'attack',
    title: 'שכבת התקפה',
    icon: 'attack',
    order: 1,
  },
  midfield: {
    id: 'attack',
    title: 'שכבת התקפה',
    icon: 'attack',
    order: 1,
  },
  dmMid: {
    id: 'defense',
    title: 'שכבת הגנה',
    icon: 'defense',
    order: 2,
  },
  defense: {
    id: 'defense',
    title: 'שכבת הגנה',
    icon: 'defense',
    order: 2,
  },
  goalkeeper: {
    id: 'defense',
    title: 'שכבת הגנה',
    icon: 'defense',
    order: 2,
  },
}

const toneRank = {
  danger: 4,
  warning: 3,
  primary: 2,
  neutral: 1,
  success: 0,
}

const getGroups = model => {
  return Array.isArray(model?.groups) ? model.groups : emptyArray
}

const getTone = group => {
  return group?.diagnosis?.displayTone ||
    group?.diagnosis?.color ||
    group?.diagnosis?.groupTone ||
    group?.diagnosis?.riskTone ||
    group?.diagnosis?.qualityTone ||
    group?.scoreTone ||
    'neutral'
}

const isAlertGroup = group => {
  return ['danger', 'warning', 'primary'].includes(getTone(group))
}

const getLayerMeta = group => {
  const key = group?.layerKey || group?.icon || group?.id || ''
  const meta = layerMeta[key]

  if (meta) return meta

  return {
    id: key || 'other',
    title: group?.layerLabel || 'שכבה נוספת',
    icon: key || 'positions',
    order: 9,
  }
}

const getWorstTone = groups => {
  return groups.reduce((best, group) => {
    const tone = getTone(group)

    return toneRank[tone] > toneRank[best]
      ? tone
      : best
  }, 'success')
}

const buildStatusItems = groups => {
  const counts = groups.reduce((acc, group) => {
    const tone = getTone(group)

    acc[tone] = (acc[tone] || 0) + 1

    return acc
  }, {})

  return [
    counts.danger
      ? {
          id: 'danger',
          label: `סיכון גבוה · ${counts.danger}`,
          color: 'danger',
        }
      : null,

    counts.warning
      ? {
          id: 'warning',
          label: `דורש בדיקה · ${counts.warning}`,
          color: 'warning',
        }
      : null,

    counts.primary
      ? {
          id: 'primary',
          label: `חריגה קלה · ${counts.primary}`,
          color: 'primary',
        }
      : null,

    counts.success
      ? {
          id: 'success',
          label: `תקין · ${counts.success}`,
          color: 'success',
        }
      : null,

    counts.neutral
      ? {
          id: 'neutral',
          label: `ללא הכרעה · ${counts.neutral}`,
          color: 'neutral',
        }
      : null,
  ].filter(Boolean)
}

const buildLayers = groups => {
  const map = new Map()

  groups.forEach(group => {
    const meta = getLayerMeta(group)

    if (!map.has(meta.id)) {
      map.set(meta.id, {
        id: meta.id,
        title: meta.title,
        icon: meta.icon,
        order: meta.order,
        groups: [],
      })
    }

    map.get(meta.id).groups.push(group)
  })

  return Array.from(map.values())
    .map(layer => {
      const alertGroups = layer.groups.filter(isAlertGroup)
      const normalGroups = layer.groups.filter(group => !isAlertGroup(group))
      const tone = getWorstTone(layer.groups)

      return {
        ...layer,
        tone,
        alertGroups,
        normalGroups,
        total: layer.groups.length,
        alertCount: alertGroups.length,
        normalCount: normalGroups.length,
      }
    })
    .sort((a, b) => a.order - b.order)
}

const getLayerChip = layer => {
  if (layer.alertCount) {
    return {
      label: `${layer.alertCount} לבדיקה`,
      color: layer.tone === 'danger' ? 'danger' : 'warning',
    }
  }

  return {
    label: 'מאוזן',
    color: 'success',
  }
}

const getNormalLabel = group => {
  if (!group?.scoreLabel || group.scoreLabel === '-') {
    return group.label
  }

  return `${group.label} · ${group.scoreLabel}`
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

const AlertPositions = ({
  groups,
  selectedId,
  onSelect,
  layer,
  mode,
  onModeChange
}) => {
  if (!groups.length) return null

  return (
    <Box sx={{ display: 'grid', gap: 0.65 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 0.5 }} >
        <Typography level="title-sm" sx={{ ...sx.groupTitle, fontSize: 15 }}>
          דורש בדיקה
        </Typography>

        <ModeSwitch
          value={mode}
          options={positionModeOptions}
          onChange={onModeChange}
        />
      </Box>

      <OutcomePositionCards
        groups={groups}
        selectedId={selectedId}
        onSelect={onSelect}
      />


    </Box>
  )
}

const NormalPositions = ({ groups, onSelect, }) => {
  if (!groups.length) return null

  return (
    <Box sx={{ display: 'grid', gap: 0.65 }}>
      <Typography level="body-xs" sx={sx.groupTitle}>
        עמדות תקינות
      </Typography>

      <SelectableChips
        items={groups}
        color="success"
        getLabel={getNormalLabel}
        onSelect={onSelect}
      />
    </Box>
  )
}

const LayerContent = ({
  layer,
  mode,
  onModeChange,
  selected,
  selectedId,
  onSelect,
}) => {
  const showSelected = layer.groups.some(group => {
    return group.id === selected?.id
  })

  return (
    <Box sx={{ display: 'grid', gap: 1, pt: 0.35 }}>
      <AlertPositions
        groups={layer.alertGroups}
        selectedId={selectedId}
        onSelect={onSelect}
        layer={layer}
        mode={mode}
        onModeChange={onModeChange}
      />

      <NormalPositions
        groups={layer.normalGroups}
        onSelect={onSelect}
      />

      {showSelected ? (
        <OutcomeDetails
          key={selected.id}
          group={selected}
          sourceType="position"
        />
      ) : null}
    </Box>
  )
}

export default function OutcomePositionLayers({ model, }) {
  const [mode, setMode] = React.useState(model?.defaultMode || 'primary')
  const activeModel = model?.modes?.[mode] || model?.modes?.primary || {}
  const groups = getGroups(activeModel)

  const layers = React.useMemo(() => {
    return buildLayers(groups)
  }, [groups])

  const [selectedId, setSelectedId] = React.useState(null)

  React.useEffect(() => {
    setSelectedId(current => {
      const exists = groups.some(group => group.id === current)

      return exists ? current : null
    })
  }, [groups])

  const selected = React.useMemo(() => {
    return groups.find(group => group.id === selectedId) || null
  }, [groups, selectedId])

  if (!model) return null

  return (
    <LayerAccordionGroup
      layers={layers}
      renderSummary={renderLayerSummary}
      renderContent={layer => (
        <LayerContent
          layer={layer}
          mode={mode}
          onModeChange={setMode}
          selected={selected}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      )}
    />
  )
}
