// teamProfile/sharedLogic/players/moduleLogic/row/row.normalize.js

import { getPlayerQuickStats } from '../../../../../../../shared/players/player.quickStats.utils.js'

import { buildPlayerGamesStats } from '../teamPlayers.gamesStats.logic.js'

import {
  buildFullName,
  norm,
  normalizeArgs,
  pickAge,
  pickBirthLabel,
  pickId,
  pickLevel,
  pickPlayer,
} from './row.helpers.js'

import {
  buildGeneralPosition,
  pickPositions,
  pickPrimaryPosition,
} from './row.positions.js'

import {
  getPlayerTypeMeta,
  getProjectChipMeta,
  getProjectStatusMeta,
} from './row.project.js'

import {
  getSquadRole,
  getSquadRoleLabel,
  isKeyBySquadRole,
} from './row.role.js'

import {
  buildMetaCounts,
} from './row.meta.js'

import {
  buildSearchText,
} from './row.search.js'

export const normalizeTeamPlayerRow = (rawOrArgs, maybeTeam) => {
  const {
    raw,
    team,
    games,
  } = normalizeArgs(rawOrArgs, maybeTeam)

  const row = raw || {}
  const player = pickPlayer(row)
  const id = pickId(row)

  const positions = pickPositions(player, row)

  const primaryPosition = pickPrimaryPosition({
    player,
    row,
    positions,
  })

  const generalPosition = buildGeneralPosition({
    positions,
    primaryPosition,
  })

  const level = pickLevel(player, row)
  const birthLabel = pickBirthLabel(player, row)
  const age = pickAge(player, row)
  const playerFullName = player?.playerFullName

  const active = row?.active != null
    ? row.active
    : player?.active != null
      ? player.active
      : true

  const squadRole = getSquadRole(player, row)
  const isKey = isKeyBySquadRole(squadRole)

  const type = norm(row?.type || player?.type) || 'noneType'
  const projectStatus = norm(row?.projectStatus || player?.projectStatus)

  const playerFullStats = getPlayerQuickStats({
    player,
    team,
  })

  const playerGamesStats = buildPlayerGamesStats({
    playerId: id,
    games,
    team,
  })

  const typeMeta = getPlayerTypeMeta(type)
  const projectStatusMeta = getProjectStatusMeta(projectStatus)

  const projectChipMeta = getProjectChipMeta({
    type,
    projectStatus,
    typeMeta,
    projectStatusMeta,
  })

  const activeLabel = active ? 'פעיל' : 'לא פעיל'

  const generalPositionLabel =
    generalPosition.layerLabel ||
    generalPosition.layerKey ||
    ''

  const squadRoleLabel = getSquadRoleLabel(squadRole)

  return {
    id,
    playerId: id,

    playerFullName,
    primaryPosition,
    photo: player?.photo || row?.photo || null,

    active,

    squadRole,
    isKey,

    type,
    typeMeta,

    projectStatus,
    projectStatusMeta,
    projectChipMeta,
    isProject: projectChipMeta?.id === 'project',

    positions,
    primaryPosition: generalPosition.primaryPosition || '',
    generalPosition,
    generalPositionKey: generalPosition.layerKey || '',
    generalPositionLabel,

    level,
    birthLabel,
    age,

    playerFullStats,
    playerGamesStats,

    metaCounts: buildMetaCounts(player, row, level),

    searchText: buildSearchText({
      playerFullName,
      birthLabel,
      age,
      positions,
      primaryPosition: generalPosition.primaryPosition,
      generalPositionLabel,
      generalPositionKey: generalPosition.layerKey,
      typeLabel: typeMeta?.labelH || '',
      activeLabel,
      projectStatusLabel: projectStatusMeta?.labelH || '',
      projectChipLabel: projectChipMeta?.labelH || '',
      squadRoleLabel,
    }),

    raw: row,
    player,
  }
}
