// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueTableImport.js

import * as React from 'react'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { getWriteActionReceipt } from '../../../../services/write/receipt/index.js'
import { loadLeague } from '../../../../services/write/league/index.js'
import { repairWriteActionReceipt } from '../../../../services/write/recovery/index.js'
import {
  buildLeagueImportPreview,
  buildServiceLeague,
  buildServiceRows,
  buildServiceSeason,
  formatGoalDifference,
  resolveExistingLeagueTeamUrl,
  resolveLeagueImportGameDuration,
} from '../logic/leagueImport.logic.js'
import {
  applyLeagueSyncProgressEvent,
  buildLeagueSyncStages,
} from '../logic/leagueSyncProgress.model.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toImportNumber = value => {
  const nextValue = Number(clean(value).replace(/\u200E/g, ''))
  return Number.isFinite(nextValue) ? nextValue : null
}

const hasStartedSeasonData = rows => (
  (Array.isArray(rows) ? rows : []).some(row => (
    ['games', 'wins', 'draws', 'losses', 'goalsFor', 'goalsAgainst', 'points']
      .some(field => (toImportNumber(row && row[field]) || 0) > 0)
  ))
)

const isImportRowReady = row => {
  if (!clean(row && row.clubId)) return false
  if (!clean(row && row.teamSlot)) return false
  if (!Number.isFinite(toImportNumber(row && row.rank)) || toImportNumber(row && row.rank) <= 0) return false

  return [
    'games',
    'wins',
    'draws',
    'losses',
    'goalsFor',
    'goalsAgainst',
    'points',
  ].every(field => {
    const value = toImportNumber(row && row[field])
    return Number.isFinite(value) && value >= 0
  })
}

const toExistingRows = season => (
  Object.entries(
    season && season.table && season.table.teamsById && typeof season.table.teamsById === 'object'
      ? season.table.teamsById
      : {}
  ).map(([teamId, row]) => ({
    teamId,
    clubId: row && row.clubId,
    teamSlot: row && row.teamSlot,
  }))
)

const buildStructuralLeagueDiff = ({ existingRows = [], nextRows = [] } = {}) => {
  const identityKey = row => clean(row && (row.teamId || row.birthTeamId)) || [
    clean(row && row.clubId),
    clean(row && (row.teamSlot || row.birthTeamSlot)),
  ].join('__')
  const existingByKey = new Map((Array.isArray(existingRows) ? existingRows : [])
    .map(row => [identityKey(row), row])
    .filter(([key]) => key))
  const nextByKey = new Map((Array.isArray(nextRows) ? nextRows : [])
    .map(row => [identityKey(row), row])
    .filter(([key]) => key))
  const added = []
  const removed = []
  const changed = []

  nextByKey.forEach((row, key) => {
    const existing = existingByKey.get(key)
    if (!existing) {
      added.push(row)
      return
    }

    const clubChanged = clean(existing.clubId) !== clean(row.clubId)
    const slotChanged = clean(existing.teamSlot) !== clean(row.teamSlot)
    if (clubChanged || slotChanged) changed.push({ before: existing, after: row })
  })

  existingByKey.forEach((row, key) => {
    if (!nextByKey.has(key)) removed.push(row)
  })

  return {
    added,
    removed,
    changed,
    hasChanges: added.length > 0 || removed.length > 0 || changed.length > 0,
  }
}

const describeFailure = error => clean(error && (error.message || error.code)) || 'טעינת הליגה נכשלה'

