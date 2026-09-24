// features/playersDatabase/ui/pages/teamPage/roster/import/hooks/useTeamRosterImport.js

import * as React from 'react'
import { collection, doc, onSnapshot, query, serverTimestamp, where, writeBatch } from 'firebase/firestore'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  prepareRosterImportPlan,
  runPlayersDatabaseWriteAction,
} from '../../../../../../services/write/index.js'
import { invalidatePlayersDatabaseWriteCache } from '../../../../../../services/cache/index.js'
import { resolveTeamPlayerIdentityPreview } from '../../../../../../services/write/players/index.js'
import {
  listExistingTeamRootOptions,
  readTeamSeasonRosterHistory,
} from '../../../../../../services/read/index.js'
import {
  ROSTER_IMPORT_MODE,
  mergeLocalAndResolvedPlayers,
  resolveRosterPlayersLocally,
} from '../../../../../../domain/movement/index.js'
import { resolveTeamLookupKey } from '../../../../../../model/team/teamIdentity.model.js'
import { db } from '../../../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../../../constants/pdb.constants.js'
import { SNACK_STATUS } from '../../../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  parsePlayerRosterRows,
  resolveRosterImportMetadata,
} from '../logic/teamRosterImport.logic.js'
import { buildWriteReportFromError } from '../../../logic/writeFlowReport.logic.js'
import useRosterIdentityReview from './useRosterIdentityReview.js'
import useRosterMovementReview from './useRosterMovementReview.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const ACTIVE_PROJECTION_JOB_STATUSES = new Set(['preparing', 'waiting_for_client', 'queued', 'processing'])
const ROSTER_IMPORT_DEBUG_PREFIX = '[playersDatabase/roster-import-debug]'
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
  const [projectionJobId, setProjectionJobId] = React.useState('')
  const [projectionJob, setProjectionJob] = React.useState(null)
  const [retryingProjectionJob, setRetryingProjectionJob] = React.useState(false)
  const [rosterImportPlan, setRosterImportPlan] = React.useState(null)
  const [activeProjectionJobs, setActiveProjectionJobs] = React.useState([])
  const completedProjectionJobRef = React.useRef('')

  const selectedSeasonOption = React.useMemo(() => (
    seasonOptions.find(option => option.optionKey === selectedSeasonOptionKey) || null
  ), [seasonOptions, selectedSeasonOptionKey])

  React.useEffect(() => {
    if (!projectionJobId) return undefined
    return onSnapshot(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRosterProjectionJobs, projectionJobId),
      snapshot => setProjectionJob(snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null),
      () => setProjectionJob(null)
    )
  }, [projectionJobId])
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
      revision: clean(rosterImportPlan?.rosterProjectionRevision),
      playersCount: rosterImportPlan?.preview?.playersCount || 0,
      movement: rosterImportPlan?.movementState || null,
    } : null,
    runtime: {
      busy,
      projectionJobId: clean(projectionJobId),
      projectionJobStatus: clean(projectionJob?.status),
      activeProjectionJobs: activeProjectionJobs.map(job => ({
        id: clean(job?.id), type: clean(job?.jobType), status: clean(job?.status),
      })),
    },
  }), [
    activeProjectionJobs,
    busy,
    missingRosterPlayers,
    open,
    pasteValue.length,
    projectionJob?.status,
    projectionJobId,
    rosterImportPlan,
    rows,
    selectedSeasonOption?.seasonKey,
    selectedSeasonOption?.target,
    selectedSeasonOptionKey,
  ])

  React.useEffect(() => {
    logRosterImportDebug('state-updated', { state: debugState })
  }, [debugState])

  React.useEffect(() => {
    const teamId = resolveTeamLookupKey(team)
    const seasonKey = clean(selectedSeasonOption?.seasonKey)
    const leagueKey = clean(actionLeagueId)
    if (!teamId || !seasonKey || !leagueKey) {
      setActiveProjectionJobs([])
      return undefined
    }

    const snapshotsByScope = new Map()
    const updateScope = (scope, snapshot) => {
      const activeJobs = snapshot.docs
        .map(item => ({ id: item.id, ...item.data() }))
        .filter(job => clean(job.seasonKey) === seasonKey)
        .filter(job => ACTIVE_PROJECTION_JOB_STATUSES.has(clean(job.status)))
      snapshotsByScope.set(scope, activeJobs)
      setActiveProjectionJobs([...snapshotsByScope.values()].flat())
    }
    const clearScope = scope => {
      snapshotsByScope.set(scope, [])
      setActiveProjectionJobs([...snapshotsByScope.values()].flat())
    }

    const unsubscribers = [
      onSnapshot(
        query(collection(db, PLAYERS_DATABASE_COLLECTIONS.teamRosterProjectionJobs), where('teamId', '==', teamId)),
        snapshot => updateScope('roster', snapshot),
        () => clearScope('roster')
      ),
      onSnapshot(
        query(collection(db, PLAYERS_DATABASE_COLLECTIONS.teamStatsProjectionJobs), where('teamId', '==', teamId)),
        snapshot => updateScope('stats', snapshot),
        () => clearScope('stats')
      ),
      onSnapshot(
        query(collection(db, PLAYERS_DATABASE_COLLECTIONS.leagueProjectionJobs), where('leagueId', '==', leagueKey)),
        snapshot => updateScope('league', snapshot),
        () => clearScope('league')
      ),
    ]

    return () => unsubscribers.forEach(unsubscribe => unsubscribe())
  }, [actionLeagueId, selectedSeasonOption?.seasonKey, team])

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
    setPasteValue('')
    setRows([])
    setMissingRosterPlayers([])
    setTeamRootOptions([])
    setPreviousRoster({ loading: false, seasonKey: '', players: [] })
    setProjectionJobId('')
    setProjectionJob(null)
    setOpen(true)
    const pageOptionKey = clean(pageSelectedSeasonOption?.optionKey)
    const pageSeasonIsAvailable = seasonOptions.some(option => (
      clean(option?.optionKey) === pageOptionKey
    ))
    if (pageSeasonIsAvailable) {
      selectSeasonOption(pageOptionKey)
      return
    }
    setSelectedSeasonOptionKey('')
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
      const currentKnownPlayers = [
        ...(Array.isArray(rosterHistory.currentSeason?.teamPlayers)
          ? rosterHistory.currentSeason.teamPlayers
          : []),
        ...(Array.isArray(rosterHistory.currentSeason?.pendingPlayers)
          ? rosterHistory.currentSeason.pendingPlayers
          : []),
      ]
      const previousPlayers = Array.isArray(rosterHistory.previousSeason?.teamPlayers)
        ? rosterHistory.previousSeason.teamPlayers
        : []
      const hasPreviousRoster = previousPlayers.length > 0
      const localResolution = resolveRosterPlayersLocally({
        players: parsedRows,
        currentPlayers: currentKnownPlayers,
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
          identityMessage: 'לפי סגל הקבוצה',
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
    setProjectionJobId('')
    setProjectionJob(null)
    setRosterImportPlan(null)
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
      const plan = await prepareRosterImportPlan({
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

      setRosterImportPlan(plan)
      logRosterImportDebug('plan-preparation-completed', {
        state: debugState,
        result: { revision: clean(plan?.rosterProjectionRevision), preview: plan?.preview || null },
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

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption || !rosterImportPlan) return null

    logRosterImportDebug('canonical-write-started', {
      state: debugState,
      systemAction: {
        type: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS,
        planRevision: clean(rosterImportPlan?.rosterProjectionRevision),
        writes: true,
      },
    })
    setBusy(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS,
        payload: {
          target: selectedSeasonOption.target,
          league: {
            ...(actionLeagueDoc || {}),
            id: actionLeagueId,
            leagueId: actionLeagueId,
          },
          season: buildSeason(),
          team,
          rosterImportPlan,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'נתוני הסגל נשמרו',
        message: 'בדיקת סנכרון של הסגל וההעברות ממשיכה ברקע',
      })
      setProjectionJobId(String(result?.projectionJob?.id || ''))
      logRosterImportDebug('canonical-write-completed', {
        state: debugState,
        result: { projectionJobId: clean(result?.projectionJob?.id), status: clean(result?.status) },
        systemAction: { type: 'activate-projection-job-and-refresh-cache' },
      })
      reload()
      return result
    } catch (error) {
      console.error('[playersDatabase/write-flow]', error?.writeReport || error)

      if (error?.code === 'ROSTER_IMPORT_PLAN_STALE') {
        logRosterImportDebug('canonical-write-stale-plan', {
          state: debugState,
          error: error?.message || String(error),
          staleSources: error?.staleSources || [],
          staleSourceList: Array.isArray(error?.staleSources) ? error.staleSources.join(', ') : '',
          systemAction: { type: 'keep-input-and-decisions-then-rebuild-preview', writes: false },
        })
        setRosterImportPlan(null)
        notify({
          status: SNACK_STATUS.ERROR,
          title: 'נתוני הקבוצה השתנו',
          message: 'יש להציג מחדש את הסיכום לפני טעינת הסגל',
        })
        return { stale: true }
      }

      logRosterImportDebug('canonical-write-failed', {
        state: debugState,
        error: error?.message || String(error),
        systemAction: { type: 'keep-wizard-state-for-retry', writes: false },
      })
      setWriteReport(buildWriteReportFromError({
        error,
        flow: 'pasteTeamPlayers',
      }))

      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת סגל נכשלה',
        message: 'נפתח דוח כתיבה מפורט לבדיקה',
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
    notify,
    reload,
    rosterImportPlan,
    selectedSeasonOption,
    team,
  ])

  const retryProjectionJob = React.useCallback(async () => {
    if (!projectionJobId || projectionJob?.status !== 'failed') return
    setRetryingProjectionJob(true)
    try {
      const batch = writeBatch(db)
      batch.update(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRosterProjectionJobs, projectionJobId), {
        status: 'queued', attemptToken: null, leaseExpiresAt: null, error: null, failedAt: null,
        retryRequestedAt: serverTimestamp(), updatedAt: serverTimestamp(),
      })
      if (projectionJob?.writeActionId) {
        batch.update(doc(db, PLAYERS_DATABASE_COLLECTIONS.writeActions, projectionJob.writeActionId), {
          status: 'in_progress', recoveryRequired: false, projectionAttemptToken: null,
          retryRequestedAt: serverTimestamp(), updatedAt: serverTimestamp(),
        })
      }
      await batch.commit()
    } finally {
      setRetryingProjectionJob(false)
    }
  }, [projectionJob?.status, projectionJob?.writeActionId, projectionJobId])

  React.useEffect(() => {
    const status = projectionJob?.status || ''
    const completionKey = `${projectionJobId}:${status}`
    if (!['completed', 'failed', 'superseded', 'partial_superseded'].includes(status) ||
        completedProjectionJobRef.current === completionKey) return

    completedProjectionJobRef.current = completionKey
    invalidatePlayersDatabaseWriteCache({
      actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS,
      payload: {
        league: { id: actionLeagueId },
        season: buildSeason(),
        team,
      },
    })
    reload()
  }, [actionLeagueId, buildSeason, projectionJob?.status, projectionJobId, reload, team])

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
    projectionJobId,
    projectionJob,
    retryingProjectionJob,
    activeProjectionJobs,
    debugState,
    isProjectionSyncPending: activeProjectionJobs.length > 0,
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
    confirm,
    retryProjectionJob,
  }
}
