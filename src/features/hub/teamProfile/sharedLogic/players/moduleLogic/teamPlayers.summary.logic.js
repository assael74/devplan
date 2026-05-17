//  teamProfile/sharedLogic/players/moduleLogic/teamPlayers.summary.logic.js

import {
  POSITION_LAYERS,
  LAYER_TITLES,
  PROJECT_STATUS_CANDIDATE,
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../shared/players/players.constants.js'

import {
  normalizeTeamPlayerRow,
} from './row/index.js'

const buildPrimaryPositionBuckets = (rows) => {
  const list = []

  Object.entries(POSITION_LAYERS || {}).forEach(([groupKey, items]) => {
    ;(Array.isArray(items) ? items : []).forEach((item) => {
      list.push({
        id: item.code,
        value: item.code,
        label: item.label || item.code,
        idIcon: item.code,
        layerCode: item.layerCode || '',
        groupKey,
      })
    })
  })

  return list.map((item) => ({
    ...item,
    count: rows.filter((row) => {
      return row?.primaryPosition === item.id
    }).length,
  }))
}

const buildPositionCoverageBuckets = (rows) => {
  const list = []

  Object.entries(POSITION_LAYERS || {}).forEach(([groupKey, items]) => {
    ;(Array.isArray(items) ? items : []).forEach((item) => {
      list.push({
        id: item.code,
        value: item.code,
        label: item.label || item.code,
        idIcon: item.code,
        layerCode: item.layerCode || '',
        groupKey,
      })
    })
  })

  return list.map((item) => ({
    ...item,
    count: rows.filter((row) => {
      const positions = Array.isArray(row?.positions) ? row.positions : []
      return positions.includes(item.id)
    }).length,
  }))
}

const buildPositionCodeBuckets = (rows) => {
  const list = []

  Object.entries(POSITION_LAYERS || {}).forEach(([groupKey, items]) => {
    ;(Array.isArray(items) ? items : []).forEach((item) => {
      list.push({
        id: item.code,
        value: item.code,
        label: item.label || item.code,
        idIcon: item.code,
        layerCode: item.layerCode || '',
        groupKey,
      })
    })
  })

  return list.map((item) => ({
    ...item,
    count: rows.filter((row) => {
      const positions = Array.isArray(row?.positions) ? row.positions : []
      return positions.includes(item.id)
    }).length,
  }))
}

const buildGeneralPositionBuckets = (rows) => {
  return Object.keys(POSITION_LAYERS || {}).map((key) => ({
    id: key,
    value: key,
    label: LAYER_TITLES?.[key] || key,
    idIcon: key,
    count: rows.filter((row) => {
      const rowKey = row?.generalPositionKey || row?.generalPosition?.layerKey || ''
      return rowKey === key
    }).length,
  }))
}

const buildSquadRoleBuckets = (rows) => {
  return SQUAD_ROLE_OPTIONS.map((item) => ({
    id: item.value,
    value: item.value,
    label: item.label,
    idIcon: item.idIcon,
    color: item.color,
    count: rows.filter((row) => row?.squadRole === item.value).length,
  }))
}

const buildProjectStatusBuckets = (rows) => {
  return PROJECT_STATUS_CANDIDATE.map((item) => ({
    id: item.id,
    value: item.id,
    label: item.labelH,
    idIcon: item.idIcon,
    color: item.color,
    icCol: item.icCol,
    count: rows.filter((row) => row?.projectStatus === item.id).length,
  }))
}

const normalizeArgs = (teamOrArgs, options = {}) => {
  if (
    teamOrArgs &&
    typeof teamOrArgs === 'object' &&
    Object.prototype.hasOwnProperty.call(teamOrArgs, 'team')
  ) {
    return {
      team: teamOrArgs.team || null,
      games: Array.isArray(teamOrArgs.games) ? teamOrArgs.games : [],
    }
  }

  return {
    team: teamOrArgs || null,
    games: Array.isArray(options?.games) ? options.games : [],
  }
}

export const resolveTeamPlayers = (teamOrArgs, options = {}) => {
  const {
    team,
    games,
  } = normalizeArgs(teamOrArgs, options)

  const base = Array.isArray(team?.players) ? team.players : []

  const rows = base
    .map((item) =>
      normalizeTeamPlayerRow({
        raw: item,
        team,
        games,
      })
    )
    .filter((x) => !!x.id)
  
  return {
    teamFullStats: team?.teamFullStats || {},
    rows,
    summary: {
      total: rows.length,
      active: rows.filter((x) => x.active).length,
      nonActive: rows.filter((x) => !x.active).length,
      key: rows.filter((x) => x.squadRole === 'key').length,
      project: rows.filter((x) => x.projectChipMeta?.id === 'project').length,
      candidate: rows.filter((x) => x.projectChipMeta?.id === 'candidateFlow').length,
      squadRoleBuckets: buildSquadRoleBuckets(rows),
      projectStatusBuckets: buildProjectStatusBuckets(rows),

      primaryPositionBuckets: buildPrimaryPositionBuckets(rows),
      positionCoverageBuckets: buildPositionCoverageBuckets(rows),

      positionCodeBuckets: buildPositionCoverageBuckets(rows),

      generalPositionBuckets: buildGeneralPositionBuckets(rows),
    }
  }
}
