// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueTableImport.js

import * as React from 'react'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import {
  WRITE_ACTION_V2_CANONICAL_STATUS,
  WRITE_ACTION_V2_FLOW_TYPE,
  closeWriteActionReceiptV2,
  createWriteActionReceiptV2,
  reportWriteActionCanonicalStatusV2,
  saveWriteActionAuditSummaryV2,
  syncClubsMasterV2,
  syncLeagueClubsV2,
  syncLeagueIdentityV2,
  syncLeagueTeamsV2,
  syncLeaguesMasterV2,
  writeLeagueV2,
} from '../../../../services/writeV2/index.js'
import { auditLeagueV2 } from '../../../../services/auditV2/index.js'
import { readClubSeasonIdentityIndex } from '../../../../services/read/index.js'
import { resolveLeagueClubIdentityIndex } from '../../../../import/logic/leagueClubMasterWarnings.js'
import {
  buildLeagueImportPreview,
  buildServiceLeague,
  buildServiceRows,
  buildServiceSeason,
  formatGoalDifference,
  resolveExistingLeagueTeamUrl,
} from '../logic/leagueImport.logic.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const resolveLeagueLevel = (...values) => (
  values
    .map(value => Number(value))
    .find(value => Number.isFinite(value) && value > 0) || 0
)

const toImportNumber = value => {
  const nextValue = Number(clean(value).replace(/\u200E/g, ''))
  return Number.isFinite(nextValue) ? nextValue : null
}

const hasStartedSeasonData = rows => (
  (Array.isArray(rows) ? rows : []).some(row => (
    ['games', 'wins', 'draws', 'losses', 'goalsFor', 'goalsAgainst', 'points']
      .some(field => (toImportNumber(row?.[field]) || 0) > 0)
  ))
)

const isImportRowReady = row => {
  if (!clean(row?.clubId)) return false
  if (!clean(row?.teamSlot)) return false
  if (!Number.isFinite(toImportNumber(row?.rank)) || toImportNumber(row?.rank) <= 0) return false

  return [
    'games',
    'wins',
    'draws',
    'losses',
    'goalsFor',
    'goalsAgainst',
    'points',
  ].every(field => {
    const value = toImportNumber(row?.[field])
    return Number.isFinite(value) && value >= 0
  })
}

