//  clubProfile/sharedLogic/players/moduleLogic/clubPlayers.summary.logic.js

import {
  POSITION_LAYERS,
  LAYER_TITLES,
  PROJECT_STATUS_CANDIDATE,
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../shared/players/players.constants.js'

import { normalizeClubPlayerRow } from './clubPlayers.logic.js'

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim()

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

const buildTeamBuckets = (rows) => {
  const map = new Map()

  rows.forEach((row) => {
    const id = norm(row?.teamId || row?.teamName)
    if (!id) return

    if (!map.has(id)) {
      map.set(id, {
        id,
        value: id,
        label: row?.teamName || 'קבוצה ללא שם',
        idIcon: 'teams',
        count: 0,
      })
    }

    map.get(id).count += 1
  })

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

const resolveClubPlayersBase = (club) => {
  const teams = Array.isArray(club?.teams) ? club.teams : []

  return teams.flatMap((team) => {
    const players = Array.isArray(team?.players) ? team.players : []

    return players.map((player) => ({
      ...player,
      teamId: team?.id || team?.teamId || '',
      teamName: team?.teamName || team?.name || '',
      teamYear: team?.teamYear || team?.year || '',
      clubId: club?.id || '',
      clubName: club?.clubName || club?.name || '',
    }))
  })
}

export const resolveClubPlayers = (club) => {
  const base = resolveClubPlayersBase(club)

  const rows = base
    .map((item) => normalizeClubPlayerRow(item, club))
    .filter((x) => !!x.id)

  return {
    clubFullStats: club?.clubFullStats || {},
    rows,
    summary: {
      total: rows.length,
      active: rows.filter((x) => x.active).length,
      nonActive: rows.filter((x) => !x.active).length,
      key: rows.filter((x) => x.squadRole === 'key').length,
      project: rows.filter((x) => x.projectChipMeta?.id === 'project').length,
      candidate: rows.filter((x) => x.projectChipMeta?.id === 'candidateFlow').length,

      teamBuckets: buildTeamBuckets(rows),
      squadRoleBuckets: buildSquadRoleBuckets(rows),
      projectStatusBuckets: buildProjectStatusBuckets(rows),
      positionCodeBuckets: buildPositionCodeBuckets(rows),
      generalPositionBuckets: buildGeneralPositionBuckets(rows),
    },
  }
}
