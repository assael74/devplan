// features/playersDatabase/ui/pages/teamPage/hooks/useTeamRosterImport.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { resolveTeamPlayerIdentityPreview } from '../../../../services/write/players/index.js'
import { readPlayerIdentityReview } from '../../../../services/read/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { parsePlayerRosterRows } from '../logic/teamRosterImport.logic.js'
import { buildWriteReportFromError } from '../logic/writeFlowReport.logic.js'

export default function useTeamRosterImport({
  leagueId,
  leagueDoc,
  team,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)
  const [identityReview, setIdentityReview] = React.useState({
    open: false,
    rowIndex: -1,
    row: null,
    candidates: [],
    loading: false,
    error: '',
  })

  const buildSeason = React.useCallback(() => ({
    ...(selectedSeasonOption?.season || {}),
    leagueId,
    ageGroupId: team.ageGroupId,
    birthYear: team.birthYear,
    seasonId: selectedSeasonOption?.seasonId,
    seasonKey: selectedSeasonOption?.seasonKey,
  }), [leagueId, selectedSeasonOption, team.ageGroupId, team.birthYear])

  const parse = React.useCallback(async () => {
    const parsedRows = parsePlayerRosterRows(pasteValue)

    if (!parsedRows.length || !selectedSeasonOption) {
      setRows(parsedRows)
      return
    }

    setBusy(true)

    try {
      const previewRows = await resolveTeamPlayerIdentityPreview({
        players: parsedRows,
        season: buildSeason(),
      })

      setRows(previewRows)
    } catch (error) {
      console.error('[playersDatabase/identity-preview]', error)
      setRows(parsedRows.map(row => ({
        ...row,
        identityStatus: 'נדרשת בדיקה',
        identityMessage: 'בדיקת הזהות נכשלה',
        identityValid: false,
      })))
    } finally {
      setBusy(false)
    }
  }, [buildSeason, pasteValue, selectedSeasonOption])

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

  const closeIdentityReview = React.useCallback(() => {
    setIdentityReview({
      open: false,
      rowIndex: -1,
      row: null,
      candidates: [],
      loading: false,
      error: '',
    })
  }, [])

  const openIdentityReview = React.useCallback(async rowIndex => {
    const row = rows[rowIndex]
    if (!row) return

    const candidates = Array.isArray(row.identityCandidates)
      ? row.identityCandidates
      : []

    setIdentityReview({
      open: true,
      rowIndex,
      row,
      candidates,
      loading: true,
      error: '',
    })

    try {
      const review = await readPlayerIdentityReview({
        candidates,
      })

      setIdentityReview(current => ({
        ...current,
        candidates: review.candidates,
        loading: false,
      }))
    } catch (error) {
      console.error('[playersDatabase/identity-review]', error)

      setIdentityReview(current => ({
        ...current,
        loading: false,
        error: error instanceof Error
          ? error.message
          : 'טעינת פרטי השחקן נכשלה',
      }))
    }
  }, [rows])

  const resolveIdentityReview = React.useCallback(({
    action,
    candidate = {},
  }) => {
    const rowIndex = identityReview.rowIndex
    if (rowIndex < 0) return

    setRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      if (action === 'useExisting') {
        const existingExternalPlayerId = String(
          candidate.externalPlayerId || ''
        ).trim()
        const incomingPlayerUrl = String(row.playerUrl || '').trim()
        const playerUrl = existingExternalPlayerId
          ? incomingPlayerUrl.replace(
            /([?&]player_id=)\d+/i,
            `$1${existingExternalPlayerId}`
          )
          : incomingPlayerUrl

        return {
          ...row,
          playerId: candidate.playerId || '',
          playerDocumentId: candidate.playerDocumentId || '',
          externalPlayerId: existingExternalPlayerId || row.externalPlayerId,
          playerUrl: playerUrl || candidate.playerUrl || '',
          identityResolution: 'useExisting',
          identityStatus: 'זוהה כשחקן קיים',
          identityMessage: existingExternalPlayerId
            ? `אושר כשחקן הקיים · מזהה ${existingExternalPlayerId}`
            : 'אושר כשחקן הקיים',
          identityValid: true,
        }
      }

      if (action === 'newPlayer') {
        return {
          ...row,
          playerId: '',
          playerDocumentId: '',
          identityResolution: 'ignoreConflict',
          identityStatus: 'אושר כשחקן חדש',
          identityMessage: 'אושר כשחקן אחר למרות התאמת השם',
          identityValid: true,
        }
      }

      if (action === 'incomingIdCorrect') {
        return {
          ...row,
          identityResolution: 'replaceExternalPending',
          identityStatus: 'דורש עדכון מזהה',
          identityMessage: 'סומן שזה אותו שחקן והמזהה החדש נכון; יש לעדכן את הזהות הקיימת לפני טעינת הסגל',
          identityValid: false,
        }
      }

      return row
    }))

    closeIdentityReview()
  }, [
    closeIdentityReview,
    identityReview.rowIndex,
  ])

  const getRowStatus = React.useCallback(row => ({
    valid: row?.identityValid !== false,
    message: row?.identityValid === false
      ? row.identityMessage || 'נדרשת בדיקת זהות'
      : '',
  }), [])

  const hasIdentityErrors = rows.some(row => row.identityValid === false)

  const closeWriteReport = React.useCallback(() => {
    setWriteReport(null)
  }, [])

  const clearPaste = React.useCallback(() => {
    if (busy) return

    setPasteValue('')
    setRows([])
  }, [busy])

  const close = React.useCallback(() => {
    if (busy) return
    setOpen(false)
  }, [busy])

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption || hasIdentityErrors) return

    setBusy(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: buildSeason(),
          team,
          players: rows,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טעינת סגל הושלמה',
        message: `${rows.length} שורות עודכנו`,
      })

      setOpen(false)
      setPasteValue('')
      setRows([])
      reload()
    } catch (error) {
      console.error('[playersDatabase/write-flow]', error?.writeReport || error)
      setOpen(false)
      setWriteReport(buildWriteReportFromError({
        error,
        flow: 'pasteTeamPlayers',
      }))

      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת סגל נכשלה',
        message: 'נפתח דוח כתיבה מפורט לבדיקה',
      })
    } finally {
      setBusy(false)
    }
  }, [
    buildSeason,
    hasIdentityErrors,
    leagueDoc,
    leagueId,
    notify,
    reload,
    rows,
    selectedSeasonOption,
    team,
  ])

  return {
    open,
    pasteValue,
    rows,
    busy,
    writeReport,
    hasIdentityErrors,
    setOpen,
    setPasteValue,
    clearPaste,
    parse,
    changeCell,
    identityReview,
    openIdentityReview,
    closeIdentityReview,
    resolveIdentityReview,
    getRowStatus,
    close,
    closeWriteReport,
    confirm,
  }
}