const buildStructuralLeagueDiff = ({ existingRows = [], nextRows = [] } = {}) => {
  const identityKey = row => clean(row?.teamId || row?.birthTeamId) || [
    clean(row?.clubId),
    clean(row?.teamSlot || row?.birthTeamSlot || '1'),
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
    const slotChanged = clean(existing.teamSlot || existing.birthTeamSlot || '1') !==
      clean(row.teamSlot || row.birthTeamSlot || '1')
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

export function useLeagueTableImport({
  league = {},
  leagueDoc = {},
  selectedSeasonOption = {},
  reload,
} = {}) {
  const { notify } = useSnackbar()
  const [open, setOpen] = React.useState(false)
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)
  const [seasonStatus, setSeasonStatus] = React.useState('')
  const [identityIndexDocument, setIdentityIndexDocument] = React.useState(null)
  const [identityValidationError, setIdentityValidationError] = React.useState(false)
  const [approvedPayload, setApprovedPayload] = React.useState(null)
  const [receiptId, setReceiptId] = React.useState('')
  const [auditResult, setAuditResult] = React.useState(null)
  const [syncState, setSyncState] = React.useState({})
  const [syncResults, setSyncResults] = React.useState({})
  const [structuralAcknowledged, setStructuralAcknowledged] = React.useState(false)
  const identityIndexRef = React.useRef(null)
  const syncCacheRefreshRef = React.useRef(false)
  const hasStartedData = React.useMemo(() => hasStartedSeasonData(rows), [rows])
  const structuralChanges = React.useMemo(() => buildStructuralLeagueDiff({
    existingRows: selectedSeasonOption?.season?.tableRank || [],
    nextRows: rows,
  }), [rows, selectedSeasonOption])
  const canConfirm = React.useMemo(() => {
    const rowsReady = Boolean(seasonStatus) && rows.length > 0 && rows.every(row => (
      row.valid !== false && isImportRowReady(row)
    ))
    return !identityValidationError && rowsReady
  }, [
    identityValidationError,
    rows,
    seasonStatus,
  ])

  const applyClubMasterWarnings = React.useCallback(({ previewRows = [], identityIndex = {} } = {}) => {
    const identityResolution = resolveLeagueClubIdentityIndex({
      rows: previewRows,
      identityIndex,
      // The catalog identity is authoritative here. A Firestore document id can
      // be season-scoped, while identity-index entries use the catalog league id.
      leagueId: league.id || league.leagueId || leagueDoc.leagueId || leagueDoc.id,
      seasonKey: selectedSeasonOption?.season?.seasonKey || league.seasonKey,
      birthYear: selectedSeasonOption?.season?.birthYear || league.birthYear,
      ageGroupId: league.ageGroupId || leagueDoc.ageGroupId,
      // Prefer the catalog's numeric level. Some persisted league documents
      // expose a different, non-numeric `level` field.
      leagueLevel: resolveLeagueLevel(league.level, leagueDoc.level, leagueDoc.leagueLevel),
    })
    const warnings = identityResolution.warnings
    const warningByRowIndex = new Map(warnings.map(warning => [warning.rowIndex, warning]))

    return identityResolution.rows.map((row, rowIndex) => {
      const warning = warningByRowIndex.get(rowIndex)
      // Another team from the same club is valid when it has a different slot.
      // Block only an actual identity collision: same club, season, age group,
      // and team slot in another league.
      if (!warning) {
        const { identityWarningMessage, ...rowWithoutIdentityWarning } = row
        return rowWithoutIdentityWarning
      }

      if (!warning.selectedSlotConflict) {
        return {
          ...row,
          identityWarningMessage: warning.message,
        }
      }

      return {
        ...row,
        identityWarningMessage: '',
        requiresTeamSlotResolution: true,
        valid: false,
        status: 'error',
        errors: [warning.message],
      }
    })
  }, [league, leagueDoc, selectedSeasonOption])

  React.useEffect(() => {
    if (seasonStatus === 'not_started' && hasStartedData) {
      setSeasonStatus('')
    }
  }, [hasStartedData, seasonStatus])

  const handlePreview = React.useCallback(async () => {
    setStructuralAcknowledged(false)
    setIdentityValidationError(false)
    const preview = buildLeagueImportPreview({
      text: pasteValue,
      league,
      leagueDoc,
      selectedSeasonOption,
    })

    try {
      const identityIndex = resolveLeagueLevel(league.level, leagueDoc.level, leagueDoc.leagueLevel) >= 2
        ? await readClubSeasonIdentityIndex({
            seasonKey: selectedSeasonOption?.season?.seasonKey || league.seasonKey,
            birthYear: selectedSeasonOption?.season?.birthYear || league.birthYear,
          })
        : null
      identityIndexRef.current = identityIndex
      setIdentityIndexDocument(identityIndex)
      setRows(applyClubMasterWarnings({
        previewRows: preview.rows || [],
        identityIndex,
      }))
    } catch (error) {
      identityIndexRef.current = null
      setIdentityIndexDocument(null)
      setIdentityValidationError(true)
      setRows(preview.rows || [])
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'בדיקת הזהויות נכשלה',
        message: 'לא ניתן להמשיך לפני טעינת נתוני הזיהוי. נסה שוב.',
        details: mapFirestoreErrorToDetails(error),
      })
      return
    }
  }, [
    pasteValue,
    league,
    leagueDoc,
    selectedSeasonOption,
    applyClubMasterWarnings,
    notify,
  ])

  const handleClear = React.useCallback(() => {
    if (busy) return

    setPasteValue('')
    setRows([])
    setSeasonStatus('')
    identityIndexRef.current = null
    setIdentityIndexDocument(null)
    setIdentityValidationError(false)
    setApprovedPayload(null)
    setReceiptId('')
    setAuditResult(null)
    setSyncState({})
    setSyncResults({})
    syncCacheRefreshRef.current = false
    setStructuralAcknowledged(false)
  }, [busy])

  const handleCellChange = React.useCallback(({ rowIndex, column, value }) => {
    setStructuralAcknowledged(false)
    const changedRows = rows.map((row, index) => {
      if (index !== rowIndex) return row

      const nextRow = {
        ...row,
        [column.key]: value,
      }

      if (column.key === 'clubId') {
        const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === value)
        nextRow.clubName = club?.name || ''
        // A manual club match is valid on its own. Only the identity-index
        // check may block it when this exact team slot already exists elsewhere.
        nextRow.requiresTeamSlotResolution = false
      }

      if (column.key === 'teamSlot') {
        nextRow.teamSlot = value || '1'
        nextRow.requiresTeamSlotResolution = false
      }

      if (column.key === 'clubId' || column.key === 'teamSlot') {
        nextRow.displayTeamUrl = clean(nextRow.pastedTeamUrl) || resolveExistingLeagueTeamUrl({
          existingTableRank: selectedSeasonOption?.season?.tableRank || [],
          clubId: nextRow.clubId,
          teamSlot: nextRow.teamSlot,
        })
      }
      if (column.key === 'goalDifference') {
        nextRow.goalDifference = formatGoalDifference(value)
      }

      const valid = isImportRowReady(nextRow) && !nextRow.requiresTeamSlotResolution
      nextRow.valid = valid
      nextRow.errors = valid
        ? []
        : (Array.isArray(nextRow.errors) ? nextRow.errors : [])

      return nextRow
    })

    setRows(applyClubMasterWarnings({
      previewRows: changedRows,
      identityIndex: identityIndexRef.current,
    }))
  }, [rows, applyClubMasterWarnings, selectedSeasonOption])

  const buildApprovedPayload = React.useCallback(() => {
    const serviceLeague = buildServiceLeague({
      league,
      leagueDoc,
    })
    const serviceSeason = buildServiceSeason({
      league,
      leagueDoc,
      selectedSeasonOption,
      seasonStatus,
    })
    const serviceRows = buildServiceRows({
      rows,
      league: serviceLeague,
      season: serviceSeason,
    })

    return {
      league: serviceLeague,
      season: serviceSeason,
      target: seasonStatus === 'completed' ? 'history' : 'current',
      rows: serviceRows,
    }
  }, [league, leagueDoc, selectedSeasonOption, seasonStatus, rows])

  const handleApproveForSync = React.useCallback(() => {
    if (!canConfirm) return false

    syncCacheRefreshRef.current = false
    setApprovedPayload(buildApprovedPayload())
    setReceiptId('')
    setAuditResult(null)
    setSyncState({})
    setSyncResults({})
    return true
  }, [buildApprovedPayload, canConfirm])

  const runSyncStep = React.useCallback(async ({ key, action, successTitle }) => {
    if (!approvedPayload || busy) return null

    setBusy(true)
    setSyncState(current => ({
      ...current,
      [key]: { status: 'running', error: '' },
    }))

    try {
      const result = await action(approvedPayload, syncResults)
      setSyncResults(current => ({ ...current, [key]: result }))
      setSyncState(current => ({
        ...current,
        [key]: { status: 'completed', error: '' },
      }))
      notify({
        status: SNACK_STATUS.SUCCESS,
        title: successTitle,
      })
      return result
    } catch (error) {
      setSyncState(current => ({
        ...current,
        [key]: {
          status: 'failed',
          error: error?.message || 'הפעולה נכשלה',
        },
      }))
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'הסנכרון נכשל',
        message: error?.message || successTitle,
        details: mapFirestoreErrorToDetails(error),
      })
      return null
    } finally {
      setBusy(false)
    }
  }, [approvedPayload, busy, notify, syncResults])

  const syncLeagueCanonical = React.useCallback(() => runSyncStep({
    key: 'league',
    successTitle: 'טבלת הליגה נשמרה',
    action: async payload => {
      let activeReceiptId = receiptId

      if (!activeReceiptId) {
        activeReceiptId = await createWriteActionReceiptV2({
          flowType: WRITE_ACTION_V2_FLOW_TYPE.LEAGUE,
          label: 'טעינת קבוצות ליגה',
          auditTarget: {
            leagueId: payload.league?.id || payload.league?.leagueId,
            seasonKey: payload.season?.seasonKey,
          },
        })
        setReceiptId(activeReceiptId)
      }

      try {
        const result = await writeLeagueV2(payload)

        await reportWriteActionCanonicalStatusV2({
          receiptId: activeReceiptId,
          canonicalStatus: WRITE_ACTION_V2_CANONICAL_STATUS.REPORTED,
        })

        return result
      } catch (error) {
        await reportWriteActionCanonicalStatusV2({
          receiptId: activeReceiptId,
          canonicalStatus: WRITE_ACTION_V2_CANONICAL_STATUS.FAILED_OR_UNKNOWN,
        }).catch(() => null)

        throw error
      }
    },
  }), [receiptId, runSyncStep])

  const syncLeaguesMaster = React.useCallback(() => runSyncStep({
    key: 'leaguesMaster',
    successTitle: 'אינדקס הליגות סונכרן',
    action: () => syncLeaguesMasterV2(),
  }), [runSyncStep])

  const syncLeagueIdentity = React.useCallback(() => runSyncStep({
    key: 'identity',
    successTitle: 'אינדקס הזיהוי סונכרן',
    action: payload => syncLeagueIdentityV2(payload),
  }), [runSyncStep])

  const syncLeagueTeams = React.useCallback(() => runSyncStep({
    key: 'teams',
    successTitle: 'נתוני הקבוצות סונכרנו',
    action: (payload, results) => syncLeagueTeamsV2({
      ...payload,
      removedLeagueEntries: results.identity?.removedEntries || [],
    }),
  }), [runSyncStep])

  const syncLeagueClubs = React.useCallback(() => runSyncStep({
    key: 'clubs',
    successTitle: 'נתוני המועדונים סונכרנו',
    action: (payload, results) => syncLeagueClubsV2({
      ...payload,
      leagueSeasonDocument: results.league?.seasonDocument || {},
      removedLeagueEntries: results.identity?.removedEntries || [],
    }),
  }), [runSyncStep])

  const syncClubsMaster = React.useCallback(() => runSyncStep({
    key: 'clubsMaster',
    successTitle: 'אינדקס המועדונים סונכרן',
    action: () => syncClubsMasterV2(),
  }), [runSyncStep])

  const runLeagueAudit = React.useCallback(() => runSyncStep({
    key: 'audit',
    successTitle: 'בדיקת הסנכרון הושלמה',
    action: async payload => {
      if (!receiptId) throw new Error('Missing League WriteAction V2 receipt')

      const result = await auditLeagueV2({
        leagueId: payload.league?.id || payload.league?.leagueId,
        seasonKey: payload.season?.seasonKey,
      })
      const ranAt = new Date().toISOString()

      await saveWriteActionAuditSummaryV2({
        receiptId,
        ranAt,
        coverage: result.coverage?.complete ? 'complete' : 'partial',
        findingsCount: result.findings?.length || 0,
        checkedDomains: result.coverage?.coveredTargets || [],
      })

      setAuditResult(result)
      return result
    },
  }), [receiptId, runSyncStep])

  const syncComplete = [
    'league',
    'leaguesMaster',
    'identity',
    'teams',
    'clubs',
    'clubsMaster',
    'audit',
  ].every(key => syncState[key]?.status === 'completed')

  React.useEffect(() => {
    if (!syncComplete || syncCacheRefreshRef.current || typeof reload !== 'function') return

    syncCacheRefreshRef.current = true
    reload()
  }, [reload, syncComplete])



  const finishLeagueImport = React.useCallback(async () => {
    if (busy || !syncComplete || !receiptId || !auditResult) return false

    await closeWriteActionReceiptV2({
      receiptId,
    })

    setOpen(false)
    if (typeof reload === 'function') reload()
    return true
  }, [
    auditResult,
    busy,
    receiptId,
    reload,
    syncComplete,
  ])


  return {
    open,
    pasteValue,
    rows,
    canConfirm,
    busy,
    seasonStatus,
    hasStartedData,
    identityIndexDocument,
    identityValidationError,
    approvedPayload,
    syncState,
    syncResults,
    syncComplete,
    receiptId,
    auditResult,
    structuralChanges,
    structuralAcknowledged,
    setOpen,
    setSeasonStatus,
    setPasteValue,
    setStructuralAcknowledged,
    handlePreview,
    handleClear,
    handleCellChange,
    handleApproveForSync,
    syncLeagueCanonical,
    syncLeaguesMaster,
    syncLeagueIdentity,
    syncLeagueTeams,
    syncLeagueClubs,
    syncClubsMaster,
    runLeagueAudit,
    finishLeagueImport,
    handleClose: () => {
      setOpen(false)
      reload()
    },
    handleOpen: () => setOpen(true),
    writeReport,
    closeWriteReport: () => setWriteReport(null),
  }
}