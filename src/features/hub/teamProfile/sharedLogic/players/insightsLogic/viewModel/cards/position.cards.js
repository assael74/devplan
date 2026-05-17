// src/features/hub/teamProfile/sharedLogic/players/insightsLogic/viewModel/cards/position.cards.js

import {
  emptyArray,
} from '../common/index.js'

import {
  buildTooltip,
} from '../tooltips/index.js'

const getPositionCardStatus = (status) => {
  if (status === 'ok') return 'עומד ביעד'
  if (status === 'under') return 'מתחת למינימום'
  if (status === 'over') return 'מעל המקסימום'
  if (status === 'keyOverload') return 'יותר משחקן מפתח אחד בעמדה'

  return 'ללא הערכה'
}

const getPositionRangeStatus = (status) => {
  if (status === 'under') return 'under'
  if (status === 'over') return 'over'
  if (status === 'keyOverload') return 'keyOverload'
  if (status === 'ok') return 'ok'

  return 'neutral'
}

const getPositionTargetText = (item = {}) => {
  const min = item.minTarget ?? item?.target?.min ?? 2
  const max = item.maxTarget ?? item?.target?.max ?? 4
  const maxKey = item.maxKeyTarget ?? item?.target?.maxKey ?? 1

  return `${min}–${max} שחקנים · עד ${maxKey} שחקן מפתח`
}

const getPositionSubText = (item = {}) => {
  const min = item.minTarget ?? item?.target?.min ?? 2
  const max = item.maxTarget ?? item?.target?.max ?? 4
  const maxKey = item.maxKeyTarget ?? item?.target?.maxKey ?? 1

  return `יעד ${min}–${max} · מפתח עד ${maxKey}`
}

const getPositionModeLabel = (mode) => {
  return mode === 'coverage'
    ? 'כל העמדות'
    : 'עמדה ראשית'
}

export const buildPositionCards = ({
  structure = {},
  mode = 'primary',
} = {}) => {
  const positions =
    mode === 'coverage'
      ? structure?.positions?.coverage || emptyArray
      : structure?.positions?.primary || structure?.positions?.exact || emptyArray

  return positions.map((item) => {
    const players = Array.isArray(item.players)
      ? item.players
      : emptyArray

    const keyPlayers = Array.isArray(item.keyPlayers)
      ? item.keyPlayers
      : emptyArray

    return {
      id: item.id,
      label: item.label,
      value: item.count,
      valueRaw: item.count,
      count: item.count,
      sub: getPositionSubText(item),
      icon: item.id,
      layerKey: item.layerKey,
      layerLabel: item.layerLabel,
      color: 'neutral',
      rangeStatus: getPositionRangeStatus(item.status),
      status: item.status,
      minTarget: item.minTarget ?? item?.target?.min,
      maxTarget: item.maxTarget ?? item?.target?.max,
      maxKeyTarget: item.maxKeyTarget ?? item?.target?.maxKey,
      target: item.target,
      players,
      keyPlayers,
      tooltip: buildTooltip({
        //title: item.label,
        //actual: `${item.count} שחקנים · ${item.keyCount || 0} שחקני מפתח`,
        //target: getPositionTargetText(item),
        //status: getPositionCardStatus(item.status),
        basis: `${getPositionModeLabel(mode)} + בדיקת ריכוז שחקני מפתח`,
        listTitle: '',
        players,
      }),
    }
  })
}