export function useLeagueTableImport({
  league = {},
  leagueDoc = {},
  selectedSeasonOption = {},
  reload,
} = {}) {
  const { notify } = useSnackbar()
  const resolveGameDuration = React.useCallback(() => (
    resolveLeagueImportGameDuration({
      league,
      leagueDoc,
      selectedSeasonOption,
    })
  ), [league, leagueDoc, selectedSeasonOption])
  const [open, setOpen] = React.useState(false)
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [seasonStatus, setSeasonStatus] = React.useState('')
  const [gameDurationMinutes, setGameDurationMinutes] = React.useState(resolveGameDuration)
  const [approvedInput, setApprovedInput] = React.useState(null)
  const [receiptId, setReceiptId] = React.useState('')
  const [executionResult, setExecutionResult] = React.useState(null)
  const [executionReceipt, setExecutionReceipt] = React.useState(null)
  const [executionStatus, setExecutionStatus] = React.useState('idle')
  const [executionError, setExecutionError] = React.useState('')
  const [structuralAcknowledged, setStructuralAcknowledged] = React.useState(false)

  const hasStartedData = React.useMemo(() => hasStartedSeasonData(rows), [rows])
  const structuralChanges = React.useMemo(() => buildStructuralLeagueDiff({
    existingRows: toExistingRows(selectedSeasonOption && selectedSeasonOption.season),
    nextRows: rows,
  }), [rows, selectedSeasonOption])
  const gameDurationValid = Number.isFinite(Number(gameDurationMinutes)) && Number(gameDurationMinutes) > 0
  const canConfirm = React.useMemo(() => (
    Boolean(seasonStatus) &&
    gameDurationValid &&
    rows.length > 0 &&
    rows.every(row => row && row.valid !== false && isImportRowReady(row))
  ), [gameDurationValid, rows, seasonStatus])

  React.useEffect(() => {
    if (open) return
    setGameDurationMinutes(resolveGameDuration())
  }, [open, resolveGameDuration])

  React.useEffect(() => {
    if (seasonStatus === 'not_started' && hasStartedData) {
      setSeasonStatus('')
    }
  }, [hasStartedData, seasonStatus])

  const resetExecution = React.useCallback(() => {
    setApprovedInput(null)
    setReceiptId('')
    setExecutionResult(null)
    setExecutionReceipt(null)
    setExecutionStatus('idle')
    setExecutionError('')
  }, [])

  const handlePreview = React.useCallback(() => {
    setStructuralAcknowledged(false)
    setRows(buildLeagueImportPreview({
      text: pasteValue,
      league,
      leagueDoc,
      selectedSeasonOption,
    }).rows || [])
  }, [pasteValue, league, leagueDoc, selectedSeasonOption])

  const handlePasteValueChange = React.useCallback(value => {
    setPasteValue(value)
  }, [])

  const handleClear = React.useCallback(() => {
    if (busy) return
    setPasteValue('')
    setRows([])
    setSeasonStatus('')
    setGameDurationMinutes(resolveGameDuration())
    setStructuralAcknowledged(false)
    resetExecution()
  }, [busy, resetExecution, resolveGameDuration])

  const handleCellChange = React.useCallback(({ rowIndex, column, value }) => {
    setStructuralAcknowledged(false)
    setRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      const nextRow = {
        ...row,
        [column.key]: value,
      }

      if (column.key === 'clubId') {
        const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === value)
        nextRow.clubName = club ? club.name : ''
      }

      if (column.key === 'teamSlot') {
        nextRow.teamSlot = value
      }

      if (column.key === 'clubId' || column.key === 'teamSlot') {
        nextRow.displayTeamUrl = clean(nextRow.pastedTeamUrl) || resolveExistingLeagueTeamUrl({
          existingTeamsById: selectedSeasonOption && selectedSeasonOption.season && selectedSeasonOption.season.table
            ? selectedSeasonOption.season.table.teamsById
            : {},
          clubId: nextRow.clubId,
          teamSlot: nextRow.teamSlot,
        })
      }

      if (column.key === 'goalDifference') {
        nextRow.goalDifference = formatGoalDifference(value)
      }

      nextRow.valid = isImportRowReady(nextRow)
      nextRow.errors = nextRow.valid ? [] : (Array.isArray(nextRow.errors) ? nextRow.errors : [])
      return nextRow
    }))
  }, [selectedSeasonOption])

  const buildApprovedInput = React.useCallback(() => {
    const serviceLeague = buildServiceLeague({ league, leagueDoc })
    const serviceSeason = buildServiceSeason({
      league,
      leagueDoc,
      selectedSeasonOption,
      seasonStatus,
      gameDurationMinutes,
    })
    const serviceRows = buildServiceRows({ rows })
    const actionTime = new Date().toISOString()

    return {
      league: serviceLeague,
      season: serviceSeason,
      rows: serviceRows,
      createdAt: actionTime,
      updatedAt: actionTime,
      tableImportedAt: actionTime,
      calculatedAt: actionTime,
    }
  }, [gameDurationMinutes, league, leagueDoc, rows, seasonStatus, selectedSeasonOption])

  const handleApproveForSync = React.useCallback(() => {
    if (!canConfirm) return false
    setApprovedInput(buildApprovedInput())
    setReceiptId('')
    setExecutionResult(null)
    setExecutionReceipt(null)
    setExecutionStatus('ready')
    setExecutionError('')
    return true
  }, [buildApprovedInput, canConfirm])

  const executeApprovedImport = React.useCallback(async () => {
    if (!approvedInput || busy) return false
    if (receiptId && !executionReceipt) {
      setExecutionError('לא ניתן לקבוע את מצב הקבלה. יש לפתוח אותה בעמוד ניהול הדאטה.')
      return false
    }

    setBusy(true)
    setExecutionStatus('running')
    setExecutionError('')

    try {
      const canonicalConfirmed = clean(
        executionReceipt && executionReceipt.canonicalOutcome
      ) === 'confirmed'
      if (canonicalConfirmed) {
        setExecutionReceipt(current => applyLeagueSyncProgressEvent({
          receipt: current,
          event: { type: 'repairStarted', receiptId },
        }))
      }
      const result = canonicalConfirmed
        ? await repairWriteActionReceipt({ receiptId })
        : await loadLeague({
            input: approvedInput,
            receiptId,
            display: {
              leagueName: league && league.name ? league.name : '',
              seasonKey: approvedInput.season.seasonKey,
              birthYear: approvedInput.season.birthYear,
            },
            onProgress: event => {
              setReceiptId(clean(event && event.receiptId))
              setExecutionReceipt(current => applyLeagueSyncProgressEvent({
                receipt: current,
                event,
              }))
            },
          })

      setExecutionResult(result)
      setReceiptId(clean(result && result.receiptId))
      try {
        const completedReceipt = await getWriteActionReceipt({
          receiptId: clean(result && result.receiptId),
        })
        setExecutionReceipt(completedReceipt)
      } catch {
        setExecutionReceipt(current => ({
          ...current,
          id: clean(result && result.receiptId),
          status: result && result.status,
          executionStatus: result && result.executionStatus,
          recoveryRequired: Boolean(result && result.recoveryRequired),
        }))
      }

      if (result && result.executionStatus === 'succeeded' && result.status === 'closed') {
        setExecutionStatus('succeeded')
        try {
          if (typeof reload === 'function') await reload()
        } catch (reloadError) {
          notify({
            status: SNACK_STATUS.WARNING,
            title: 'הטעינה הושלמה',
            message: 'הכתיבה והביקורת הושלמו, אך רענון התצוגה נכשל. יש לרענן את העמוד.',
          })
        }
        return true
      }

      setExecutionStatus('failed')
      setExecutionError('הכתיבה הסתיימה אך ה־Audit לא נסגר כנקי. ניתן לנסות שוב עם אותו Receipt.')
      return false
    } catch (error) {
      setExecutionStatus('failed')
      setExecutionError(describeFailure(error))
      const failedReceiptId = clean(error && error.receiptId) || receiptId
      if (failedReceiptId) {
        setReceiptId(failedReceiptId)
        try {
          const failedReceipt = await getWriteActionReceipt({ receiptId: failedReceiptId })
          setExecutionReceipt(failedReceipt)
        } catch {
          setExecutionReceipt(null)
          setExecutionError(
            `${describeFailure(error)} מצב הקבלה לא נטען; יש לבדוק אותה בעמוד ניהול הדאטה.`
          )
        }
      }
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת הליגה נכשלה',
        message: describeFailure(error),
        details: mapFirestoreErrorToDetails(error),
      })
      return false
    } finally {
      setBusy(false)
    }
  }, [approvedInput, busy, executionReceipt, league, notify, receiptId, reload])

  const finishLeagueImport = React.useCallback(() => {
    if (busy || executionStatus !== 'succeeded') return false
    setOpen(false)
    return true
  }, [busy, executionStatus])

  const handleOpen = React.useCallback(() => {
    if (busy) return
    setGameDurationMinutes(resolveGameDuration())
    setOpen(true)
  }, [busy, resolveGameDuration])

  return {
    open,
    pasteValue,
    rows,
    canConfirm,
    busy,
    seasonStatus,
    gameDurationMinutes,
    gameDurationValid,
    hasStartedData,
    identityIndexDocument: null,
    identityValidationError: false,
    approvedPayload: approvedInput,
    receiptId,
    auditResult: executionResult && executionResult.audit ? executionResult.audit : null,
    executionReceipt,
    executionResult,
    executionStatus,
    executionError,
    syncComplete: executionStatus === 'succeeded',
    syncStages: buildLeagueSyncStages({ receipt: executionReceipt, busy }),
    retryMode: clean(executionReceipt && executionReceipt.canonicalOutcome) === 'confirmed'
      ? 'repair'
      : 'retry',
    structuralChanges,
    structuralAcknowledged,
    setOpen,
    setSeasonStatus,
    setPasteValue: handlePasteValueChange,
    setStructuralAcknowledged,
    handlePreview,
    handleClear,
    handleCellChange,
    handleApproveForSync,
    executeApprovedImport,
    retryApprovedImport: executeApprovedImport,
    finishLeagueImport,
    handleClose: () => {
      if (busy) return
      setOpen(false)
    },
    handleOpen,
  }
}
