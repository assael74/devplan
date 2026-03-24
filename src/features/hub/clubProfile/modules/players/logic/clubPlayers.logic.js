// clubProfile/modules/players/logic/clubPlayers.logic.js

import { getPlayerAge } from '../../../../../../shared/players/player.age.utils.js'
import { getPlayerGeneralPosition } from '../../../../../../shared/players/player.positions.utils.js'
import { getPlayerQuickStats } from '../../../../../../shared/players/player.quickStats.utils.js'
import {
  PLAYERS_TYPES,
  PROJECT_STATUS_CANDIDATE,
} from '../../../../../../shared/players/players.constants.js'

const safe = (v) => (v == null ? '' : String(v))
const norm = (v) => safe(v).trim()

const toArr = (v) => {
  if (Array.isArray(v)) return v.filter(Boolean)

  const s = norm(v)
  if (!s) return []

  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

const countList = (v) => {
  if (Array.isArray(v)) return v.length
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (v && typeof v === 'object') return Object.keys(v).length
  return 0
}

const pickId = (raw) => raw?.playerId || raw?.player?.id || raw?.id || null
const pickPlayer = (raw) => raw?.player || raw || {}

const pickPositions = (player, raw) => {
  if (raw?.positions != null) return toArr(raw.positions)
  if (player?.positions != null) return toArr(player.positions)
  return []
}

const pickLevel = (player, raw) => {
  const n = Number(raw?.level ?? player?.level ?? raw?.rating ?? player?.rating ?? 0)
  return Number.isFinite(n) ? n : 0
}

const pickBirthLabel = (player, raw) => {
  return (
    norm(raw?.birthDay) ||
    norm(player?.birthDay) ||
    norm(raw?.birth) ||
    norm(player?.birth) ||
    ''
  )
}

const pickAge = (player, raw) => {
  const direct = Number(raw?.age ?? player?.age)
  if (Number.isFinite(direct)) return direct

  return getPlayerAge({
    birthDay: raw?.birthDay || player?.birthDay || '',
    birth: raw?.birth || player?.birth || '',
  })
}

const getPlayerTypeMeta = (typeId) => {
  return (
    PLAYERS_TYPES.find((x) => x.id === typeId) ||
    PLAYERS_TYPES.find((x) => x.id === 'noneType') ||
    {
      id: 'noneType',
      labelH: 'כללי',
      idIcon: 'noneType',
      disabled: false,
    }
  )
}

const getProjectStatusMeta = (statusId) => {
  const id = norm(statusId)
  if (!id) return null
  return PROJECT_STATUS_CANDIDATE.find((x) => x.id === id) || null
}

const getProjectChipMeta = ({
  type,
  projectStatus,
  typeMeta,
  projectStatusMeta,
}) => {
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

const buildMetaCounts = (player, raw, level) => {
  const games = countList(raw?.games || player?.games)
  const meetings = countList(raw?.meetings || player?.meetings)
  const payments = countList(raw?.payments || player?.payments)
  const abilities = countList(raw?.abilities || player?.abilities)

  const lvl = Number(level) || 0
  const hasUsage = games + meetings + payments + abilities > 0 || lvl > 0

  return {
    games,
    meetings,
    payments,
    abilities,
    level: lvl,
    hasUsage,
  }
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
  teamName,
}) => {
  return [
    fullName,
    birthLabel,
    Number.isFinite(age) ? `גיל ${age}` : '',
    positions.join(' '),
    generalPositionLabel,
    generalPositionKey,
    typeLabel,
    activeLabel,
    projectStatusLabel,
    projectChipLabel,
    teamName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function buildRowTeamMeta(player, raw, club) {
  return {
    teamId: raw?.teamId || player?.teamId || null,
    teamName: raw?.teamName || player?.teamName || '',
    clubId: club?.id || raw?.clubId || player?.clubId || null,
    clubName: club?.clubName || raw?.clubName || player?.clubName || '',
  }
}

export function normalizeClubPlayerRow(raw, club) {
  const r = raw || {}
  const p = pickPlayer(r)
  const id = pickId(r)

  const positions = pickPositions(p, r)
  const level = pickLevel(p, r)
  const birthLabel = pickBirthLabel(p, r)
  const age = pickAge(p, r)

  const fullName =
    [p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ') ||
    norm(r?.fullName) ||
    '—'

  const active = r?.active != null ? r.active : p?.active != null ? p.active : true
  const isKey = (r?.isKey ?? p?.isKey ?? false) === true
  const type = norm(r?.type || p?.type) || 'noneType'
  const projectStatus = norm(r?.projectStatus || p?.projectStatus)

  const playerFullStats = getPlayerQuickStats({ player: p, team: club })

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
  const generalPositionLabel = generalPosition.layerLabel || generalPosition.layerKey || ''
  const teamMeta = buildRowTeamMeta(p, r, club)

  return {
    id,
    playerId: id,
    fullName,
    photo: p?.photo || r?.photo || null,

    active,
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
    metaCounts: buildMetaCounts(p, r, level),

    ...teamMeta,

    searchText: buildSearchText({
      fullName,
      birthLabel,
      age,
      positions,
      generalPositionLabel,
      generalPositionKey: generalPosition.layerKey,
      typeLabel: typeMeta?.labelH || '',
      activeLabel,
      projectStatusLabel: projectStatusMeta?.labelH || '',
      projectChipLabel: projectChipMeta?.labelH || '',
      teamName: teamMeta?.teamName || '',
    }),

    raw: r,
    player: p,
  }
}

function getPositionBuckets(rows) {
  const map = new Map()

  rows.forEach((row) => {
    const key = row?.generalPositionKey || 'none'
    const label = row?.generalPositionLabel || 'ללא עמדה'

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        label,
        count: 0,
      })
    }

    map.get(key).count += 1
  })

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

function resolveClubPlayersBase(club) {
  if (Array.isArray(club?.players) && club.players.length) return club.players
  if (Array.isArray(club?.clubPlayers) && club.clubPlayers.length) return club.clubPlayers
  if (Array.isArray(club?.playersFull) && club.playersFull.length) return club.playersFull

  if (Array.isArray(club?.teams)) {
    return club.teams.flatMap((team) => {
      if (Array.isArray(team?.players)) {
        return team.players.map((player) => ({
          ...player,
          teamId: team?.id,
          teamName: team?.teamName,
        }))
      }
      return []
    })
  }

  return []
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
      key: rows.filter((x) => x.isKey).length,
      project: rows.filter((x) => x.projectChipMeta?.id === 'project').length,
      candidate: rows.filter((x) => x.projectChipMeta?.id === 'candidateFlow').length,
      positionBuckets: getPositionBuckets(rows),
    },
  }
}
