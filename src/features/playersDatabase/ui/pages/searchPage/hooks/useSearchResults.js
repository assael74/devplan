// features/playersDatabase/ui/pages/searchPage/hooks/useSearchResults.js

import * as React from 'react'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../../constants/pdb.constants.js'
import { readSearchPageRows } from '../../../../services/read/index.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { usePlayersDatabaseFavorites } from '../../../favorites/index.js'
import {
  adaptPlayerSearchIndexDocument,
  adaptTeamSearchIndexDocument,
} from '../../../../domain/index.js'
import { normalizeSearchRows } from '../logic/search.model.js'
import { buildSearchSummary } from '../logic/search.selectors.js'
import {
  buildSearchResultFilterOptions,
  createSearchResultFilters,
  filterSearchResultRows,
  hasSearchResultFilters,
} from '../logic/searchResultFilters.js'
import { cloneSearchFilters } from './useSearchQueryFilters.js'

const adaptSearchRow = row => (
  row?.entityType === 'birthTeamSeason'
    ? adaptTeamSearchIndexDocument(row)
    : adaptPlayerSearchIndexDocument(row)
)

export default function useSearchResults({ queryFilters }) {
  const favorites = usePlayersDatabaseFavorites()
  const [loadedFilters, setLoadedFilters] = React.useState(null)
  const [loadedRows, setLoadedRows] = React.useState([])
  const [loadLoading, setLoadLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState(null)
  const [loadRevision, setLoadRevision] = React.useState(0)
  const [loadCompletedRevision, setLoadCompletedRevision] = React.useState(0)
  const [pendingNoteKeys, setPendingNoteKeys] = React.useState(() => new Set())
  const [pendingScoutProfileKeys, setPendingScoutProfileKeys] = React.useState(() => new Set())
  const [roleRow, setRoleRow] = React.useState(null)
  const [roleDraft, setRoleDraft] = React.useState({
    positionLayer: '',
    primaryPosition: '',
  })
  const [roleBusy, setRoleBusy] = React.useState(false)
  const [teamUrlRow, setTeamUrlRow] = React.useState(null)
  const [teamUrlSaving, setTeamUrlSaving] = React.useState(false)
  const [resultFilters, setResultFilters] = React.useState(
    createSearchResultFilters
  )

  const loadedFiltersKey = React.useMemo(
    () => JSON.stringify(loadedFilters || null),
    [loadedFilters]
  )

  const favoriteEntityIds = React.useMemo(() => {
    if (!loadedFilters?.favoritesOnly) return []

    return loadedFilters.searchContext === 'team'
      ? favorites.birthTeamFavorites.map(item => item.entityId)
      : favorites.playerFavorites.map(item => item.entityId)
  }, [
    favorites.birthTeamFavorites,
    favorites.playerFavorites,
    loadedFilters?.favoritesOnly,
    loadedFilters?.searchContext,
  ])
  const favoritesKey = React.useMemo(
    () => favoriteEntityIds.slice().sort().join('|'),
    [favoriteEntityIds]
  )

  React.useEffect(() => {
    if (!loadedFilters) {
      setLoadedRows([])
      return undefined
    }

    let active = true

    setLoadLoading(true)
    setLoadError(null)

    readSearchPageRows({
      filters: loadedFilters,
      favoriteEntityIds,
    })
      .then(rows => {
        if (!active) return

        const domainRows = rows.map(adaptSearchRow)
        setLoadedRows(normalizeSearchRows(domainRows))
        setResultFilters(createSearchResultFilters())
        setLoadLoading(false)
        setLoadCompletedRevision(current => current + 1)
      })
      .catch(error => {
        if (!active) return
        setLoadedRows([])
        setLoadError(error)
        setLoadLoading(false)
      })

    return () => {
      active = false
    }
  }, [favoritesKey, loadedFiltersKey, loadRevision, loadedFilters, favoriteEntityIds])

  const loadedEntityType = loadedFilters?.searchContext || ''

  const getRowNoteKey = React.useCallback(row => [
    row?.playerId,
    row?.season?.seasonId || row?.seasonKey,
    row?.team?.teamId || row?.teamName,
  ].map(value => String(value || '').trim()).join('::'), [])

  const getScoutProfileKey = React.useCallback((row, profileId) => [
    getRowNoteKey(row),
    profileId,
  ].map(value => String(value || '').trim()).join('::'), [getRowNoteKey])

  const rowsWithFavorites = React.useMemo(
    () => loadedRows.map(row => {
      const favoriteType = row.entityType === 'birthTeamSeason'
        ? PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM
        : PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER
      const entityId = favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM
        ? row.birthTeamId
        : row.playerId
      const favorite = favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM
        ? favorites.isBirthTeamFavorite(entityId)
        : favorites.isPlayerFavorite(entityId)

      return {
        ...row,
        favorite,
        favoritePending: favorites.isFavoritePending(favoriteType, entityId),
        notesPending: pendingNoteKeys.has(getRowNoteKey(row)),
        scoutProfilePendingIds: (Array.isArray(row.scoutProfiles) ? row.scoutProfiles : [])
          .map(profile => profile?.id)
          .filter(profileId => pendingScoutProfileKeys.has(getScoutProfileKey(row, profileId))),
      }
    }),
    [
      favorites.birthTeamFavoritesMap,
      favorites.pendingKeysRevision,
      favorites.playerFavoritesMap,
      getRowNoteKey,
      getScoutProfileKey,
      loadedRows,
      pendingNoteKeys,
      pendingScoutProfileKeys,
    ]
  )

  const resultFilterOptions = React.useMemo(
    () => buildSearchResultFilterOptions({
      rows: rowsWithFavorites,
      entityType: loadedEntityType,
    }),
    [rowsWithFavorites, loadedEntityType]
  )

  const rows = React.useMemo(
    () => filterSearchResultRows({
      rows: rowsWithFavorites,
      filters: resultFilters,
      entityType: loadedEntityType,
    }),
    [rowsWithFavorites, resultFilters, loadedEntityType]
  )

  const summary = React.useMemo(
    () => buildSearchSummary(rows),
    [rows]
  )

  const updateResultFilter = React.useCallback((field, value) => {
    setResultFilters(current => ({
      ...current,
      [field]: Array.isArray(value) ? value : String(value || ''),
    }))
  }, [])

  const resetResultFilters = React.useCallback(() => {
    setResultFilters(createSearchResultFilters())
  }, [])


  const toggleFavorite = React.useCallback(async row => {
    const isBirthTeam = row?.entityType === 'birthTeamSeason'
    const favoriteType = isBirthTeam
      ? PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM
      : PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER
    const entityId = isBirthTeam ? row?.birthTeamId : row?.playerId

    if (!entityId) return null

    if (row.favorite) {
      return favorites.removeFavorite({
        favoriteType,
        entityId,
      })
    }

    return favorites.addFavorite({
      favoriteType,
      entityId,
      displayName: isBirthTeam ? row.teamName : row.playerName,
      birthYear: row.birthYear,
    })
  }, [favorites])


  const saveNotes = React.useCallback(async (row, notes) => {
    if (row?.entityType === 'birthTeamSeason') return null

    const noteKey = getRowNoteKey(row)
    if (!noteKey || pendingNoteKeys.has(noteKey)) return null

    const previousNotes = String(row?.notes || '')
    const nextNotes = String(notes || '').trim()

    setPendingNoteKeys(current => {
      const next = new Set(current)
      next.add(noteKey)
      return next
    })
    setLoadedRows(current => current.map(item => (
      getRowNoteKey(item) === noteKey
        ? { ...item, notes: nextNotes }
        : item
    )))

    try {
      const identity = row?.identity || {}
      const metadata = row?.metadata || {}
      const season = row?.season || {}
      const team = row?.team || {}

      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_NOTES,
        payload: {
          league: {
            ...(row?.league || {}),
            id: row?.league?.id || team.leagueId || '',
          },
          season: {
            ...season,
            seasonId: season.seasonId || row?.seasonId || '',
            seasonKey: season.seasonKey || row?.seasonKey || '',
          },
          team: {
            ...team,
            birthTeamId: team.birthTeamId || team.teamId || row?.birthTeamId || '',
            teamId: team.teamId || team.birthTeamId || row?.birthTeamId || '',
          },
          player: {
            ...identity,
            playerId: row?.playerId || identity.playerId,
            playerDocumentId:
              identity.playerDocumentId ||
              metadata.sourceDocumentId ||
              row?.playerDocumentId ||
              row?.id,
            fullName: row?.playerName || identity.displayName || '',
            matchedPlayerName: row?.playerName || identity.displayName || '',
          },
          target: metadata.sourceTarget || row?.lifecycle?.type || 'current',
          notes: nextNotes,
        },
      })

      if (result?.playerSeasonResult?.updated !== true) {
        const reason = result?.playerSeasonResult?.reason || 'playerSeasonNotUpdated'
        throw new Error(`ההערה לא נשמרה במסמך השחקן: ${reason}`)
      }

      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        getRowNoteKey(item) === noteKey
          ? { ...item, notes: previousNotes }
          : item
      )))
      throw error
    } finally {
      setPendingNoteKeys(current => {
        const next = new Set(current)
        next.delete(noteKey)
        return next
      })
    }
  }, [getRowNoteKey, pendingNoteKeys])


  const removeScoutProfile = React.useCallback(async (row, profile) => {
    if (!row || row.entityType === 'birthTeamSeason') return null

    const profileId = String(profile?.id || profile?.profileId || '').trim()
    const profileKey = getScoutProfileKey(row, profileId)
    if (!profileId || pendingScoutProfileKeys.has(profileKey)) return null

    const previousProfiles = Array.isArray(row.scoutProfiles)
      ? row.scoutProfiles
      : []
    const nextProfiles = previousProfiles.filter(item => (
      String(item?.id || item?.profileId || '').trim() !== profileId
    ))

    setPendingScoutProfileKeys(current => {
      const next = new Set(current)
      next.add(profileKey)
      return next
    })
    setLoadedRows(current => current.map(item => (
      getRowNoteKey(item) === getRowNoteKey(row)
        ? { ...item, scoutProfiles: nextProfiles }
        : item
    )))

    try {
      const identity = row.identity || {}
      const metadata = row.metadata || {}
      const season = row.season || {}
      const team = row.team || {}
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.REMOVE_PLAYER_SCOUT_PROFILE,
        payload: {
          league: {
            ...(row.league || {}),
            id: row.league?.id || team.leagueId || '',
          },
          season: {
            ...season,
            seasonId: season.seasonId || row.seasonId || '',
            seasonKey: season.seasonKey || row.seasonKey || '',
          },
          team: {
            ...team,
            birthTeamId: team.birthTeamId || team.teamId || row.birthTeamId || '',
            teamId: team.teamId || team.birthTeamId || row.birthTeamId || '',
          },
          player: {
            ...identity,
            playerId: row.playerId || identity.playerId,
            playerDocumentId:
              identity.playerDocumentId ||
              metadata.sourceDocumentId ||
              row.playerDocumentId ||
              row.id,
            fullName: row.playerName || identity.displayName || '',
            matchedPlayerName: row.playerName || identity.displayName || '',
            scoutProfiles: previousProfiles,
            scoutSignals: previousProfiles,
          },
          target: metadata.sourceTarget || row.lifecycle?.type || 'current',
          profileId,
        },
      })

      if (result?.completed !== true) {
        throw new Error(`מחיקת הפרופיל נעצרה בשלב ${result?.stoppedAt || 'לא ידוע'}`)
      }

      setLoadRevision(current => current + 1)
      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        getRowNoteKey(item) === getRowNoteKey(row)
          ? { ...item, scoutProfiles: previousProfiles }
          : item
      )))
      throw error
    } finally {
      setPendingScoutProfileKeys(current => {
        const next = new Set(current)
        next.delete(profileKey)
        return next
      })
    }
  }, [getRowNoteKey, getScoutProfileKey, pendingScoutProfileKeys])


  const openRoleEditor = React.useCallback(row => {
    if (!row || row.entityType === 'birthTeamSeason') return

    setRoleRow(row)
    setRoleDraft({
      positionLayer: row.positionLayer || row.position?.layer || '',
      primaryPosition: row.primaryPosition || row.position?.primary || '',
    })
  }, [])

  const closeRoleEditor = React.useCallback(() => {
    if (roleBusy) return

    setRoleRow(null)
    setRoleDraft({
      positionLayer: '',
      primaryPosition: '',
    })
  }, [roleBusy])

  const confirmRoleEditor = React.useCallback(async () => {
    if (!roleRow || roleBusy) return null

    const rowKey = getRowNoteKey(roleRow)
    const previousPositionLayer = roleRow.positionLayer || roleRow.position?.layer || ''
    const previousPrimaryPosition = roleRow.primaryPosition || roleRow.position?.primary || ''

    setRoleBusy(true)
    setLoadedRows(current => current.map(item => (
      getRowNoteKey(item) === rowKey
        ? {
          ...item,
          positionLayer: roleDraft.positionLayer,
          primaryPosition: roleDraft.primaryPosition,
          position: {
            ...(item.position || {}),
            layer: roleDraft.positionLayer,
            primary: roleDraft.primaryPosition,
          },
        }
        : item
    )))

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_ROLE,
        payload: {
          league: roleRow.league || {},
          season: roleRow.season || {},
          team: roleRow.team || {},
          player: {
            ...(roleRow.identity || {}),
            playerId: roleRow.playerId || roleRow.identity?.playerId,
            playerDocumentId: roleRow.identity?.playerDocumentId || roleRow.id,
            positionLayer: previousPositionLayer,
            primaryPosition: previousPrimaryPosition,
            numShirt: roleRow.numShirt || roleRow.position?.shirtNumber || '',
          },
          target: roleRow.metadata?.sourceTarget || roleRow.lifecycle?.type || 'current',
          positionLayer: roleDraft.positionLayer,
          primaryPosition: roleDraft.primaryPosition,
          numShirt: roleRow.numShirt || roleRow.position?.shirtNumber || '',
        },
      })

      setRoleRow(null)
      setRoleDraft({
        positionLayer: '',
        primaryPosition: '',
      })
      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        getRowNoteKey(item) === rowKey
          ? {
            ...item,
            positionLayer: previousPositionLayer,
            primaryPosition: previousPrimaryPosition,
            position: {
              ...(item.position || {}),
              layer: previousPositionLayer,
              primary: previousPrimaryPosition,
            },
          }
          : item
      )))
      throw error
    } finally {
      setRoleBusy(false)
    }
  }, [getRowNoteKey, roleBusy, roleDraft, roleRow])



  const openTeamUrlEditor = React.useCallback(row => {
    if (!row || row.entityType !== 'birthTeamSeason') return
    setTeamUrlRow(row)
  }, [])

  const closeTeamUrlEditor = React.useCallback(() => {
    if (teamUrlSaving) return
    setTeamUrlRow(null)
  }, [teamUrlSaving])

  const saveTeamUrl = React.useCallback(async teamUrl => {
    if (!teamUrlRow || teamUrlSaving) return null

    const rowId = teamUrlRow.id
    const previousUrl = String(teamUrlRow.teamUrl || teamUrlRow.metadata?.teamUrl || '').trim()
    const nextUrl = String(teamUrl || '').trim()

    setTeamUrlSaving(true)
    setLoadedRows(current => current.map(item => (
      item.id === rowId
        ? {
          ...item,
          teamUrl: nextUrl,
          metadata: {
            ...(item.metadata || {}),
            teamUrl: nextUrl,
          },
        }
        : item
    )))

    try {
      const metadata = teamUrlRow.metadata || {}
      const identity = teamUrlRow.identity || {}
      const season = teamUrlRow.season || {}
      const league = teamUrlRow.league || {}

      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_TEAM_URL,
        payload: {
          target: metadata.sourceTarget || teamUrlRow.lifecycle?.type || 'current',
          league: {
            ...league,
            id: league.id || league.leagueId || '',
          },
          season: {
            ...season,
            seasonId: season.seasonId || teamUrlRow.seasonId || '',
            seasonKey: season.seasonKey || teamUrlRow.seasonKey || '',
          },
          team: {
            ...identity,
            birthTeamId: identity.teamId || teamUrlRow.birthTeamId || '',
            teamId: identity.teamId || teamUrlRow.birthTeamId || '',
            teamDocumentId: identity.teamDocumentId || teamUrlRow.id || '',
            name: teamUrlRow.teamName || identity.displayName || '',
            teamName: teamUrlRow.teamName || identity.displayName || '',
            teamUrl: nextUrl,
          },
        },
      })

      setTeamUrlRow(null)
      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        item.id === rowId
          ? {
            ...item,
            teamUrl: previousUrl,
            metadata: {
              ...(item.metadata || {}),
              teamUrl: previousUrl,
            },
          }
          : item
      )))
      throw error
    } finally {
      setTeamUrlSaving(false)
    }
  }, [teamUrlRow, teamUrlSaving])

  const roleChanged = Boolean(
    roleRow && (
      roleDraft.positionLayer !== (roleRow.positionLayer || roleRow.position?.layer || '') ||
      roleDraft.primaryPosition !== (roleRow.primaryPosition || roleRow.position?.primary || '')
    )
  )

  const loadDocuments = React.useCallback(() => {
    setLoadedFilters(cloneSearchFilters(queryFilters))
    setLoadRevision(current => current + 1)
  }, [queryFilters])

  return {
    rows,
    loadedRowsCount: loadedRows.length,
    resultFilters,
    resultFilterOptions,
    hasResultFilters: hasSearchResultFilters(resultFilters),
    summary,
    hasLoaded: Boolean(loadedFilters),
    loadedEntityType,
    loadLoading,
    loadError,
    loadCompletedRevision,
    updateResultFilter,
    resetResultFilters,
    toggleFavorite,
    saveNotes,
    removeScoutProfile,
    teamUrlEditor: {
      row: teamUrlRow,
      saving: teamUrlSaving,
      open: openTeamUrlEditor,
      close: closeTeamUrlEditor,
      save: saveTeamUrl,
    },
    roleEditor: {
      row: roleRow,
      draft: roleDraft,
      busy: roleBusy,
      changed: roleChanged,
      setDraft: setRoleDraft,
      open: openRoleEditor,
      close: closeRoleEditor,
      confirm: confirmRoleEditor,
    },
    loadDocuments,
  }
}
