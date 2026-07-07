// features/playersDatabase/components/leagues/players/TeamPlayers.js

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
} from '@mui/joy'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import {
  clean,
  invalidatePlayersDatabaseAfterTeamChange,
  withTeamIdentity,
} from '../../../sharedLogic/index.js'
import {
  deletePlayerSeasons,
  deletePlayerSeasonsByTeam,
  listPlayerSearchByTeam,
  listPlayerSearchByTeamProfile,
  listPlayerStatsBySeasons,
  listPlayerSeasonsByTeam,
  refreshLeagueTeamIndex,
  updatePlayerSeasonPosition,
} from '../../../services/pdbPlayers.firestore.js'
import DelPlayersModal from './DelPlayersModal.js'
import PlayerStatsModal from '../../modals/playerStats/PlayerStatsModal.js'
import PlayersImportModal from '../../modals/players/PlayersImportModal.js'
import TeamPlayersTable from './TeamPlayersTable.js'
import TeamPlayersToolbar from './TeamPlayersToolbar.js'
import {
  buildPositionPatch,
  CLEAR_POSITIONS,
  getDraftLayerValue as getDraftLayerValueBase,
  getDraftPositionValue as getDraftPositionValueBase,
  getPositionOptions,
  hasPositionDraft as hasPositionDraftBase,
} from './logic/teamPlayersPosition.logic.js'
import {
  clearCachedTeamPlayersRows,
  getCachedTeamPlayersRowsCount,
  getTeamPlayersBaseCacheKey,
  getTeamPlayersCacheKey,
  readCachedTeamPlayersRows,
  writeCachedTeamPlayersRows,
} from './logic/teamPlayersCache.logic.js'
import {
  hasProfileId,
} from './logic/teamPlayersScoutView.logic.js'
import {
  mergePlayersWithStats,
  shouldRefreshTeamIndex,
} from './logic/teamPlayersRows.logic.js'
import { teamPlayersSx as sx } from './sx/teamPlayers.sx.js'

export const getCachedTeamRowsCount = getCachedTeamPlayersRowsCount

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
    () => getTeamPlayersBaseCacheKey(teamCtx),
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
    () =>
      getTeamPlayersCacheKey({
        team: teamCtx,
        activeSearch,
        effectiveViewMode,
        playerSearch,
      }),
    [
      activeSearch,
      effectiveViewMode,
      playerSearch?.mode,
      playerSearch?.profileId,
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
    clearCachedTeamPlayersRows(baseCacheKey)
    setReloadKey(value => value + 1)
    invalidatePlayersDatabaseAfterTeamChange()
    onLeagueIndexRefresh()
  }

  useEffect(() => {
    let alive = true

    async function load() {
      if (
        !active ||
        (
          !teamCtx.teamSeasonKey &&
          !teamCtx.teamSlotId &&
          !teamCtx.externalTeamId &&
          !teamCtx.clubId
        )
      ) {
        return
      }

      const cachedRows = readCachedTeamPlayersRows(cacheKey)

      if (cachedRows && !forceRefreshRef.current) {
        setRows(cachedRows)
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
          : mergePlayersWithStats(nextRows, statsBySeason)

        writeCachedTeamPlayersRows(cacheKey, mergedRows)
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
          invalidatePlayersDatabaseAfterTeamChange()
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
    setSelected(current => ({
      ...current,
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
    getDraftLayerValueBase(row, getDraft(row))

  const getDraftPositionValue = row =>
    getDraftPositionValueBase(row, getDraft(row))

  const hasPositionDraft = row =>
    hasPositionDraftBase(row, getDraft(row))

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

    const patch = buildPositionPatch(row, draft)

    setSavingPos(current => ({ ...current, [row.id]: true }))
    setError('')

    try {
      await updatePlayerSeasonPosition(row, patch)

      setRows(current => {
        const nextRows = current.map(item => (
          item.id === row.id ? { ...item, ...patch } : item
        ))

        writeCachedTeamPlayersRows(cacheKey, nextRows)

        return nextRows
      })

      setPosDrafts(current => {
        const next = { ...current }
        delete next[row.id]

        return next
      })

      invalidatePlayersDatabaseAfterTeamChange()
      onLeagueIndexRefresh()
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
      <TeamPlayersToolbar
        viewLabel={viewLabel}
        fullRosterCount={fullRosterCount}
        profileRosterCount={profileRosterCount}
        statsRosterCount={statsRosterCount}
        visibleRowsCount={visibleRows.length}
        effectiveViewMode={effectiveViewMode}
        fullRosterVisible={effectiveViewMode === 'full'}
        loading={loading}
        deleting={deleting}
        delMode={delMode}
        selectedRowsCount={selectedRows.length}
        activeSearch={activeSearch}
        onShowProfilesOnly={event => {
          event.stopPropagation()
          setViewMode('profiles')
        }}
        onOpenImport={event => {
          event.stopPropagation()
          setPlayersImportOpen(true)
        }}
        onOpenStats={event => {
          event.stopPropagation()
          setPlayerStatsOpen(true)
        }}
        onOpenDelete={openDeletePlayers}
      />

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

      <TeamPlayersTable
        rows={visibleRows}
        teamCtx={teamCtx}
        loading={loading}
        error={error}
        delMode={delMode}
        selected={selected}
        selectedRowsCount={selectedRows.length}
        allChecked={allChecked}
        colSpan={colSpan}
        activeSearch={activeSearch}
        effectiveViewMode={effectiveViewMode}
        activeProfileFilterId={activeProfileFilterId}
        savingPos={savingPos}
        getDraftLayerValue={getDraftLayerValue}
        getDraftPositionValue={getDraftPositionValue}
        hasPositionDraft={hasPositionDraft}
        onToggleAll={toggleAll}
        onToggleRow={toggleRow}
        onChangeLayer={changeLayer}
        onChangePosition={changePosition}
        onSavePosition={savePositionDraft}
        onLoadFull={() => setViewMode('full')}
      />

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
