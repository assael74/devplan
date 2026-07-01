// src/features/playersDatabase/components/leagues/page/players/TeamPlayers.js

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Checkbox, Chip, IconButton, Option, Select, Sheet, Table, Tooltip } from '@mui/joy'
import BarChartIcon from '@mui/icons-material/BarChart'
import CheckIcon from '@mui/icons-material/Check'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import UploadFileIcon from '@mui/icons-material/UploadFile'

import { formatLtr, formatLtrNumber } from '../../../../../../shared/format/direction.js'
import { getPlayerGeneralPosition } from '../../../../../../shared/players/player.positions.utils.js'
import { SCOUT_PROFILES } from '../../../../../../shared/players/scouting/profiles.js'
import { LAYER_TITLES, POSITION_LAYERS } from '../../../../../../shared/players/players.constants.js'
import { playerIcons } from '../../../../../../ui/core/icons/entities/players.icons.js'
import {
  deletePlayerSeasons,
  deletePlayerSeasonsByTeam,
  listPlayerSearchByTeam,
  listPlayerSearchByTeamProfile,
  listPlayerStatsBySeasons,
  listPlayerSeasonsByTeam,
  refreshLeagueTeamIndex,
  updatePlayerSeasonPosition,
} from '../../../../services/pdbPlayers.firestore.js'
import { buildTeamIdentity } from '../../../../catalog/teamIdentity.js'
import DelPlayersModal from './DelPlayersModal.js'
import PlayerStatsModal from '../../../modals/playerStats/PlayerStatsModal.js'
import PlayersImportModal from '../../../modals/players/PlayersImportModal.js'
import { teamPlayersSx as sx } from './sx/teamPlayers.sx.js'

const clean = value => String(value ?? '').trim()
const teamRowsCache = new Map()
const CACHE_PREFIX = 'playersDatabase.teamRows.'

