// features/playersDatabase/ui/pages/teamPage/roster/import/hooks/useTeamRosterImport.js

import * as React from 'react'
import {
  prepareRosterImportPlan,
  syncRosterClubsMasterV2,
  syncRosterClubsV2,
  syncRosterCounterpartsV2,
  syncRosterLeaguesMasterV2,
  syncRosterPlayerIndexesV2,
  syncRosterTeamProjectionV2,
  writeRosterV2,
} from '../../../../../../services/writeV2/roster/index.js'
import { resolveTeamPlayerIdentityPreview } from '../../../../../../services/read/identity/playerIdentityPreview.read.js'
import {
  listExistingTeamRootOptions,
  readTeamSeasonRosterHistory,
} from '../../../../../../services/read/index.js'
import { buildCleanApprovedRosterState } from '../../../../../../domain/builders/approvedRosterState.builder.js'
import {
  ROSTER_IMPORT_MODE,
  mergeLocalAndResolvedPlayers,
  resolveRosterPlayersLocally,
} from '../../../../../../domain/movement/index.js'
import { resolveTeamLookupKey } from '../../../../../../model/team/teamIdentity.model.js'
import { SNACK_STATUS } from '../../../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  parsePlayerRosterRows,
  resolveRosterImportMetadata,
} from '../logic/teamRosterImport.logic.js'
import { buildWriteReportFromError } from '../../../logic/writeFlowReport.logic.js'
import useRosterIdentityReview from './useRosterIdentityReview.js'
import useRosterMovementReview from './useRosterMovementReview.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const ROSTER_IMPORT_DEBUG_PREFIX = '[playersDatabase/roster-import-debug]'
const ROSTER_SYNC_STAGE_IDS = [
  'canonical',
  'counterparts',
  'playerIndexes',
  'teamProjection',
  'leaguesMaster',
  'clubs',
  'clubsMaster',
]
const logRosterImportDebug = (event, details = {}) => {
  console.info(ROSTER_IMPORT_DEBUG_PREFIX, {
    event,
    at: new Date().toISOString(),
    ...details,
  })
}
const playerMatchKeys = player => [
  clean(player?.playerId),
  clean(player?.externalPlayerId),
  clean(player?.identityKey),
  clean(player?.fullName).toLowerCase(),
].filter(Boolean)
const playerMatches = (left, right) => {
  const rightKeys = new Set(playerMatchKeys(right))
  return playerMatchKeys(left).some(key => rightKeys.has(key))
}

