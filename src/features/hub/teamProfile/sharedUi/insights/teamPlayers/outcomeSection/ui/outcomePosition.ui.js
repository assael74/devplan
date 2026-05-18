// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/ui/outcomePosition.ui.js

const emptyArray = []

export const positionModeOptions = [
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

export const getPositionGroups = model => {
  return Array.isArray(model?.groups) ? model.groups : emptyArray
}

export const getPositionTone = group => {
  return group?.diagnosis?.displayTone ||
    group?.diagnosis?.color ||
    group?.diagnosis?.groupTone ||
    group?.diagnosis?.riskTone ||
    group?.diagnosis?.qualityTone ||
    group?.scoreTone ||
    'neutral'
}

export const isAlertPositionGroup = group => {
  return ['danger', 'warning', 'primary'].includes(getPositionTone(group))
}

export const getPositionLayerMeta = group => {
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

export const getWorstPositionTone = groups => {
  return groups.reduce((best, group) => {
    const tone = getPositionTone(group)

    return toneRank[tone] > toneRank[best]
      ? tone
      : best
  }, 'success')
}

export const buildPositionStatusItems = groups => {
  const counts = groups.reduce((acc, group) => {
    const tone = getPositionTone(group)

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

export const buildPositionLayers = groups => {
  const map = new Map()

  groups.forEach(group => {
    const meta = getPositionLayerMeta(group)

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
      const alertGroups = layer.groups.filter(isAlertPositionGroup)
      const normalGroups = layer.groups.filter(group => !isAlertPositionGroup(group))
      const tone = getWorstPositionTone(layer.groups)

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

export const getPositionLayerChip = layer => {
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

export const getNormalPositionLabel = group => {
  if (!group?.scoreLabel || group.scoreLabel === '-') {
    return group.label
  }

  return `${group.label} · ${group.scoreLabel}`
}

export const hasSelectedInLayer = ({ layer, selected, }) => {
  return layer.groups.some(group => group.id === selected?.id)
}
