// clubProfile/sharedLogic/players/moduleLogic/clubPlayers.row.logic.js

import { getPlayerAge } from '../../../../../../shared/players/player.age.utils.js'
import { getPlayerGeneralPosition } from '../../../../../../shared/players/player.positions.utils.js'
import { getPlayerQuickStats } from '../../../../../../shared/players/player.quickStats.utils.js'

import {
  PLAYERS_TYPES,
  PROJECT_STATUS_CANDIDATE,
  SQUAD_ROLE_OPTIONS,
} from '../../../../../../shared/players/players.constants.js'

export const safe = value => {
  return value == null ? '' : String(value)
}

export const norm = value => {
  return safe(value).trim()
}

const toArr = value => {
  if (Array.isArray(value)) return value.filter(Boolean)

  const text = norm(value)
  if (!text) return []

  return text
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

const countList = value => {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object') return Object.keys(value).length

  return 0
}

const pickId = row => {
  return row?.playerId || row?.player?.id || row?.id || null
}

const pickPlayer = row => {
  return row?.player || row || {}
}

const pickPositions = (player, row) => {
  if (row?.positions != null) return toArr(row.positions)
  if (player?.positions != null) return toArr(player.positions)

  return []
}

const pickLevel = (player, row) => {
  const num = Number(
    row?.level ??
      player?.level ??
      row?.rating ??
      player?.rating ??
      0
  )

  return Number.isFinite(num) ? num : 0
}

const pickBirthLabel = (player, row) => {
  return (
    norm(row?.birthDay) ||
    norm(player?.birthDay) ||
    norm(row?.birth) ||
    norm(player?.birth) ||
    ''
  )
}

const pickAge = (player, row) => {
  const direct = Number(row?.age ?? player?.age)

  if (Number.isFinite(direct)) return direct

  return getPlayerAge({
    birthDay: row?.birthDay || player?.birthDay || '',
    birth: row?.birth || player?.birth || '',
  })
}

const pickTeamId = (player, row) => {
  return norm(
    row?.teamId ||
      player?.teamId ||
      player?.team?.id ||
      player?.team?.teamId ||
      ''
  )
}

const pickTeamName = (player, row) => {
  return norm(
    row?.teamName ||
      player?.teamName ||
      player?.team?.teamName ||
      player?.team?.name ||
      ''
  ) || '—'
}

const getPlayerTypeMeta = typeId => {
  return (
    PLAYERS_TYPES.find(item => item.id === typeId) ||
    PLAYERS_TYPES.find(item => item.id === 'noneType') ||
    {
      id: 'noneType',
      labelH: 'כללי',
      idIcon: 'noneType',
      disabled: false,
    }
  )
}

const getProjectStatusMeta = statusId => {
  const normalized = norm(statusId)

  if (!normalized) return null

  return PROJECT_STATUS_CANDIDATE.find(item => {
    return item.id === normalized
  }) || null
}

const getProjectChipMeta = ({ type, projectStatus, typeMeta, projectStatusMeta, }) => {
  const normalizedType = norm(type) || 'noneType'
  const normalizedStatus = norm(projectStatus)

  if (normalizedType === 'project' || normalizedStatus === 'approved') {
    return {
      id: 'project',
      labelH: 'פרויקט',
      idIcon: 'project',
      tone: 'success',
      bgColor: '',
      textColor: '',
      source: 'project',
    }
  }

  if (projectStatusMeta) {
    return {
      id: 'candidateFlow',
      labelH: projectStatusMeta?.labelH || 'מועמדות',
      idIcon: projectStatusMeta?.idIcon || 'candidate',
      tone: 'custom',
      bgColor: projectStatusMeta?.color || '',
      textColor: projectStatusMeta?.icCol || '',
      source: 'candidate',
    }
  }

  return {
    id: typeMeta?.id || 'noneType',
    labelH: typeMeta?.labelH || 'כללי',
    idIcon: typeMeta?.idIcon || 'noneType',
    tone: 'neutral',
    bgColor: '',
    textColor: '',
    source: 'default',
  }
}

const buildMetaCounts = (player, row, level) => {
  const games = countList(row?.games || player?.games)
  const meetings = countList(row?.meetings || player?.meetings)
  const payments = countList(row?.payments || player?.payments)
  const abilities = countList(row?.abilities || player?.abilities)
  const lvl = Number(level) || 0

  return {
    games,
    meetings,
    payments,
    abilities,
    level: lvl,
    hasUsage: games + meetings + payments + abilities > 0 || lvl > 0,
  }
}

const getSquadRole = (player, row) => {
  return norm(row?.squadRole || player?.squadRole)
}

const isKeyBySquadRole = squadRole => {
  return squadRole === 'key'
}

const getSquadRoleLabel = squadRole => {
  const option = SQUAD_ROLE_OPTIONS.find(item => {
    return item.value === squadRole
  })

  return option?.label || 'לא הוגדר מעמד'
}

const buildSearchText = ({
  fullName,
  birthLabel,
  age,
  positions,
  generalPositionLabel,
  generalPositionKey,
  typeLabel,
  activeLabel,
  projectStatusLabel,
  projectChipLabel,
  squadRoleLabel,
  teamName,
}) => {
  return [
    fullName,
    teamName,
    birthLabel,
    Number.isFinite(age) ? `גיל ${age}` : '',
    positions.join(' '),
    generalPositionLabel,
    generalPositionKey,
    typeLabel,
    activeLabel,
    projectStatusLabel,
    projectChipLabel,
    squadRoleLabel,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export const normalizeClubPlayerRow = (raw, club) => {
  const row = raw || {}
  const player = pickPlayer(row)
  const id = pickId(row)

  const positions = pickPositions(player, row)
  const level = pickLevel(player, row)
  const birthLabel = pickBirthLabel(player, row)
  const age = pickAge(player, row)

  const fullName = player?.playerFullName || player?.fullName || '—'
  const teamId = pickTeamId(player, row)
  const teamName = pickTeamName(player, row)

  const active =
    row?.active != null
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
    team: club,
  })

  const generalPositionRaw = getPlayerGeneralPosition(positions) || {}

  const generalPosition = {
    layerKey: norm(generalPositionRaw?.layerKey),
    layerLabel: norm(generalPositionRaw?.layerLabel),
  }

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

    player,
    raw: row,

    fullName,
    playerFullName: fullName,

    team: player?.team || row?.team || null,
    teamId,
    teamName,

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
    generalPosition,
    generalPositionKey: generalPosition.layerKey || '',
    generalPositionLabel,

    level,
    birthLabel,
    age,

    playerFullStats,

    metaCounts: buildMetaCounts(player, row, level),

    searchText: buildSearchText({
      fullName,
      teamName,
      birthLabel,
      age,
      positions,
      generalPositionLabel,
      generalPositionKey: generalPosition.layerKey,
      typeLabel: typeMeta?.labelH || '',
      activeLabel,
      projectStatusLabel: projectStatusMeta?.labelH || '',
      projectChipLabel: projectChipMeta?.labelH || '',
      squadRoleLabel,
    }),
  }
}