const cacheStorage = {
  get(key) {
    try {
      const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${key}`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      window.sessionStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(value)
      )
    } catch {
      // Session storage is an optimization only.
    }
  },
}

const getTeamCacheKey = team => {
  const primary = clean(team.teamSeasonKey)
  if (primary) return `season:${primary}`

  return [
    'team',
    clean(team.teamSlotId || team.teamId || team.teamCatalogId),
    clean(team.externalTeamId),
    clean(team.seasonId),
    clean(team.leagueId),
    clean(team.ageGroupId),
    clean(team.teamSlot),
    clean(team.clubId),
  ].join('|')
}

const readCachedRows = key => {
  const memoryCache = teamRowsCache.get(key)
  if (memoryCache) return memoryCache

  const storedCache = cacheStorage.get(key)
  if (!storedCache?.rows) return null

  teamRowsCache.set(key, storedCache)
  return storedCache
}

const writeCachedRows = (key, rows) => {
  const payload = {
    rows,
    savedAt: Date.now(),
  }

  teamRowsCache.set(key, payload)
  cacheStorage.set(key, payload)
}

const shouldRefreshTeamIndex = (team, rows) => {
  const currentPlayersCount = Number(team?.playersCount)
  const nextPlayersCount = Array.isArray(rows) ? rows.length : 0

  return (
    Number.isFinite(nextPlayersCount) &&
    nextPlayersCount > 0 &&
    currentPlayersCount !== nextPlayersCount
  )
}

const clearCachedRowsByPrefix = prefix => {
  const keyPrefix = clean(prefix)
  if (!keyPrefix) return

  Array.from(teamRowsCache.keys()).forEach(key => {
    if (key.startsWith(keyPrefix)) teamRowsCache.delete(key)
  })

  try {
    Object.keys(window.sessionStorage || {}).forEach(key => {
      if (key.startsWith(`${CACHE_PREFIX}${keyPrefix}`)) {
        window.sessionStorage.removeItem(key)
      }
    })
  } catch {
    // Session storage is an optimization only.
  }
}

const withTeamIdentity = team => {
  const identity = buildTeamIdentity({
    clubId: team.clubId,
    clubName: team.clubName || team.teamName,
    seasonId: team.seasonId,
    ageGroupId: team.ageGroupId,
    ageGroupLabel: team.ageGroupLabel,
    teamSlot: team.teamSlot,
    leagueId: team.leagueId,
    leagueName: team.leagueName,
    externalTeamId: team.externalTeamId,
  })

  return {
    ...team,
    ...identity,
    teamSeasonKey: clean(team.teamSeasonKey) || identity.teamSeasonKey,
    teamSlotId: clean(team.teamSlotId || team.teamId || team.teamCatalogId) || identity.teamSlotId,
    teamId: clean(team.teamId || team.teamSlotId || team.teamCatalogId) || identity.teamSlotId,
    teamCatalogId: clean(team.teamCatalogId || team.teamSlotId || team.teamId) || identity.teamSlotId,
  }
}

export const getCachedTeamRowsCount = team => {
  const teamCtx = withTeamIdentity(team)
  const cached = readCachedRows(getTeamCacheKey(teamCtx))
  const count = Array.isArray(cached?.rows) ? cached.rows.length : 0

  return count > 0 ? count : null
}

const splitPositions = value => {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean)
  return clean(value).split(/[,\s/|]+/).map(clean).filter(Boolean)
}

const valueOrDash = value => {
  if (value === 0) return '0'
  return clean(value) || '-'
}

const MIDFIELD_LAYERS = ['atMidfield', 'midfield', 'dmMid']
const CLEAR_POSITIONS = '__clear_positions__'

const layerOptions = [
  { id: 'attack', layers: ['attack'], label: LAYER_TITLES.attack, icon: playerIcons.attack },
  { id: 'midfield', layers: MIDFIELD_LAYERS, label: LAYER_TITLES.midfield, icon: playerIcons.midfield },
  { id: 'defense', layers: ['defense'], label: LAYER_TITLES.defense, icon: playerIcons.defense },
  { id: 'goalkeeper', layers: ['goalkeeper'], label: LAYER_TITLES.goalkeeper, icon: playerIcons.goalkeeper },
]

const normalizeLayer = layer => {
  const value = clean(layer)
  return MIDFIELD_LAYERS.includes(value) ? 'midfield' : value
}

const getLayerOption = layer =>
  layerOptions.find(option => option.id === normalizeLayer(layer))

const getPositionOptions = layer => {
  const option = getLayerOption(layer)
  if (!option) return []

  return option.layers.flatMap(item => POSITION_LAYERS[item] || [])
}

const getPositionText = row => {
  const primaryPosition = clean(
    row.primaryPosition ||
    row.positionCode ||
    row.position
  )
  const positionLayer = clean(row.positionLayer || row.layer)
  const positions = splitPositions(row.positions || primaryPosition)

  if (primaryPosition && positionLayer) return `${primaryPosition} / ${positionLayer}`
  if (!primaryPosition && positionLayer) return positionLayer
  if (!primaryPosition && !positions.length) return '-'

  const general = getPlayerGeneralPosition({ positions, primaryPosition })

  if (primaryPosition && general.layerLabel) {
    return `${primaryPosition} / ${general.layerLabel}`
  }

  return primaryPosition || general.layerLabel || '-'
}

const getLayerValue = row => {
  const layer = clean(row.positionLayer || row.layer)
  if (layer) return normalizeLayer(layer)

  const primaryPosition = clean(row.primaryPosition || row.positionCode || row.position)
  const positions = splitPositions(row.positions || primaryPosition)
  return normalizeLayer(getPlayerGeneralPosition({ positions, primaryPosition }).layerKey)
}

const getPositionValue = row =>
  clean(row.primaryPosition || row.positionCode || row.position)

const formatLineupText = row => [
  valueOrDash(row.starts),
  valueOrDash(row.games),
].join('/')

const rowProfileIds = row => {
  const doc = row.statsDoc || row

  return Array.from(new Set([
    ...(Array.isArray(row.scoutProfileIds) ? row.scoutProfileIds : []),
    ...(Array.isArray(row.rawScoutProfileIds) ? row.rawScoutProfileIds : []),
    ...(Array.isArray(doc.scoutProfileIds) ? doc.scoutProfileIds : []),
    ...(Array.isArray(doc.rawScoutProfileIds) ? doc.rawScoutProfileIds : []),
    ...(Array.isArray(doc.eligibleScoutProfileIds) ? doc.eligibleScoutProfileIds : []),
  ].map(clean).filter(Boolean)))
}

const hasProfileId = (row, profileId) => {
  const id = clean(profileId)
  if (!id) return true
  if (
    id === 'promoted_talent' &&
    (
      row.isPlayingUp ||
      row.statsDoc?.isPlayingUp ||
      row.statsDoc?.current?.isYoungerAgeGroup ||
      Number(row.statsDoc?.current?.playingUpMinutes) > 0
    )
  ) {
    return true
  }

  return rowProfileIds(row).includes(id)
}

const profileLabels = Object.fromEntries(
  SCOUT_PROFILES.map(profile => [profile.id, profile.label])
)

const reliabilityLabels = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
}

const reliabilityColors = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
}

const warningLabels = {
  position_not_verified: 'חסרה עמדה',
  low_player_sample: 'מדגם שחקן נמוך',
  low_team_games_sample: 'מדגם קבוצתי נמוך',
  team_context_sensitive: 'רגיש להקשר קבוצתי',
}

const hiddenReliabilityWarnings = new Set([
  'role_inference_only',
  'penalties_not_separated',
])

const getProfileLabel = (profile, id = '') =>
  clean(profile?.label || profile?.profileLabel || profile?.name || profile?.title || profileLabels[id] || profile?.id || id)

const getProfileById = (profiles, id) => {
  if (Array.isArray(profiles)) {
    return profiles.find(profile => clean(profile?.id) === clean(id))
  }

  return profiles?.[id]
}

const getScoutProfilesView = row => {
  const doc = row.statsDoc || {}
  const current = doc.current || {}
  const isPlayingUp = Boolean(
    row.isPlayingUp ||
    doc.isPlayingUp ||
    current.isYoungerAgeGroup ||
    Number(current.playingUpMinutes) > 0
  )
  const eligibleProfiles = doc.eligibleScoutProfiles || doc.scoutProfiles || {}
  const rawProfiles = doc.rawScoutProfiles || {}
  const eligibleIds = Array.isArray(doc.eligibleScoutProfileIds)
    ? doc.eligibleScoutProfileIds
    : Array.isArray(doc.scoutProfileIds)
      ? doc.scoutProfileIds
      : []
  const rawIds = Array.isArray(doc.rawScoutProfileIds) ? doc.rawScoutProfileIds : []
  const ids = eligibleIds.length ? eligibleIds : rawIds
  const profiles = eligibleIds.length ? eligibleProfiles : rawProfiles

  if (!ids.length) {
    if (isPlayingUp) {
      return {
        label: profileLabels.promoted_talent || 'הכישרון המוקפץ',
        title: 'זוהה כשחקן משנתון מתחת',
        reliabilityLabel: 'בינונית',
        reliabilityTitle: 'חסר חישוב מלא ממסמך סטטיסטיקה עדכני',
        reliabilityColor: 'warning',
        color: 'success',
        variant: 'soft',
      }
    }

    return {
      label: '-',
      title: '',
      reliabilityLabel: '-',
      reliabilityTitle: '',
      reliabilityColor: 'neutral',
      color: 'neutral',
      variant: 'plain',
    }
  }

  const labels = ids
    .map(id => getProfileLabel(getProfileById(profiles, id), id))
    .filter(Boolean)
  const bestId = clean(
    doc.bestEligibleScoutProfileId ||
    doc.bestScoutProfileId ||
    doc.bestRawScoutProfileId
  )
  const bestLabel = clean(
    profileLabels[bestId] ||
    doc.bestEligibleScoutProfileLabel ||
    doc.bestScoutProfileLabel ||
    doc.bestRawScoutProfileLabel ||
    labels[0]
  )
  const extraCount = Math.max(ids.length - 1, 0)
  const bestProfile = getProfileById(profiles, bestId) || getProfileById(profiles, ids[0]) || {}
  const reliabilityLevel = clean(
    bestProfile.reliabilityLevel ||
    bestProfile.reliability?.level ||
    doc.bestScoutReliabilityLevel
  )
  const reliabilityScore = bestProfile.reliabilityScore ??
    bestProfile.reliability?.score ??
    doc.bestScoutReliabilityScore
  const warnings = [
    ...(Array.isArray(bestProfile.warnings) ? bestProfile.warnings : []),
    ...(Array.isArray(doc.scoutWarnings) ? doc.scoutWarnings : []),
  ]
  const missing = Array.from(new Set(warnings
    .filter(item => !hiddenReliabilityWarnings.has(item))
    .map(item => warningLabels[item] || item)
    .filter(Boolean)))
  const reliabilityLabel = reliabilityLevel
    ? `${reliabilityLabels[reliabilityLevel] || reliabilityLevel}${Number.isFinite(Number(reliabilityScore)) ? ` ${reliabilityScore}` : ''}`
    : '-'

  return {
    label: extraCount ? `${bestLabel} +${extraCount}` : bestLabel,
    title: labels.join(' | '),
    reliabilityLabel,
    reliabilityTitle: missing.length ? missing.join(' | ') : 'אין חוסרים מהותיים',
    reliabilityColor: reliabilityColors[reliabilityLevel] || 'neutral',
    color: eligibleIds.length ? 'success' : 'warning',
    variant: eligibleIds.length ? 'soft' : 'outlined',
  }
}

const sortNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : -1
}

const withStats = (players, statsBySeason) =>
  players.map(player => {
    const statsDoc = statsBySeason.get(clean(player.id)) || {}
    const stats = statsDoc.current || statsDoc || {}

    return {
      ...player,
      statsDoc,
      games: stats.games ?? player.games,
      goals: stats.goals ?? player.goals,
      yellowCards: stats.yellowCards ?? player.yellowCards,
      starts: stats.starts ?? player.starts,
      subIn: stats.subIn ?? player.subIn,
      subOut: stats.subOut ?? player.subOut,
      minutes: stats.minutes ?? player.minutes,
    }
  }).sort((a, b) => {
    const minutesDiff = sortNumber(b.minutes) - sortNumber(a.minutes)
    if (minutesDiff) return minutesDiff

    const aRow = Number(a?.source?.rowNumber) || 999
    const bRow = Number(b?.source?.rowNumber) || 999
    if (aRow !== bRow) return aRow - bRow

    return clean(a.fullName || a.playerName)
      .localeCompare(clean(b.fullName || b.playerName), 'he')
  })

export default function TeamPlayers({
  team = {},
  teamOptions = [],
  active = false,
  playerSearch,
  activeProfileFilterId = '',
  onLeagueIndexRefresh,
}) {
  const teamCtx = withTeamIdentity(team)
  const activeSearch = Boolean(playerSearch?.active && playerSearch?.profileId)
  const [viewMode, setViewMode] = useState('profiles')
  const effectiveViewMode = activeSearch ? 'search' : viewMode
  const baseCacheKey = useMemo(
    () => getTeamCacheKey(teamCtx),
    [
      teamCtx.teamSeasonKey,
      teamCtx.teamSlotId,
      teamCtx.teamId,
      teamCtx.teamCatalogId,
      teamCtx.externalTeamId,
      teamCtx.seasonId,
      teamCtx.leagueId,
      teamCtx.ageGroupId,
      teamCtx.teamSlot,
      teamCtx.clubId,
    ]
  )
  const cacheKey = useMemo(
    () => {
      if (activeSearch) {
        return [
          baseCacheKey,
          'search',
          clean(playerSearch?.mode || 'eligible'),
          clean(playerSearch?.profileId),
        ].join('|')
      }

      if (effectiveViewMode === 'full') return `${baseCacheKey}|full`
      if (effectiveViewMode === 'profiles') {
        return [
          baseCacheKey,
          'profiles',
          clean(playerSearch?.mode || 'eligible'),
        ].join('|')
      }

      return baseCacheKey
    },
    [
      activeSearch,
      baseCacheKey,
      effectiveViewMode,
      playerSearch?.mode,
      playerSearch?.profileId,
    ]
  )
  const teamList = useMemo(
    () => teamOptions.map(withTeamIdentity),
    [teamOptions]
  )
  const forceRefreshRef = useRef(false)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [delMode, setDelMode] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState({})
  const [playersImportOpen, setPlayersImportOpen] = useState(false)
  const [playerStatsOpen, setPlayerStatsOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [posDrafts, setPosDrafts] = useState({})
  const [savingPos, setSavingPos] = useState({})

  const requestReload = () => {
    forceRefreshRef.current = true
    clearCachedRowsByPrefix(baseCacheKey)
    setReloadKey(value => value + 1)
    onLeagueIndexRefresh?.()
  }

  useEffect(() => {
    let alive = true

    async function load() {
      if (!active || (!teamCtx.teamSeasonKey && !teamCtx.teamSlotId && !teamCtx.externalTeamId && !teamCtx.clubId)) {
        return
      }

      const cached = readCachedRows(cacheKey)
      if (cached && !forceRefreshRef.current) {
        setRows(cached.rows)
        setSelected({})
        setPosDrafts({})
        setError('')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const nextRows = activeSearch
          ? await listPlayerSearchByTeamProfile(teamCtx, playerSearch)
          : effectiveViewMode === 'profiles'
            ? await listPlayerSearchByTeam(teamCtx, {
                mode: playerSearch?.mode || 'eligible',
              })
            : await listPlayerSeasonsByTeam(teamCtx)
        const statsBySeason = activeSearch || effectiveViewMode === 'profiles'
          ? new Map()
          : await listPlayerStatsBySeasons(nextRows, teamCtx)
        if (!alive) return
        const mergedRows = activeSearch || effectiveViewMode === 'profiles'
          ? nextRows
          : withStats(nextRows, statsBySeason)
        writeCachedRows(cacheKey, mergedRows)
        forceRefreshRef.current = false
        setRows(mergedRows)
        setSelected({})
        setPosDrafts({})

        if (
          !activeSearch &&
          effectiveViewMode === 'full' &&
          shouldRefreshTeamIndex(teamCtx, mergedRows)
        ) {
          await refreshLeagueTeamIndex(teamCtx)
          onLeagueIndexRefresh?.()
        }
      } catch (err) {
        if (!alive) return
        setRows([])
        setError(err?.message || 'טעינת שחקנים נכשלה')
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [
    active,
    teamCtx.teamSeasonKey,
    teamCtx.teamSlotId,
    teamCtx.externalTeamId,
    teamCtx.clubId,
    teamCtx.seasonId,
      teamCtx.ageGroupId,
    teamCtx.leagueId,
    teamCtx.teamSlot,
    activeSearch,
    effectiveViewMode,
    playerSearch,
    cacheKey,
    reloadKey,
  ])

  const visibleRows = useMemo(
    () => rows.filter(row => hasProfileId(row, activeProfileFilterId)),
    [activeProfileFilterId, rows]
  )
  const selectedRows = visibleRows.filter(row => selected[row.id])
  const allChecked = Boolean(visibleRows.length) && selectedRows.length === visibleRows.length
  const colSpan = delMode ? 14 : 13
  const fullRosterCount = Number(
    teamCtx.playersCount ||
      team.playersCount ||
      teamCtx.rawPlayersCount ||
      team.rawPlayersCount
  ) || 0
  const profileRosterCount = Number(
    teamCtx.scoutProfilesCount ||
      team.scoutProfilesCount ||
      teamCtx.profilesCount ||
      team.profilesCount
  ) || 0
  const statsRosterCount = Number(
    teamCtx.statsCount ||
      team.statsCount ||
      teamCtx.playersWithStatsCount ||
      team.playersWithStatsCount
  ) || 0
  const viewLabel = activeSearch
    ? playerSearch?.profileLabel || 'חיפוש פרופיל'
    : effectiveViewMode === 'full'
      ? 'סגל מלא'
      : 'פרופילים בלבד'

  const toggleAll = checked => {
    setSelected(checked
      ? Object.fromEntries(visibleRows.map(row => [row.id, true]))
      : {}
    )
  }

  const toggleRow = (id, checked) => {
    setSelected(prev => ({
      ...prev,
      [id]: checked,
    }))
  }

  const openDeletePlayers = event => {
    event.stopPropagation()

    if (!visibleRows.length || deleting) return
    setDelMode(true)
    setSelected({})
  }

  const closeDelMode = () => {
    setDelMode(false)
    setSelected({})
    setDeleteOpen(false)
  }

  const openDeleteConfirm = event => {
    event.stopPropagation()

    if (!selectedRows.length || deleting) return
    setDeleteOpen(true)
  }

  const handleDeletePlayers = async targetRows => {

    if (!targetRows?.length || deleting) return

    setDeleting(true)
    setError('')

    try {
      if (!activeSearch && effectiveViewMode === 'full' && targetRows.length === rows.length) {
        await deletePlayerSeasonsByTeam(teamCtx)
      } else {
        await deletePlayerSeasons(targetRows, teamCtx)
      }
      setDeleteOpen(false)
      setSelected({})
      setDelMode(false)
      requestReload()
    } catch (err) {
      setError(err?.message || 'מחיקת שחקנים נכשלה')
    } finally {
      setDeleting(false)
    }
  }

  const getDraft = row => posDrafts[row.id] || {}

  const getDraftLayerValue = row =>
    'positionLayer' in getDraft(row)
      ? clean(getDraft(row).positionLayer)
      : getLayerValue(row)

  const getDraftPositionValue = row =>
    'primaryPosition' in getDraft(row)
      ? clean(getDraft(row).primaryPosition)
      : getPositionValue(row)

  const hasPositionDraft = row => {
    const draft = getDraft(row)
    if (!draft || !Object.keys(draft).length) return false

    return (
      clean(draft.positionLayer) !== getLayerValue(row) ||
      clean(draft.primaryPosition) !== getPositionValue(row)
    )
  }

  const changeLayer = (row, value) => {
    const positionLayer = clean(value)
    if (!row?.id) return

    if (positionLayer === CLEAR_POSITIONS) {
      setPosDrafts(current => ({
        ...current,
        [row.id]: {
          positionLayer: '',
          primaryPosition: '',
        },
      }))
      return
    }

    if (!positionLayer) return

    const currentPosition = getDraftPositionValue(row)
    const positionStillValid = getPositionOptions(positionLayer)
      .some(option => option.code === currentPosition)

    setPosDrafts(current => ({
      ...current,
      [row.id]: {
        positionLayer,
        primaryPosition: positionStillValid ? currentPosition : '',
      },
    }))
  }

  const changePosition = (row, value) => {
    const primaryPosition = clean(value)
    if (!row?.id) return

    setPosDrafts(current => ({
      ...current,
      [row.id]: {
        positionLayer: getDraftLayerValue(row),
        primaryPosition,
      },
    }))
  }

  const savePositionDraft = async row => {
    const draft = getDraft(row)
    if (!row?.id || !hasPositionDraft(row) || savingPos[row.id]) return

    const positionLayer = 'positionLayer' in draft
      ? clean(draft.positionLayer)
      : getLayerValue(row)
    const primaryPosition = 'primaryPosition' in draft
      ? clean(draft.primaryPosition)
      : getPositionValue(row)
    const patch = {
      positionLayer,
      primaryPosition,
      positions: primaryPosition ? [primaryPosition] : [],
    }

    setSavingPos(current => ({ ...current, [row.id]: true }))
    setError('')
    try {
      await updatePlayerSeasonPosition(row, patch)
      setRows(current => {
        const nextRows = current.map(item => (
          item.id === row.id ? { ...item, ...patch } : item
        ))
        writeCachedRows(cacheKey, nextRows)
        return nextRows
      })
      setPosDrafts(current => {
        const next = { ...current }
        delete next[row.id]
        return next
      })
      onLeagueIndexRefresh?.()
    } catch (err) {
      setError(err?.message || 'עדכון עמדה נכשל')
      requestReload()
    } finally {
      setSavingPos(current => {
        const next = { ...current }
        delete next[row.id]
        return next
      })
    }
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.actionBar}>
        <Chip size="sm" color="primary" variant="soft" sx={sx.viewChip}>
          {viewLabel}
        </Chip>

        <Chip size="sm" color="neutral" variant="soft" sx={sx.viewChip}>
          {formatLtrNumber(fullRosterCount)} שחקנים
        </Chip>

        <Chip size="sm" color="success" variant="soft" sx={sx.viewChip}>
          {formatLtrNumber(profileRosterCount)} פרופילים
        </Chip>

        <Chip size="sm" color="neutral" variant="soft" sx={sx.viewChip}>
          {formatLtrNumber(statsRosterCount)} סטטס
        </Chip>

        {visibleRows.length ? (
          <Chip size="sm" color="primary" variant="outlined" sx={sx.viewChip}>
            נטענו {formatLtrNumber(visibleRows.length)}
            {effectiveViewMode === 'profiles' && fullRosterCount
              ? ` מתוך ${formatLtrNumber(fullRosterCount)}`
              : ''}
          </Chip>
        ) : null}

        {!activeSearch && effectiveViewMode === 'full' ? (
          <Button
            size="sm"
            color="neutral"
            variant="soft"
            disabled={loading}
            onClick={event => {
              event.stopPropagation()
              setViewMode('profiles')
            }}
          >
            פרופילים בלבד
          </Button>
        ) : null}

        <Box sx={sx.spacer} />

        <Button
          size="sm"
          color="primary"
          variant="soft"
          startDecorator={<UploadFileIcon fontSize="small" />}
          onClick={event => {
            event.stopPropagation()
            setPlayersImportOpen(true)
          }}
        >
          טען שחקנים
        </Button>

        <Button
          size="sm"
          color="neutral"
          variant="soft"
          disabled={!rows.length || loading}
          startDecorator={<BarChartIcon fontSize="small" />}
          onClick={event => {
            event.stopPropagation()
            setPlayerStatsOpen(true)
          }}
        >
          טען סטטיסטיקה
        </Button>

        <Button
          size="sm"
          color="danger"
          variant="soft"
          disabled={!visibleRows.length || loading || deleting || delMode}
          loading={deleting}
          startDecorator={<DeleteOutlineIcon fontSize="small" />}
          onClick={openDeletePlayers}
        >
          {selectedRows.length ? `מחק נבחרים (${selectedRows.length})` : 'מחק שחקנים'}
        </Button>
      </Box>

      {delMode ? (
        <Box sx={sx.delBar}>
          <Box sx={sx.delMeta}>
            <DeleteOutlineIcon fontSize="small" />
            <span>מצב מחיקת שחקנים</span>
          </Box>

          <Button
            size="sm"
            color="neutral"
            variant="soft"
            onClick={event => {
              event.stopPropagation()
              toggleAll(true)
            }}
          >
            בחר הכל בתצוגה
          </Button>

          <Button
            size="sm"
            color="neutral"
            variant="plain"
            disabled={!selectedRows.length}
            onClick={event => {
              event.stopPropagation()
              setSelected({})
            }}
          >
            נקה בחירה
          </Button>

          <Box sx={sx.delCount}>{selectedRows.length} נבחרו</Box>
          <Box sx={sx.spacer} />

          <Button
            size="sm"
            color="danger"
            variant="soft"
            disabled={!selectedRows.length || deleting}
            loading={deleting}
            startDecorator={<DeleteOutlineIcon fontSize="small" />}
            onClick={openDeleteConfirm}
          >
            {selectedRows.length ? `מחק ${selectedRows.length} שחקנים` : 'בחר שחקנים למחיקה'}
          </Button>

          <Button
            size="sm"
            color="neutral"
            variant="plain"
            disabled={deleting}
            onClick={event => {
              event.stopPropagation()
              closeDelMode()
            }}
          >
            ביטול
          </Button>
        </Box>
      ) : null}

      <Sheet variant="outlined" className="dpScrollThin" sx={sx.tableWrap}>
        <Table
          size="sm"
          stickyHeader
          className={delMode ? 'isDeleteMode' : ''}
          sx={sx.table}
        >
          <colgroup>
            {delMode ? <col style={{ width: 34 }} /> : null}
            <col style={{ width: 46 }} />
            <col style={{ width: 132 }} />
            <col style={{ width: 84 }} />
            <col style={{ width: 92 }} />
            <col style={{ width: 34 }} />
            <col style={{ width: 144 }} />
            <col style={{ width: 146 }} />
            <col style={{ width: 72 }} />
            <col style={{ width: 78 }} />
            <col style={{ width: 50 }} />
            <col style={{ width: 54 }} />
            <col style={{ width: 54 }} />
            <col style={{ width: 58 }} />
          </colgroup>
          <thead>
            <tr>
              {delMode ? (
                <th>
                  <Checkbox
                    size="sm"
                    checked={allChecked}
                    indeterminate={Boolean(selectedRows.length) && !allChecked}
                    onClick={event => event.stopPropagation()}
                    onChange={event => toggleAll(event.target.checked)}
                  />
                </th>
              ) : null}
              <th>מספר סידורי</th>
              <th>שם שחקן</th>
              <th>חוליה</th>
              <th>עמדה</th>
              <th></th>
              <th>קבוצה</th>
              <th>פרופילי סקאוט</th>
              <th>ודאות</th>
              <th>משחקים/הרכב</th>
              <th>שערים</th>
              <th>צהובים</th>
              <th>הוחלף</th>
              <th>דקות</th>
            </tr>
          </thead>

          <tbody>
            {error ? (
              <tr>
                <td colSpan={colSpan}>{error}</td>
              </tr>
            ) : !visibleRows.length ? (
              <tr>
                <td colSpan={colSpan}>
                  <Box sx={sx.emptyState}>
                    <Box sx={sx.emptyTitle}>
                      {loading
                        ? effectiveViewMode === 'profiles'
                          ? 'טוען שחקנים עם פרופיל'
                          : 'טוען שחקנים'
                        : activeProfileFilterId
                          ? 'אין שחקנים לפרופיל שנבחר'
                          : effectiveViewMode === 'profiles'
                          ? 'אין שחקנים עם פרופיל בקבוצה הזאת'
                          : 'אין שחקנים במאגר לקבוצה הזאת'}
                    </Box>
                    {!loading ? (
                      <Box sx={sx.emptySub}>
                        {activeProfileFilterId
                          ? 'בחר פרופיל אחר או חזור לכל הפרופילים.'
                          : effectiveViewMode === 'profiles'
                          ? 'אפשר לטעון סגל מלא כדי לראות את יתר שחקני הקבוצה.'
                          : 'לאחר טעינת סגל, השחקנים יוצגו כאן ויקושרו לקבוצה, לליגה ולעונה.'}
                      </Box>
                    ) : null}
                  </Box>
                </td>
              </tr>
            ) : visibleRows.map((row, index) => {
              const scoutView = getScoutProfilesView(row)
              const teamName = clean(
                row.sourceTeamName ||
                teamCtx.sourceTeamName ||
                row.teamName ||
                teamCtx.teamName ||
                row.clubName ||
                row.clubDisplayName ||
                teamCtx.clubName
              )

              return (
                <tr key={row.id}>
                  {delMode ? (
                    <td>
                      <Checkbox
                        size="sm"
                        checked={Boolean(selected[row.id])}
                        onClick={event => event.stopPropagation()}
                        onChange={event => toggleRow(row.id, event.target.checked)}
                      />
                    </td>
                  ) : null}
                  <td className="serialCell">
                    {formatLtrNumber(index + 1)}
                  </td>
                  <td>{clean(row.fullName || row.playerName) || '-'}</td>
                  <td className="layerCell">
                    <Select
                      size="sm"
                      variant="plain"
                      value={getDraftLayerValue(row) || null}
                      placeholder="-"
                      sx={sx.layerSelect}
                      onClick={event => event.stopPropagation()}
                      onChange={(event, value) => {
                        event?.stopPropagation?.()
                        changeLayer(row, value)
                      }}
                    >
                      <Option value={CLEAR_POSITIONS}>
                        <Box sx={sx.layerOption}>
                          <Box sx={sx.layerIcon}><DeleteOutlineIcon fontSize="small" /></Box>
                          <span>נקה עמדות</span>
                        </Box>
                      </Option>
                      {layerOptions.map(option => (
                        <Option key={option.id} value={option.id}>
                          <Box sx={sx.layerOption}>
                            <Box sx={sx.layerIcon}>{option.icon}</Box>
                            <span>{option.label}</span>
                          </Box>
                        </Option>
                      ))}
                    </Select>
                  </td>
                  <td className="positionCell">
                    <Select
                      size="sm"
                      variant="plain"
                      value={getDraftPositionValue(row) || null}
                      placeholder="-"
                      disabled={!getDraftLayerValue(row)}
                      sx={sx.positionSelect}
                      onClick={event => event.stopPropagation()}
                      onChange={(event, value) => {
                        event?.stopPropagation?.()
                        changePosition(row, value)
                      }}
                    >
                      {getPositionOptions(getDraftLayerValue(row)).map(option => (
                        <Option key={option.code} value={option.code}>
                          <Box sx={sx.layerOption}>
                            <Box sx={sx.layerIcon}>{playerIcons[option.code] || playerIcons.position}</Box>
                            <span>{option.label}</span>
                          </Box>
                        </Option>
                      ))}
                    </Select>
                  </td>
                  <td>
                    {hasPositionDraft(row) || savingPos[row.id] ? (
                      <IconButton
                        size="sm"
                        variant="soft"
                        color="success"
                        disabled={savingPos[row.id]}
                        aria-label="אשר עמדה"
                        onClick={event => {
                          event.stopPropagation()
                          savePositionDraft(row)
                        }}
                        sx={sx.confirmButton}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </td>
                  <td>{teamName || '-'}</td>
                  <td>
                    <Tooltip title={scoutView.title} disableHoverListener={!scoutView.title}>
                      <Chip
                        size="sm"
                        color={scoutView.color}
                        variant={scoutView.variant}
                        sx={sx.scoutChip}
                      >
                        {scoutView.label}
                      </Chip>
                    </Tooltip>
                  </td>
                  <td>
                    <Tooltip title={scoutView.reliabilityTitle} disableHoverListener={!scoutView.reliabilityTitle}>
                      <Chip
                        size="sm"
                        color={scoutView.reliabilityColor}
                        variant={scoutView.reliabilityLabel === '-' ? 'plain' : 'soft'}
                        sx={sx.reliabilityChip}
                      >
                        {scoutView.reliabilityLabel}
                      </Chip>
                    </Tooltip>
                  </td>
                  <td>{formatLtr(formatLineupText(row))}</td>
                  <td>{formatLtrNumber(row.goals)}</td>
                  <td>{formatLtrNumber(row.yellowCards)}</td>
                  <td>{formatLtrNumber(row.subOut)}</td>
                  <td>{formatLtrNumber(row.minutes)}</td>
                </tr>
              )
            })}

            {!activeSearch && effectiveViewMode !== 'full' ? (
              <tr>
                <td colSpan={colSpan}>
                  <Box sx={sx.loadFullRow}>
                    <Box sx={sx.loadFullText}>
                      מוצגים כרגע שחקנים עם פרופיל בלבד.
                    </Box>

                    <Button
                      size="sm"
                      color="primary"
                      variant="soft"
                      disabled={loading}
                      onClick={event => {
                        event.stopPropagation()
                        setViewMode('full')
                      }}
                    >
                      טען סגל מלא
                    </Button>
                  </Box>
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Sheet>

      <PlayersImportModal
        open={playersImportOpen}
        teamContext={teamCtx}
        existingPlayers={rows}
        onClose={() => setPlayersImportOpen(false)}
        onConnected={requestReload}
      />

      <PlayerStatsModal
        open={playerStatsOpen}
        teamContext={teamCtx}
        teamOptions={teamList}
        existingPlayers={rows}
        onClose={() => setPlayerStatsOpen(false)}
        onAdded={requestReload}
        onSaved={requestReload}
      />

      <DelPlayersModal
        open={deleteOpen}
        rows={selectedRows}
        loading={deleting}
        error={error}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeletePlayers}
      />
    </Box>
  )
}
