// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueTableImport.js

import * as React from 'react'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { getWriteActionReceipt } from '../../../../services/write/receipt/index.js'
import {
  loadLeague,
  readOtherLeagueTeamOwners,
} from '../../../../services/write/league/index.js'
import { repairWriteActionReceipt } from '../../../../services/write/recovery/index.js'
import {
  applyLeagueTeamOwnerConflicts,
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
    hasExistingRows: existingByKey.size > 0,
    hasChanges: added.length > 0 || removed.length > 0 || changed.length > 0,
  }
}

const describeFailure = error => {
  if (clean(error && error.code) === 'LEAGUE_TEAM_DUPLICATE_OWNER') {
    const teamId = clean(error && error.teamId)
    const leagueIds = Array.isArray(error && error.leagueIds)
      ? error.leagueIds.map(clean).filter(Boolean).join(', ')
      : ''
    return `הקבוצה ${teamId || 'שנבחרה'} כבר קיימת בעונה זו בליגה אחרת${leagueIds ? `: ${leagueIds}` : ''}. יש לבחור מספר קבוצה אחר או להסיר תחילה את השיוך הישן.`
  }

  return clean(error && (error.message || error.code)) || 'טעינת הליגה נכשלה'
}

const isHistoricalSeason = seasonKey => {
  const normalizedSeasonKey = clean(seasonKey)
  return Boolean(normalizedSeasonKey) && normalizedSeasonKey !== '26/27'
}

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
  const [identityCheckBusy, setIdentityCheckBusy] = React.useState(false)
  const [identityValidationError, setIdentityValidationError] = React.useState(false)
  const teamOwnersRef = React.useRef({})
  const historicalSeason = isHistoricalSeason(
    selectedSeasonOption?.seasonKey ||
    selectedSeasonOption?.season?.seasonKey ||
    league?.seasonKey
  )
  const importBirthYear = Number(
    selectedSeasonOption?.season?.birthYear || league?.birthYear
  ) || 0

  const hasStartedData = React.useMemo(() => hasStartedSeasonData(rows), [rows])
  const structuralChanges = React.useMemo(() => buildStructuralLeagueDiff({
    existingRows: toExistingRows(selectedSeasonOption && selectedSeasonOption.season),
    nextRows: rows,
  }), [rows, selectedSeasonOption])
  const gameDurationValid = Number.isFinite(Number(gameDurationMinutes)) && Number(gameDurationMinutes) > 0
  const canConfirm = React.useMemo(() => (
    !identityCheckBusy &&
    !identityValidationError &&
    Boolean(seasonStatus) &&
    gameDurationValid &&
    rows.length > 0 &&
    rows.every(row => row && row.valid !== false && isImportRowReady(row))
  ), [gameDurationValid, identityCheckBusy, identityValidationError, rows, seasonStatus])

  React.useEffect(() => {
    if (open) return
    setGameDurationMinutes(resolveGameDuration())
  }, [open, resolveGameDuration])

  React.useEffect(() => {
    if (seasonStatus === 'not_started' && hasStartedData) {
      setSeasonStatus('')
    }
  }, [hasStartedData, seasonStatus])

  React.useEffect(() => {
    if (open && historicalSeason && seasonStatus !== 'completed') {
      setSeasonStatus('completed')
    }
  }, [historicalSeason, open, seasonStatus])

  const resetExecution = React.useCallback(() => {
    setApprovedInput(null)
    setReceiptId('')
    setExecutionResult(null)
    setExecutionReceipt(null)
    setExecutionStatus('idle')
    setExecutionError('')
  }, [])

  const handlePreview = React.useCallback(async () => {
    setIdentityCheckBusy(true)
    setIdentityValidationError(false)
    setRows([])
    const previewRows = buildLeagueImportPreview({
      text: pasteValue,
      league,
      leagueDoc,
      selectedSeasonOption,
    }).rows || []
    const serviceLeague = buildServiceLeague({ league, leagueDoc })
    const serviceSeason = buildServiceSeason({
      league,
      leagueDoc,
      selectedSeasonOption,
    })

    try {
      const otherLeagueIdsByTeamId = await readOtherLeagueTeamOwners({
        leagueId: serviceLeague.leagueId,
        seasonId: serviceSeason.seasonId,
      })
      teamOwnersRef.current = otherLeagueIdsByTeamId
      setRows(applyLeagueTeamOwnerConflicts({
        rows: previewRows,
        otherLeagueIdsByTeamId,
        birthYear: serviceSeason.birthYear,
      }))
    } catch (previewError) {
      teamOwnersRef.current = {}
      setIdentityValidationError(true)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'בדיקת זהות הקבוצות נכשלה',
        message: 'לא ניתן להמשיך לפני קריאה טרייה של הליגות. נסה שוב.',
        details: mapFirestoreErrorToDetails(previewError),
      })
    } finally {
      setIdentityCheckBusy(false)
    }
  }, [league, leagueDoc, notify, pasteValue, selectedSeasonOption])

  const handlePasteValueChange = React.useCallback(value => {
    setPasteValue(value)
    setRows([])
    teamOwnersRef.current = {}
    setIdentityValidationError(false)
  }, [])

  const handleClear = React.useCallback(() => {
    if (busy || identityCheckBusy) return
    setPasteValue('')
    setRows([])
    setSeasonStatus('')
    setGameDurationMinutes(resolveGameDuration())
    teamOwnersRef.current = {}
    setIdentityValidationError(false)
    resetExecution()
  }, [busy, identityCheckBusy, resetExecution, resolveGameDuration])

  const handleCellChange = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => applyLeagueTeamOwnerConflicts({
      rows: currentRows.map((row, index) => {
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
        nextRow.validBeforeTeamOwnerCheck = nextRow.valid
        nextRow.errors = nextRow.valid ? [] : (Array.isArray(nextRow.errors) ? nextRow.errors : [])
        return nextRow
      }),
      otherLeagueIdsByTeamId: teamOwnersRef.current,
      birthYear: importBirthYear,
    }))
  }, [importBirthYear, selectedSeasonOption])

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
    busy: busy || identityCheckBusy,
    seasonStatus,
    gameDurationMinutes,
    gameDurationValid,
    hasStartedData,
    identityIndexDocument: null,
    identityCheckBusy,
    identityValidationError,
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
    historicalSeason,
    setOpen,
    setSeasonStatus,
    setPasteValue: handlePasteValueChange,
    handlePreview,
    handleClear,
    handleCellChange,
    handleApproveForSync,
    executeApprovedImport,
    retryApprovedImport: executeApprovedImport,
    finishLeagueImport,
    handleClose: () => {
      if (busy || identityCheckBusy) return
      setOpen(false)
    },
    handleOpen,
  }
}
