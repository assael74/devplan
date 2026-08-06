// features/playersDatabase/ui/pages/teamPage/hooks/useTeamStatsImport.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  resolvePlayerIdentities,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { STATS_ROSTER_STATUS_OPTIONS } from '../logic/teamPage.constants.js'
import { clean } from '../logic/teamPage.utils.js'
import { parsePlayerStatsRows } from '../logic/teamStatsImport.logic.js'
import {
  STATS_IDENTITY_STATUS,
  applyResolvedStatsIdentity,
  buildRosterLookup,
  enrichStatsRowForPreview,
  findRosterPlayerByValue,
  normalizePlayerNameValue,
} from '../logic/teamStatsMatch.logic.js'
import { buildStatsScoutPreview } from '../logic/teamStatsScout.logic.js'
import { buildWriteReportFromError } from '../logic/writeFlowReport.logic.js'

const resolveSeasonStatus = selectedSeasonOption => {
  const storedStatus = clean(
    selectedSeasonOption?.season?.seasonStatus ||
    selectedSeasonOption?.seasonStatus
  ).toLowerCase()

  if (storedStatus === 'completed') return 'completed'
  if (storedStatus === 'active') return 'active'

  return selectedSeasonOption?.target === 'history'
    ? 'completed'
    : 'active'
}

