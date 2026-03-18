// teamProfile/modules/players/logic/teamPlayers.logic.js

import { getPlayerAge } from '../../../../../../shared/players/player.age.utils.js'
import { getPlayerGeneralPosition } from '../../../../../../shared/players/player.positions.utils.js'
import { getPlayerQuickStats } from '../../../../../../shared/players/player.quickStats.utils.js'
import { PLAYERS_TYPES, PROJECT_STATUS_CANDIDATE } from '../../../../../../shared/players/players.constants.js'

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

const pickId = (r) => (r && (r.playerId || r?.player?.id || r.id)) || null
const pickPlayer = (r) => (r && (r.player || r)) || {}

const pickPositions = (p, r) => {
  if (r?.positions != null) return toArr(r.positions)
  if (p?.positions != null) return toArr(p.positions)
  return []
}

const pickLevel = (p, r) => {
  const n = Number(r?.level ?? p?.level ?? r?.rating ?? p?.rating ?? 0)
  return Number.isFinite(n) ? n : 0
}

const pickBirthLabel = (p, r) => {
  return norm(r?.birthDay) || norm(p?.birthDay) || norm(r?.birth) || norm(p?.birth) || ''
}

const pickAge = (p, r) => {
  const direct = Number(r?.age ?? p?.age)
  if (Number.isFinite(direct)) return direct

  return getPlayerAge({
    birthDay: r?.birthDay || p?.birthDay || '',
    birth: r?.birth || p?.birth || '',
  })
}

const getPlayerTypeMeta = (typeId) => {
  return (
    PLAYERS_TYPES.find((x) => x.id === typeId) ||
    PLAYERS_TYPES.find((x) => x.id === 'noneType') ||
    { id: 'noneType', labelH: 'כללי', idIcon: 'noneType', disabled: false }
  )
}

const getProjectStatusMeta = (statusId) => {
  const normalized = norm(statusId)
  if (!normalized) return null

  return PROJECT_STATUS_CANDIDATE.find((x) => x.id === normalized) || null
}

const getProjectChipMeta = ({ type, projectStatus, typeMeta, projectStatusMeta }) => {
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

const buildMetaCounts = (p, r, level) => {
  const games = countList(r?.games || p?.games)
  const meetings = countList(r?.meetings || p?.meetings)
  const payments = countList(r?.payments || p?.payments)
  const abilities = countList(r?.abilities || p?.abilities)
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
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export const normalizeTeamPlayerRow = (raw, team) => {
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

  const playerFullStats = getPlayerQuickStats({ player: p, team })

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
    }),

    raw: r,
    player: p,
  }
}

const getPositionBuckets = (rows) => {
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

export const resolveTeamPlayers = (team) => {
  const base = Array.isArray(team?.players) ? team.players : []
  const rows = base
    .map((item) => normalizeTeamPlayerRow(item, team))
    .filter((x) => !!x.id)

  return {
    teamFullStats: team?.teamFullStats || {},
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
