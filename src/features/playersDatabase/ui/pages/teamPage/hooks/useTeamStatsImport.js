// features/playersDatabase/ui/pages/teamPage/hooks/useTeamStatsImport.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { STATS_ROSTER_STATUS_OPTIONS } from '../logic/teamPage.constants.js'
import { clean } from '../logic/teamPage.utils.js'
import { parsePlayerStatsRows } from '../logic/teamStatsImport.logic.js'
import {
  buildRosterLookup,
  enrichStatsRowForPreview,
  findRosterPlayerByValue,
  findStatsRosterMatch,
  normalizePlayerNameValue,
} from '../logic/teamStatsMatch.logic.js'
import { buildStatsScoutPreview } from '../logic/teamStatsScout.logic.js'

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

  const rosterLookup = React.useMemo(() => buildRosterLookup(players), [players])

  const enrichWithScout = React.useCallback(row => ({
    ...row,
    ...buildStatsScoutPreview({
      row,
      team,
      season: selectedSeasonOption?.season || {},
    }),
  }), [selectedSeasonOption?.season, team])

  const getRowStatus = React.useCallback(row => {
    const status = clean(row.rosterStatus || 'unresolved')
    const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
    const isException = STATS_ROSTER_STATUS_OPTIONS.some(option => (
      option.value === status
    ))

    if (!clean(row.fullName)) {
      return { valid: false, message: 'חסר שם שחקן' }
    }

    if (matchedPlayer && status === 'regular') {
      return { valid: true, message: 'השורה תקינה' }
    }

    if (isException) {
      return { valid: true, message: 'חריג סווג' }
    }

    return { valid: false, message: 'יש לבחור שחקן מהסגל או לסווג חריג' }
  }, [rosterLookup])

  const hasInvalidRows = React.useMemo(() => (
    rows.some(row => !getRowStatus(row).valid)
  ), [getRowStatus, rows])

  const parse = React.useCallback(() => {
    setRows(parsePlayerStatsRows(pasteValue)
      .map(row => enrichStatsRowForPreview(row, rosterLookup))
      .map(enrichWithScout))
  }, [enrichWithScout, pasteValue, rosterLookup])

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
          })
        }

        const pastedName = row.originalFullName || row.fullName || ''
        const matchedName = matchedPlayer.fullName || row.fullName || ''
        const aliases = normalizePlayerNameValue(pastedName) !== normalizePlayerNameValue(matchedName)
          ? Array.from(new Set([...(row.aliases || []), pastedName].filter(Boolean)))
          : row.aliases || []

        return enrichWithScout({
          ...row,
          fullName: matchedName,
          originalFullName: pastedName,
          aliases,
          matchedPlayerId: value,
          matchedPlayerName: matchedName,
          rosterStatus: 'regular',
          isNameAlias: aliases.length > 0,
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

  const close = React.useCallback(() => {
    if (busy) return
    setOpen(false)
  }, [busy])

  const confirm = React.useCallback(async () => {
    if (!selectedSeasonOption || !hasTeamPlayers) return

    setBusy(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYER_STATS,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId,
            ageGroupId: team.ageGroupId,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          team,
          players: rows.filter(row => getRowStatus(row).valid),
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טעינת סטטיסטיקות הושלמה',
        message: `${rows.length} שורות עודכנו`,
      })

      setOpen(false)
      setPasteValue('')
      setRows([])
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת סטטיסטיקות נכשלה',
        message: error?.message || 'שגיאה בעדכון נתוני השחקנים',
      })
    } finally {
      setBusy(false)
    }
  }, [
    getRowStatus,
    hasTeamPlayers,
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
    rosterLookup,
    hasInvalidRows,
    setOpen,
    setPasteValue,
    parse,
    changeCell,
    getRowStatus,
    close,
    confirm,
  }
}
