// src/features/playersDatabase/ui/pages/teamPage/roster/import/hooks/useTeamRosterImport.js

import * as React from 'react'
import { loadRoster, prepareRosterLoad } from '../../../../../../services/write/roster/index.js'
import { getWriteActionReceipt } from '../../../../../../services/write/receipt/index.js'
import { repairWriteActionReceipt } from '../../../../../../services/write/recovery/index.js'
import {
  loadRosterForAuditRepair,
  prepareRosterForAuditRepair,
} from '../../../../../../services/audit/repair/reloadRoster.js'
import { resolveCanonicalTeamPlayerIdentityPreview } from '../../../../../../services/read/identity/canonicalPlayerIdentityPreview.read.js'
import {
  buildMovementTeamOptions,
  listExistingTeamRootOptions,
  readTeamSeasonRosterHistory,
} from '../../../../../../services/read/index.js'
import {
  ROSTER_IMPORT_MODE,
  buildRosterSnapshotContentHash,
  mergeLocalAndResolvedPlayers,
  resolveRosterPlayersLocally,
} from '../../../../../../domain/movement/index.js'
import { resolveTeamLookupKey } from '../../../../../../model/team/teamIdentity.model.js'
import { SNACK_STATUS } from '../../../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  parsePlayerRosterRows,
  resolveRosterImportMetadata,
} from '../logic/teamRosterImport.logic.js'
import {
  applyRosterSyncProgressEvent,
  buildRosterSyncStages,
  resolveRosterRetryMode,
  ROSTER_SYNC_STAGES,
} from '../logic/rosterSyncProgress.model.js'
import useRosterIdentityReview from './useRosterIdentityReview.js'
import useRosterMovementReview from './useRosterMovementReview.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const playerMatchKeys = player => [
  clean(player?.playerId),
  clean(player?.externalPlayerId),
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
  teamSeasons = [],
  clubsDirectory = null,
  repairReload = false,
  notify,
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
  const [rosterImportPlan, setRosterImportPlan] = React.useState(null)
  const [planError, setPlanError] = React.useState('')
  const [receiptId, setReceiptId] = React.useState('')
  const [auditResult, setAuditResult] = React.useState(null)
  const [executionReceipt, setExecutionReceipt] = React.useState(null)
  const [executionStatus, setExecutionStatus] = React.useState('idle')
  const [executionError, setExecutionError] = React.useState('')
  const [repairProgress, setRepairProgress] = React.useState(null)

  const resetExecution = React.useCallback(() => {
    setReceiptId('')
    setAuditResult(null)
    setExecutionReceipt(null)
    setExecutionStatus('idle')
    setExecutionError('')
    setRepairProgress(null)
  }, [])

  const selectedSeasonOption = React.useMemo(() => (
    seasonOptions.find(option => option.optionKey === selectedSeasonOptionKey) || null
  ), [seasonOptions, selectedSeasonOptionKey])

  const actionLeagueId = selectedSeasonOption?.leagueId || leagueId
  const actionLeagueDoc = React.useMemo(() => (
    leagueDocuments.find(document => (
      String(document?.id || document?.leagueId || '').trim() === String(actionLeagueId || '').trim()
    )) || leagueDoc
  ), [actionLeagueId, leagueDoc, leagueDocuments])

  const buildSeason = React.useCallback(() => ({
    ...(selectedSeasonOption?.season || {}),
    leagueId: actionLeagueId,
    ageGroupId: selectedSeasonOption?.ageGroupId || team.ageGroupId,
    birthYear: selectedSeasonOption?.birthYear || team.birthYear,
    seasonId: selectedSeasonOption?.seasonId,
    seasonKey: selectedSeasonOption?.seasonKey,
  }), [actionLeagueId, selectedSeasonOption, team.ageGroupId, team.birthYear])

  const selectSeasonOption = React.useCallback(optionKey => {
    setSelectedSeasonOptionKey(optionKey)
    setRows([])
    setMissingRosterPlayers([])
    setTeamRootOptions([])
    setPasteValue('')
    setRosterImportPlan(null)
    resetExecution()
    const option = seasonOptions.find(item => item.optionKey === optionKey)

    if (!option) {
      setPreviousRoster({ loading: false, seasonKey: '', players: [] })
      return
    }

    setPreviousRoster({ loading: true, seasonKey: '', players: [] })

    readTeamSeasonRosterHistory({
      birthTeamDocumentId: resolveTeamLookupKey(team),
      seasonId: option.seasonId,
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
  }, [resetExecution, seasonOptions, team])

  const openModal = React.useCallback(() => {
    const defaultOption = seasonOptions.find(option => (
      option.optionKey === pageSelectedSeasonOption?.optionKey
    )) || null

    if (defaultOption) selectSeasonOption(defaultOption.optionKey)
    setOpen(true)
  }, [pageSelectedSeasonOption?.optionKey, seasonOptions, selectSeasonOption])

  const parse = React.useCallback(async () => {
    const parsedRows = parsePlayerRosterRows(pasteValue)

    if (!parsedRows.length || !selectedSeasonOption) {
      setRows(parsedRows)
      return parsedRows
    }

    setBusy(true)

    try {
      const season = buildSeason()
      const rosterHistory = await readTeamSeasonRosterHistory({
        birthTeamDocumentId: resolveTeamLookupKey(team),
        seasonId: season.seasonId,
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
        ? await resolveCanonicalTeamPlayerIdentityPreview({
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
      const existingTeamOptions = await listExistingTeamRootOptions({
        seasonId: season.seasonId,
        ageGroupId: season.ageGroupId,
        birthYear: season.birthYear,
        excludedBirthTeamDocumentId: resolveTeamLookupKey(team),
      })
      setTeamRootOptions(buildMovementTeamOptions({
        clubsDirectory,
        existingOptions: existingTeamOptions,
        birthYear: season.birthYear,
        excludedBirthTeamDocumentId: resolveTeamLookupKey(team),
      }))
      return previewRowsWithRosterMembership
    } catch (error) {
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
    pasteValue,
    selectedSeasonOption,
    clubsDirectory,
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
    setPlanError('')
    resetExecution()
  }, [missingRosterPlayers, resetExecution, rows])

  const clearPaste = React.useCallback(() => {
    if (busy) return

    setPasteValue('')
    setRows([])
    setRosterImportPlan(null)
    resetExecution()
  }, [busy, resetExecution])


  const close = React.useCallback(() => {
    if (busy) return
    setOpen(false)
  }, [busy])

  const buildActionInput = React.useCallback(() => {
    const season = buildSeason()
    const teamSlot = Number(team.teamSlot || team.birthTeamSlot)
    if (!Number.isInteger(teamSlot) || teamSlot < 1) throw new Error('Missing canonical teamSlot')
    const rosterMetadata = resolveRosterImportMetadata({ rows })
    const teamId = resolveTeamLookupKey(team)
    const basePlayers = rows.map(row => ({
      ...row,
      rosterStatus: clean(row.rosterStatus) === 'youngerAgeGroup' ? 'youngerAgeGroup' : 'regular',
    }))
    const retainedHistoricalPlayers = missingRosterPlayers
      .filter(player => clean(player?.missingResolution) === 'olderAgeException')
      .map(player => ({ ...player, rosterStatus: 'left' }))
    const players = [...basePlayers, ...retainedHistoricalPlayers]
    const contentHash = buildRosterSnapshotContentHash({
      seasonKey: season.seasonKey,
      birthTeamDocumentId: teamId,
      players,
    })
    const sourceSnapshotKey = clean(rosterMetadata.sourceSnapshotKey) || contentHash
    const participantDecisions = [
      ...rows
        .filter(row => ['joined', 'left', 'youngerAgeGroup'].includes(clean(row.statsMovementDecision)))
        .map(row => ({
          ...row,
          decision: clean(row.statsMovementDecision),
          team: row.statsMovementTeam || null,
        })),
      ...missingRosterPlayers
        .filter(player => clean(player?.missingResolution) === 'left')
        .map(player => ({ ...player, decision: 'left', team: player.statsMovementTeam || null })),
      ...missingRosterPlayers
        .filter(player => clean(player?.missingResolution) === 'unknown')
        .map(player => ({ ...player, decision: 'unknown' })),
    ]

    return {
      leagueId: actionLeagueId,
      team: {
        ...team,
        clubId: clean(team.clubId),
        ageGroupId: season.ageGroupId,
        birthYear: Number(season.birthYear),
        teamSlot,
      },
      season,
      players,
      participantDecisions,
      rosterImport: {
        mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
        sourceSnapshotKey,
        contentHash,
        effectiveAt: rosterMetadata.effectiveAt || null,
      },
      updatedAt: new Date().toISOString(),
    }
  }, [actionLeagueId, buildSeason, missingRosterPlayers, rows, team])

  const preparePlan = React.useCallback(async () => {
    if (!selectedSeasonOption || hasIdentityErrors || !hasMissingRosterApprovals) return null
    setPlanError('')
    setBusy(true)
    try {
      const prepare = repairReload ? prepareRosterForAuditRepair : prepareRosterLoad
      const plan = await prepare({ input: buildActionInput() })
      setRosterImportPlan(plan)
      return plan
    } catch (error) {
      console.error('[playersDatabase/roster-plan]', error)
      setPlanError(error?.message || 'לא ניתן להכין את הסגל לטעינה')
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'בדיקת הסגל נכשלה',
        message: error?.message || 'לא ניתן להכין את הסגל לטעינה',
      })
      return null
    } finally {
      setBusy(false)
    }
  }, [buildActionInput, hasIdentityErrors, hasMissingRosterApprovals, notify, repairReload, selectedSeasonOption])

  const enterSync = React.useCallback(() => {
    if (!selectedSeasonOption || !rosterImportPlan) return null
    resetExecution()
    setExecutionStatus('ready')

    return { readyForSync: true }
  }, [resetExecution, rosterImportPlan, selectedSeasonOption])

  const executeApprovedImport = React.useCallback(async () => {
    if (!rosterImportPlan || busy) return null
    if (repairReload) {
      setBusy(true)
      setExecutionStatus('running')
      setExecutionError('')
      setRepairProgress(null)
      try {
        const result = await loadRosterForAuditRepair({
          input: buildActionInput(),
          confirmed: true,
          onProgress: event => setRepairProgress(current => applyRosterSyncProgressEvent({
            receipt: current,
            event,
          })),
        })
        setRosterImportPlan(result.approvedState)
        setAuditResult(result.audit)
        setExecutionStatus(result.executionStatus)
        if (result.executionStatus !== 'succeeded') {
          setExecutionError(`הסגל נשמר, אך הבדיקה מצאה ${result.audit.findings.length} פערים. יש לחזור לאודיט ולתקן את הממצאים.`)
        }
        return result
      } catch (error) {
        setAuditResult(error.auditResult || null)
        setExecutionStatus('failed')
        setExecutionError(error.message || 'טעינת מקור הסגל נכשלה')
        return null
      } finally {
        setBusy(false)
      }
    }
    if (receiptId && !executionReceipt) {
      setExecutionStatus('failed')
      setExecutionError('לא ניתן לקבוע את מצב הקבלה. יש לפתוח אותה בעמוד ניהול הדאטה.')
      return null
    }
    setBusy(true)
    setExecutionStatus('running')
    setExecutionError('')
    try {
      const retryMode = resolveRosterRetryMode(executionReceipt)
      if (retryMode === 'repair') {
        setExecutionReceipt(current => applyRosterSyncProgressEvent({
          receipt: current,
          event: { type: 'repairStarted', receiptId },
        }))
      }
      const executionPlan = retryMode === 'retry' && receiptId
        ? await prepareRosterLoad({ input: buildActionInput() })
        : rosterImportPlan
      if (executionPlan !== rosterImportPlan) setRosterImportPlan(executionPlan)
      const result = retryMode === 'repair'
        ? await repairWriteActionReceipt({ receiptId })
        : await loadRoster({
            approvedState: executionPlan,
            receiptId,
            display: {
              teamName: clean(team?.name || team?.displayName),
              leagueName: clean(actionLeagueDoc?.names?.display || actionLeagueDoc?.name),
            },
            onProgress: event => {
              setReceiptId(clean(event && event.receiptId))
              setExecutionReceipt(current => applyRosterSyncProgressEvent({
                receipt: current,
                event,
              }))
            },
          })
      const resolvedReceiptId = clean(result && result.receiptId)
      setReceiptId(resolvedReceiptId)
      setAuditResult(result.audit || null)
      try {
        setExecutionReceipt(await getWriteActionReceipt({ receiptId: resolvedReceiptId }))
      } catch {
        setExecutionReceipt(current => ({
          ...current,
          id: resolvedReceiptId,
          status: result && result.status,
          executionStatus: result && result.executionStatus,
          recoveryRequired: Boolean(result && result.recoveryRequired),
        }))
      }
      if (result && result.status === 'closed' && result.executionStatus === 'succeeded') {
        setExecutionStatus('succeeded')
        return result
      }
      setExecutionStatus('failed')
      setExecutionError('הכתיבה הסתיימה אך בדיקת הסנכרון לא נסגרה כנקייה.')
      return result
    } catch (error) {
      const failedReceiptId = clean(error && error.receiptId) || receiptId
      if (failedReceiptId) {
        setReceiptId(failedReceiptId)
        try {
          setExecutionReceipt(await getWriteActionReceipt({ receiptId: failedReceiptId }))
        } catch {
          setExecutionReceipt(null)
        }
      }
      console.error('[playersDatabase/roster-sync]', error)
      setExecutionStatus('failed')
      setExecutionError(error?.message || 'הסנכרון נכשל')
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'סנכרון הסגל נכשל',
        message: error?.message || 'ניתן להכין מחדש ולנסות שוב',
      })
      return null
    } finally {
      setBusy(false)
    }
  }, [
    actionLeagueDoc,
    buildActionInput,
    busy,
    executionReceipt,
    notify,
    receiptId,
    repairReload,
    rosterImportPlan,
    team,
  ])

  const syncStages = buildRosterSyncStages({
    receipt: repairReload ? repairProgress : executionReceipt,
    busy,
    stages: repairReload ? ROSTER_SYNC_STAGES.map(stage => stage.id === 'audit'
      ? { ...stage, title: 'בדיקת סנכרון', target: 'מקורות ותוצרים' }
      : stage) : ROSTER_SYNC_STAGES,
  })
  const expectedRosterHash = clean(
    rosterImportPlan?.canonical?.teamSeason?.roster?.rosterImport?.contentHash
  )
  const observedTeamSeason = teamSeasons.find(season => (
    clean(season?.identity?.teamSeasonDocumentId || season?.id) ===
    clean(rosterImportPlan?.teamSeasonDocumentId)
  ))
  const observedRosterHash = clean(
    observedTeamSeason?.roster?.rosterImport?.contentHash
  )
  const listenerConfirmed = Boolean(
    expectedRosterHash && observedRosterHash === expectedRosterHash
  )
  const syncComplete = executionStatus === 'succeeded' && listenerConfirmed && syncStages.every(stage => (
    stage.state === 'completed'
  ))

  const completeSync = React.useCallback(async () => {
    if (busy || executionStatus !== 'succeeded' || !syncComplete || !auditResult) return false
    if (auditResult.coverage?.complete !== true || (auditResult.findings?.length || 0) > 0) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'בדיקת הסנכרון מצאה פערים',
        message: repairReload ? 'יש לתקן את הממצאים לפני סיום התהליך.' : 'הקבלה נשארה פתוחה עד Audit נקי.',
      })
      return false
    }
    setOpen(false)
    return true
  }, [auditResult, busy, executionStatus, notify, repairReload, syncComplete])

  return {
    open,
    repairReload,
    seasonOptions,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    pasteValue,
    rows,
    previousRoster,
    missingRosterPlayers,
    teamRootOptions,
    rosterImportPlan,
    planError,
    receiptId,
    auditResult,
    listenerConfirmed,
    syncComplete,
    busy,
    syncStages,
    executionReceipt,
    executionStatus,
    executionError,
    retryMode: repairReload ? 'reload' : resolveRosterRetryMode(executionReceipt),
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
    preparePlan,
    enterSync,
    executeApprovedImport,
    completeSync,
  }
}

