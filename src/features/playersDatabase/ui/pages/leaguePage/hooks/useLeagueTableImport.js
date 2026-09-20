// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueTableImport.js

import * as React from 'react'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { readClubSeasonIdentityIndex } from '../../../../services/read/index.js'
import { resolveLeagueClubIdentityIndex } from '../../../../import/logic/leagueClubMasterWarnings.js'
import {
  buildLeagueImportPreview,
  buildServiceLeague,
  buildServiceRows,
  buildServiceSeason,
  formatGoalDifference,
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
  const identityIndexRef = React.useRef(null)
  const hasStartedData = React.useMemo(() => hasStartedSeasonData(rows), [rows])
  const canConfirm = React.useMemo(() => {
    return Boolean(seasonStatus) && rows.length > 0 && rows.every(row => (
      row.valid !== false && isImportRowReady(row)
    ))
  }, [rows, seasonStatus])

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
    } catch {
      setIdentityIndexDocument(null)
      setRows(preview.rows || [])
      return
    }
  }, [pasteValue, league, leagueDoc, selectedSeasonOption, applyClubMasterWarnings])

  const handleClear = React.useCallback(() => {
    if (busy) return

    setPasteValue('')
    setRows([])
    setSeasonStatus('')
    identityIndexRef.current = null
    setIdentityIndexDocument(null)
  }, [busy])

  const handleCellChange = React.useCallback(({ rowIndex, column, value }) => {
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
        nextRow.teamSlotConfirmed = true
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
  }, [rows, applyClubMasterWarnings])

  const handleConfirm = React.useCallback(async () => {
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

    setBusy(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_LEAGUE_TABLE,
        payload: {
          league: serviceLeague,
          season: serviceSeason,
          target: seasonStatus === 'completed' ? 'history' : 'current',
          rows: serviceRows,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טבלת הליגה נשמרה',
        message: String(result.rowsCount || serviceRows.length) + ' שורות עודכנו',
      })

      setOpen(false)
      setPasteValue('')
      setRows([])
      reload()
    } catch (error) {
      setOpen(false)
      setWriteReport(error?.writeReport || {
        flow: 'pasteLeagueTable',
        status: 'failed',
        failedStage: error?.stage || 'unknown',
        message: error?.message || 'טעינת טבלת הליגה נכשלה',
        completedStages: Object.keys(error?.results || {}),
        failures: [{
          code: error?.code || 'WRITE_FLOW_FAILED',
          message: error?.message || 'טעינת טבלת הליגה נכשלה',
        }],
        duplicates: [],
        results: error?.results || {},
      })

      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת טבלת הליגה נכשלה',
        message: serviceLeague.name || 'ליגה',
        details: mapFirestoreErrorToDetails(error),
      })
    } finally {
      setBusy(false)
    }
  }, [league, leagueDoc, selectedSeasonOption, rows, seasonStatus, notify, reload])

  return {
    open,
    pasteValue,
    rows,
    canConfirm,
    busy,
    seasonStatus,
    hasStartedData,
    identityIndexDocument,
    setOpen,
    setSeasonStatus,
    setPasteValue,
    handlePreview,
    handleClear,
    handleCellChange,
    handleConfirm,
    handleClose: () => setOpen(false),
    handleOpen: () => setOpen(true),
    writeReport,
    closeWriteReport: () => setWriteReport(null),
  }
}