export default function useTeamRosterImport({
  leagueId,
  leagueDoc,
  leagueDocuments = [],
  team,
  seasonOptions = [],
  selectedSeasonOption: pageSelectedSeasonOption = null,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedSeasonOptionKey, setSelectedSeasonOptionKey] = React.useState('')
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [previousRoster, setPreviousRoster] = React.useState({
    loading: false,
    seasonKey: '',
    players: [],
  })
  const [missingRosterPlayers, setMissingRosterPlayers] = React.useState([])
  const [teamRootOptions, setTeamRootOptions] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)
  const [rosterImportPlan, setRosterImportPlan] = React.useState(null)
  const [syncState, setSyncState] = React.useState({
    activeStage: '',
    completedStages: [],
    error: null,
    results: {},
  })
  const syncCacheRefreshRef = React.useRef(false)

  const selectedSeasonOption = React.useMemo(() => (
    seasonOptions.find(option => option.optionKey === selectedSeasonOptionKey) || null
  ), [seasonOptions, selectedSeasonOptionKey])

  const actionLeagueId = selectedSeasonOption?.leagueId || leagueId
  const actionLeagueDoc = React.useMemo(() => (
    leagueDocuments.find(document => (
      String(document?.id || document?.leagueId || '').trim() === String(actionLeagueId || '').trim()
    )) || leagueDoc
  ), [actionLeagueId, leagueDoc, leagueDocuments])

  const debugState = React.useMemo(() => ({
    open,
    season: {
      optionKey: selectedSeasonOptionKey,
      seasonKey: clean(selectedSeasonOption?.seasonKey),
      target: clean(selectedSeasonOption?.target),
    },
    input: {
      pastedCharacters: pasteValue.length,
      rows: rows.map(row => ({
        playerId: clean(row?.playerId),
        externalPlayerId: clean(row?.externalPlayerId),
        fullName: clean(row?.fullName),
        identityValid: row?.identityValid !== false,
        identityResolution: clean(row?.identityResolution),
        rosterImportResolution: clean(row?.rosterImportResolution),
      })),
      missingPlayers: missingRosterPlayers.map(player => ({
        playerId: clean(player?.playerId),
        externalPlayerId: clean(player?.externalPlayerId),
        fullName: clean(player?.fullName),
        resolution: clean(player?.missingResolution),
        targetTeamId: clean(player?.statsMovementTeam?.birthTeamDocumentId),
      })),
    },
    plan: rosterImportPlan ? {
      planType: clean(rosterImportPlan?.planType),
      playersCount: rosterImportPlan?.preview?.playersCount || 0,
      movement: rosterImportPlan?.movementState || null,
    } : null,
    runtime: {
      busy,
      syncState,
    },
  }), [
    busy,
    missingRosterPlayers,
    open,
    pasteValue.length,
    syncState,
    rosterImportPlan,
    rows,
    selectedSeasonOption?.seasonKey,
    selectedSeasonOption?.target,
    selectedSeasonOptionKey,
  ])

  React.useEffect(() => {
    logRosterImportDebug('state-updated', { state: debugState })
  }, [debugState])


  const buildSeason = React.useCallback(() => ({
    ...(selectedSeasonOption?.season || {}),
    leagueId: actionLeagueId,
    ageGroupId: team.ageGroupId,
    birthYear: team.birthYear,
    seasonId: selectedSeasonOption?.seasonId,
    seasonKey: selectedSeasonOption?.seasonKey,
  }), [actionLeagueId, selectedSeasonOption, team.ageGroupId, team.birthYear])

  const selectSeasonOption = React.useCallback(optionKey => {
    logRosterImportDebug('season-selected', {
      state: debugState,
      systemAction: { type: 'read-previous-roster', optionKey: clean(optionKey) },
    })
    setSelectedSeasonOptionKey(optionKey)
    setRows([])
    setMissingRosterPlayers([])
    setTeamRootOptions([])
    setPasteValue('')
    setRosterImportPlan(null)
    const option = seasonOptions.find(item => item.optionKey === optionKey)

    if (!option) {
      setPreviousRoster({ loading: false, seasonKey: '', players: [] })
      return
    }

    setPreviousRoster({ loading: true, seasonKey: '', players: [] })

    readTeamSeasonRosterHistory({
      birthTeamDocumentId: resolveTeamLookupKey(team),
      seasonKey: option.seasonKey,
    })
      .then(history => {
        const previousSeason = history?.previousSeason || null
        setPreviousRoster({
          loading: false,
          seasonKey: previousSeason?.seasonKey || '',
          players: Array.isArray(previousSeason?.teamPlayers)
            ? previousSeason.teamPlayers
            : [],
        })
      })
      .catch(error => {
        console.error('[playersDatabase/previous-roster-preview]', error)
        setPreviousRoster({ loading: false, seasonKey: '', players: [] })
      })
  }, [debugState, seasonOptions, team])

  const openModal = React.useCallback(() => {
    const defaultOption = seasonOptions.find(option => (
      option.optionKey === pageSelectedSeasonOption?.optionKey
    )) || null

    if (defaultOption) selectSeasonOption(defaultOption.optionKey)
    setOpen(true)
  }, [pageSelectedSeasonOption?.optionKey, seasonOptions, selectSeasonOption])

  const parse = React.useCallback(async () => {
    const parsedRows = parsePlayerRosterRows(pasteValue)
    logRosterImportDebug('identity-check-started', {
      state: debugState,
      systemAction: {
        type: 'read-roster-and-player-identities',
        parsedPlayers: parsedRows.length,
        writes: false,
      },
    })

    if (!parsedRows.length || !selectedSeasonOption) {
      setRows(parsedRows)
      return parsedRows
    }

    setBusy(true)

    try {
      const season = buildSeason()
      const rosterHistory = await readTeamSeasonRosterHistory({
        birthTeamDocumentId: resolveTeamLookupKey(team),
        seasonKey: season.seasonKey,
      })
      // Only a canonical roster membership confirms a player is already in
      // this Team Season. Pending is a separate Movement-owned state and
      // must never be silently treated as roster membership.
      const currentRosterPlayers = Array.isArray(rosterHistory.currentSeason?.teamPlayers)
        ? rosterHistory.currentSeason.teamPlayers
        : []
      const previousPlayers = Array.isArray(rosterHistory.previousSeason?.teamPlayers)
        ? rosterHistory.previousSeason.teamPlayers
        : []
      const hasPreviousRoster = previousPlayers.length > 0
      const localResolution = resolveRosterPlayersLocally({
        players: parsedRows,
        currentPlayers: currentRosterPlayers,
        previousPlayers,
      })
      const unresolvedPlayers = localResolution.unresolved.map(entry => entry.player)
      const broadPreviewRows = unresolvedPlayers.length
        ? await resolveTeamPlayerIdentityPreview({
          players: unresolvedPlayers,
          season,
        })
        : []
      const localPreviewRows = localResolution.resolved.map(entry => ({
        ...entry,
        player: {
          ...entry.player,
          identityStatus: 'זוהה שחקן קיים',
          identityMessage: entry.player.rosterImportResolution === 'confirmedInRoster'
            ? 'כבר נמצא בסגל הקנוני הנוכחי'
            : 'לפי סגל הקבוצה',
          identityValid: true,
        },
      }))
      const previewRows = mergeLocalAndResolvedPlayers({
        totalCount: parsedRows.length,
        localResolved: localPreviewRows,
        broadResolved: broadPreviewRows,
        unresolved: localResolution.unresolved,
      })

      const previewRowsWithRosterMembership = previewRows.map(previewRow => {
        const rosterPreviousMatch = hasPreviousRoster
          ? previousPlayers.some(previousPlayer => playerMatches(previousPlayer, previewRow))
          : null
        return {
          ...previewRow,
          rosterPreviousMatch,
        }
      })

      setRows(previewRowsWithRosterMembership)
      const matchedPreviousPlayers = previousPlayers.filter(previousPlayer => (
        previewRowsWithRosterMembership.some(previewRow => playerMatches(previousPlayer, previewRow))
      ))
      setMissingRosterPlayers(previousPlayers
        .filter(player => clean(player?.rosterStatus || 'regular') === 'regular')
        .filter(previousPlayer => !matchedPreviousPlayers.some(player => playerMatches(previousPlayer, player)))
        .map(player => ({ ...player, statsMovementTeam: null })))
      setTeamRootOptions(await listExistingTeamRootOptions({
        seasonKey: season.seasonKey,
        ageGroupId: team.ageGroupId,
        birthYear: team.birthYear,
        excludedBirthTeamDocumentId: resolveTeamLookupKey(team),
      }))
      logRosterImportDebug('identity-check-completed', {
        state: debugState,
        result: { rows: previewRowsWithRosterMembership.length, missingFromPreviousRoster: previousPlayers.length - matchedPreviousPlayers.length },
        systemAction: { type: 'stored-in-wizard-state', writes: false },
      })
      return previewRowsWithRosterMembership
    } catch (error) {
      logRosterImportDebug('identity-check-failed', { state: debugState, error: error?.message || String(error) })
      console.error('[playersDatabase/identity-preview]', error)
      const failedRows = parsedRows.map(row => ({
        ...row,
        identityStatus: 'נדרשת בדיקה',
        identityMessage: 'בדיקת הזהות נכשלה',
        identityValid: false,
      }))
      setRows(failedRows)
      setMissingRosterPlayers([])
      return failedRows
    } finally {
      setBusy(false)
    }
  }, [
    buildSeason,
    debugState,
    pasteValue,
    selectedSeasonOption,
    team,
  ])

  const changeCell = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => (
      index === rowIndex
        ? {
          ...row,
          [column.key]: value,
          identityStatus: 'יש לעדכן תצוגה',
          identityMessage: 'לחץ שוב על הצג נתונים',
          identityValid: false,
          identityResolution: '',
          identityConflictType: '',
          identityExistingExternalPlayerId: '',
          identityIncomingExternalPlayerId: '',
          identityCandidates: [],
        }
        : row
    )))
  }, [])

  const {
    identityReview,
    openIdentityReview,
    closeIdentityReview,
    resolveIdentityReview,
  } = useRosterIdentityReview({
    rows,
    setRows,
  })

  const getRowStatus = React.useCallback(row => {
    if (row?.identityValid === false) {
      return { valid: false, message: row.identityMessage || 'נדרשת בדיקת זהות' }
    }
    const rosterResolution = clean(row?.rosterImportResolution)
    const isInternalRosterResolution = [
      'confirmedInRoster',
      'priorAgeException',
    ].includes(rosterResolution)
    if (
      row?.rosterPreviousMatch === false &&
      !isInternalRosterResolution &&
      !clean(row?.statsMovementTeam?.birthTeamDocumentId)
    ) {
      return { valid: false, message: 'לא הופיע בסגל הקודם — בחר קבוצת מקור כדי לאשר הצטרפות' }
    }
    return { valid: true, message: '' }
  }, [])

  const hasIdentityErrors = rows.some(row => getRowStatus(row).valid === false)

  const {
    hasMissingRosterApprovals,
    setIncomingRosterPlayerSource,
    setIncomingRosterPlayerResolution,
    setMissingRosterPlayerTarget,
    setMissingRosterPlayerResolution,
  } = useRosterMovementReview({
    setRows,
    missingRosterPlayers,
    setMissingRosterPlayers,
  })

  React.useEffect(() => {
    setRosterImportPlan(null)
  }, [rows, missingRosterPlayers])

  const closeWriteReport = React.useCallback(() => {
    setWriteReport(null)
  }, [])

  const clearPaste = React.useCallback(() => {
    if (busy) return

    setPasteValue('')
    setRows([])
    setRosterImportPlan(null)
    setSyncState({
      activeStage: '',
      completedStages: [],
      error: null,
      results: {},
    })
  }, [busy])


  const close = React.useCallback(() => {
    if (busy) return
    setOpen(false)
  }, [busy])

  const preparePlan = React.useCallback(async () => {
    if (!selectedSeasonOption || hasIdentityErrors || !hasMissingRosterApprovals) return null

    logRosterImportDebug('plan-preparation-started', {
      state: debugState,
      systemAction: { type: 'prepare-approved-roster-plan', writes: false },
    })
    setBusy(true)

    try {
      const rosterMetadata = resolveRosterImportMetadata({ rows })
      const rawPlan = await prepareRosterImportPlan({
        target: selectedSeasonOption.target,
        league: {
          ...(actionLeagueDoc || {}),
          id: actionLeagueId,
          leagueId: actionLeagueId,
        },
        season: buildSeason(),
        team,
        rosterImport: {
          mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
          sourceSnapshotKey: rosterMetadata.sourceSnapshotKey || '',
          sourceSnapshotKeyExplicit: Boolean(rosterMetadata.sourceSnapshotKey),
          effectiveAt: rosterMetadata.effectiveAt || null,
        },
        players: rows,
        missingPlayers: missingRosterPlayers
          .filter(player => clean(player?.playerId))
          .filter(player => (
            clean(player?.missingResolution) === 'olderAgeException' ||
            clean(player?.statsMovementTeam?.birthTeamDocumentId)
          )),
      })

      const plan = buildCleanApprovedRosterState(rawPlan)
      setRosterImportPlan(plan)
      logRosterImportDebug('plan-preparation-completed', {
        state: debugState,
        result: { preview: plan?.preview || null },
        systemAction: { type: 'stored-approved-plan-in-state', writes: false },
      })
      return plan
    } catch (error) {
      logRosterImportDebug('plan-preparation-failed', { state: debugState, error: error?.message || String(error) })
      console.error('[playersDatabase/roster-plan]', error)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'בדיקת הסגל נכשלה',
        message: error?.message || 'לא ניתן להכין את הסגל לטעינה',
      })
      return null
    } finally {
      setBusy(false)
    }
  }, [
    actionLeagueDoc,
    actionLeagueId,
    buildSeason,
    debugState,
    hasIdentityErrors,
    hasMissingRosterApprovals,
    missingRosterPlayers,
    notify,
    rows,
    selectedSeasonOption,
    team,
  ])

  const enterSync = React.useCallback(() => {
    if (!selectedSeasonOption || !rosterImportPlan) return null

    syncCacheRefreshRef.current = false
    setSyncState({
      activeStage: '',
      completedStages: [],
      error: null,
      results: {},
    })

    return { readyForSync: true }
  }, [rosterImportPlan, selectedSeasonOption])

  const syncComplete = ROSTER_SYNC_STAGE_IDS.every(stageId => (
    syncState.completedStages.includes(stageId)
  ))

  React.useEffect(() => {
    if (!syncComplete || syncCacheRefreshRef.current || typeof reload !== 'function') return

    syncCacheRefreshRef.current = true
    // Close first. Reloading while this wizard is open remounts it at the
    // initial step and makes a completed sync look like a new import.
    setOpen(false)
    const reloadTimer = window.setTimeout(reload, 0)
    return () => window.clearTimeout(reloadTimer)
  }, [reload, syncComplete])

  const runSyncStage = React.useCallback(async stageId => {
    if (!rosterImportPlan || busy) return null

    const stageRunners = {
      canonical: () => writeRosterV2({
        team,
        persistedSeason: rosterImportPlan.persistedSeason,
      }),
      counterparts: () => syncRosterCounterpartsV2({
        approvedCounterpartStates: rosterImportPlan.approvedCounterpartStates,
      }),
      playerIndexes: () => syncRosterPlayerIndexesV2({
        approvedPlayerIndexState: rosterImportPlan.approvedPlayerIndexState,
      }),
      teamProjection: () => syncRosterTeamProjectionV2({
        approvedTeamProjectionState: rosterImportPlan.approvedTeamProjectionState,
      }),
      leaguesMaster: () => syncRosterLeaguesMasterV2({
        approvedLeaguesMasterState: rosterImportPlan.approvedLeaguesMasterState,
      }),
      clubs: () => syncRosterClubsV2({
        approvedClubProjectionState: rosterImportPlan.approvedClubProjectionState,
      }),
      clubsMaster: () => syncRosterClubsMasterV2({
        approvedClubsMasterState: rosterImportPlan.approvedClubsMasterState,
      }),
    }
    const runner = stageRunners[stageId]
    if (!runner) return null

    setBusy(true)
    setSyncState(current => ({
      ...current,
      activeStage: stageId,
      error: null,
    }))

    try {
      const result = await runner()
      setSyncState(current => ({
        ...current,
        activeStage: '',
        completedStages: current.completedStages.includes(stageId)
          ? current.completedStages
          : [...current.completedStages, stageId],
        error: null,
        results: {
          ...current.results,
          [stageId]: result || {},
        },
      }))
      return result
    } catch (error) {
      console.error('[playersDatabase/roster-v2-sync]', stageId, error)
      setSyncState(current => ({
        ...current,
        activeStage: '',
        error: {
          stageId,
          message: error?.message || 'הסנכרון נכשל',
        },
      }))
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'שלב הסנכרון נכשל',
        message: error?.message || 'ניתן לנסות שוב את אותו שלב',
      })
      return null
    } finally {
      setBusy(false)
    }
  }, [busy, notify, rosterImportPlan, team])

  const completeSync = React.useCallback(() => {
    if (syncCacheRefreshRef.current || typeof reload !== 'function') return

    syncCacheRefreshRef.current = true
    reload()
  }, [reload])

  return {
    open,
    seasonOptions,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    pasteValue,
    rows,
    previousRoster,
    missingRosterPlayers,
    teamRootOptions,
    rosterImportPlan,
    busy,
    writeReport,
    syncState,
    debugState,
    hasIdentityErrors,
    hasMissingRosterApprovals,
    openModal,
    selectSeasonOption,
    setPasteValue,
    clearPaste,
    parse,
    changeCell,
    identityReview,
    openIdentityReview,
    closeIdentityReview,
    resolveIdentityReview,
    getRowStatus,
    setIncomingRosterPlayerSource,
    setIncomingRosterPlayerResolution,
    setMissingRosterPlayerTarget,
    setMissingRosterPlayerResolution,
    close,
    closeWriteReport,
    preparePlan,
    enterSync,
    runSyncStage,
    completeSync,
  }
}