export default function useTeamStatsImport({
  leagueId,
  leagueDoc,
  team,
  players,
  hasTeamPlayers,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)
  const [seasonStatus, setSeasonStatus] = React.useState(
    resolveSeasonStatus(selectedSeasonOption)
  )

  const rosterLookup = React.useMemo(() => buildRosterLookup(players), [players])

  React.useEffect(() => {
    setSeasonStatus(resolveSeasonStatus(selectedSeasonOption))
  }, [
    selectedSeasonOption?.seasonId,
    selectedSeasonOption?.season?.seasonStatus,
    selectedSeasonOption?.seasonStatus,
    selectedSeasonOption?.target,
  ])

  const seasonContext = React.useMemo(() => ({
    ...(selectedSeasonOption?.season || {}),
    seasonStatus,
    leagueId,
    ageGroupId: team.ageGroupId,
    birthYear: team.birthYear,
    seasonId: selectedSeasonOption?.seasonId,
    seasonKey: selectedSeasonOption?.seasonKey,
  }), [
    leagueId,
    seasonStatus,
    selectedSeasonOption,
    team.ageGroupId,
    team.birthYear,
  ])

  const enrichWithScout = React.useCallback(row => ({
    ...row,
    ...buildStatsScoutPreview({
      row,
      team,
      season: seasonContext,
    }),
  }), [seasonContext, team])

  const getRowStatus = React.useCallback(row => {
    const status = clean(row.rosterStatus || 'unresolved')
    const identityStatus = clean(row.identityStatus)
    const isException = STATS_ROSTER_STATUS_OPTIONS.some(option => (
      option.value === status
    ))

    if (!clean(row.fullName)) {
      return { valid: false, message: 'חסר שם שחקן' }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.AMBIGUOUS) {
      return { valid: false, message: row.identityMessage || 'נדרשת בדיקת זהות' }
    }

    if (status === 'transferredOut') {
      return { valid: true, message: 'סווג כשחקן שעבר קבוצה' }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.NEW_PLAYER && isException) {
      return { valid: true, message: 'שחקן חדש סווג במפורש בסגל העונה' }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.NEW_PLAYER) {
      return { valid: false, message: 'יש לבחור סטטוס בסגל העונה' }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH && status === 'regular') {
      return { valid: true, message: 'זוהה כשחקן סגל' }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.SYSTEM_MATCH && isException) {
      return { valid: true, message: 'זוהה במערכת וסווג בסגל העונה' }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.SYSTEM_MATCH) {
      return { valid: false, message: 'יש לבחור סטטוס בסגל העונה' }
    }

    return { valid: false, message: 'זהות השחקן לא נפתרה' }
  }, [])

  const hasInvalidRows = React.useMemo(() => (
    rows.some(row => !getRowStatus(row).valid)
  ), [getRowStatus, rows])

  const parse = React.useCallback(async () => {
    setBusy(true)

    try {
      const previewRows = parsePlayerStatsRows(pasteValue)
        .map(row => enrichStatsRowForPreview(row, rosterLookup))
      const resolvedRows = await resolvePlayerIdentities({
        players: previewRows,
        season: seasonContext,
      })
      const nextRows = previewRows.map((row, index) => (
        enrichWithScout(applyResolvedStatsIdentity({
          row,
          resolvedPlayer: resolvedRows[index],
        }))
      ))

      setRows(nextRows)
    } catch (error) {
      console.error('[playersDatabase/stats-preview]', error)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'בדיקת זהויות נכשלה',
        message: 'לא ניתן להציג את נתוני הסטטיסטיקה לפני פתרון התקלה',
      })
    } finally {
      setBusy(false)
    }
  }, [enrichWithScout, notify, pasteValue, rosterLookup, seasonContext])

  const changeCell = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      if (column.key === 'fullNameRosterMatch') {
        const matchedPlayer = findRosterPlayerByValue(players, value)

        if (!matchedPlayer) {
          return enrichWithScout({
            ...row,
            matchedPlayerId: '',
            matchedPlayerName: '',
            rosterStatus: 'unresolved',
            identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED,
            identityMessage: 'לא נבחר שחקן',
          })
        }

        const pastedName = row.originalFullName || row.fullName || ''
        const matchedName = matchedPlayer.fullName || row.fullName || ''
        const aliases = normalizePlayerNameValue(pastedName) !== normalizePlayerNameValue(matchedName)
          ? Array.from(new Set([...(row.aliases || []), pastedName].filter(Boolean)))
          : row.aliases || []

        return enrichWithScout({
          ...row,
          ...matchedPlayer,
          fullName: matchedName,
          originalFullName: pastedName,
          aliases,
          matchedPlayerId: value,
          matchedPlayerName: matchedName,
          rosterStatus: 'regular',
          isYoungerAgeGroup: false,
          isNameAlias: aliases.length > 0,
          identityStatus: STATS_IDENTITY_STATUS.ROSTER_MATCH,
          identityMessage: 'נבחר ידנית מתוך הסגל',
        })
      }

      const nextRow = { ...row, [column.key]: value }

      if (column.key === 'rosterStatus') {
        nextRow.rosterStatus = value || 'unresolved'
        nextRow.isYoungerAgeGroup = value === 'youngerAgeGroup'
      }

      return enrichWithScout(nextRow)
    }))
  }, [enrichWithScout, players])

  const changeSeasonStatus = React.useCallback(value => {
    const nextStatus = value === 'completed' ? 'completed' : 'active'

    setSeasonStatus(nextStatus)
    setRows(currentRows => currentRows.map(row => ({
      ...row,
      ...buildStatsScoutPreview({
        row,
        team,
        season: {
          ...seasonContext,
          seasonStatus: nextStatus,
        },
      }),
    })))
  }, [seasonContext, team])


  const clearPaste = React.useCallback(() => {
    if (busy) return

    setPasteValue('')
    setRows([])
  }, [busy])

  const closeWriteReport = React.useCallback(() => {
    setWriteReport(null)
  }, [])

  const close = React.useCallback(() => {
    if (busy) return

    setOpen(false)
    setPasteValue('')
    setRows([])
  }, [busy])

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption || !hasTeamPlayers || hasInvalidRows) return

    const validRows = rows.filter(row => getRowStatus(row).valid)
    setBusy(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYER_STATS,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: seasonContext,
          team,
          players: validRows,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טעינת סטטיסטיקות הושלמה',
        message: `${validRows.length} שורות עודכנו`,
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
        flow: 'pasteTeamPlayerStats',
      }))

      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת סטטיסטיקות נכשלה',
        message: 'נפתח דוח כתיבה מפורט לבדיקה',
      })
    } finally {
      setBusy(false)
    }
  }, [
    getRowStatus,
    hasInvalidRows,
    hasTeamPlayers,
    leagueDoc,
    leagueId,
    notify,
    reload,
    rows,
    seasonContext,
    seasonStatus,
    selectedSeasonOption,
    team,
  ])

  return {
    open,
    pasteValue,
    rows,
    busy,
    writeReport,
    seasonStatus,
    rosterLookup,
    hasInvalidRows,
    setOpen,
    setPasteValue,
    clearPaste,
    changeSeasonStatus,
    parse,
    changeCell,
    getRowStatus,
    close,
    closeWriteReport,
    confirm,
  }
}
