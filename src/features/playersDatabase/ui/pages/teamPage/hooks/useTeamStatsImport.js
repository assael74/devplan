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
import { buildLeagueTeamPerformanceProjection } from '../../../../services/write/shared/teamPerformanceProjection.js'
import { validatePlayerStatsAgainstLeague } from '../../../../domain/validation/playerStatsLeague.validation.js'

const cleanProfileId = value => clean(value)

const withoutStatsMinutesCorrection = row => {
  const nextRow = { ...(row || {}) }
  delete nextRow.statsMinutesCorrection
  return nextRow
}

const getScoutProfileMap = row => {
  const profiles = Array.isArray(row?.scoutProfiles) ? row.scoutProfiles : []
  const hierarchyIds = Array.isArray(row?.scoutProfileHierarchy?.orderedProfileIds)
    ? row.scoutProfileHierarchy.orderedProfileIds
    : []
  const profileMap = new Map()

  profiles.forEach(profile => {
    const profileId = cleanProfileId(profile?.profileId || profile?.id)
    if (!profileId) return
    profileMap.set(profileId, clean(profile?.profileLabel || profile?.label || profileId))
  })
  hierarchyIds.forEach(profileId => {
    const cleanId = cleanProfileId(profileId)
    if (cleanId && !profileMap.has(cleanId)) profileMap.set(cleanId, cleanId)
  })

  return profileMap
}

const buildMinutesCorrectionImpact = ({ before, after, amount }) => {
  const beforeProfiles = getScoutProfileMap(before)
  const afterProfiles = getScoutProfileMap(after)
  const addedProfiles = [...afterProfiles.entries()]
    .filter(([profileId]) => !beforeProfiles.has(profileId))
    .map(([profileId, label]) => ({ profileId, label }))
  const removedProfiles = [...beforeProfiles.entries()]
    .filter(([profileId]) => !afterProfiles.has(profileId))
    .map(([profileId, label]) => ({ profileId, label }))

  return {
    amount,
    addedProfiles,
    removedProfiles,
  }
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
  const [seasonStatus, setSeasonStatus] = React.useState('')
  const transferredOutTraceRowRef = React.useRef('')

  const rosterLookup = React.useMemo(() => buildRosterLookup(players), [players])

  React.useEffect(() => {
    if (open) setSeasonStatus('')
  }, [
    open,
    selectedSeasonOption?.seasonId,
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

  const teamPerformance = React.useMemo(() => buildLeagueTeamPerformanceProjection({
    league: leagueDoc || {},
    season: seasonContext,
    target: selectedSeasonOption?.target || 'current',
    team,
  }), [leagueDoc, seasonContext, selectedSeasonOption?.target, team])

  const scoutTeam = React.useMemo(() => ({
    ...team,
    teamGamePlayed: teamPerformance?.teamGamePlayed,
    goalsFor: teamPerformance?.goalsFor,
    goalsAgainst: teamPerformance?.goalsAgainst,
    teamStats: {
      ...(team.teamStats || {}),
      teamGamePlayed: teamPerformance?.teamGamePlayed,
      goalsFor: teamPerformance?.goalsFor,
      goalsAgainst: teamPerformance?.goalsAgainst,
    },
  }), [team, teamPerformance])

  const enrichWithScout = React.useCallback(row => ({
    ...row,
    ...buildStatsScoutPreview({
      row,
      team: scoutTeam,
      season: seasonContext,
    }),
  }), [scoutTeam, seasonContext])

  const getIdentityRowStatus = React.useCallback(row => {
    const status = clean(row.rosterStatus || 'unresolved')
    const identityStatus = clean(row.identityStatus)
    const hasExplicitRosterStatus = STATS_ROSTER_STATUS_OPTIONS.some(option => (
      option.value === status
    ))

    if (!clean(row.fullName)) {
      return {
        valid: false,
        message: 'חסר שם שחקן',
      }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.AMBIGUOUS) {
      return {
        valid: false,
        message: row.identityMessage || 'נדרשת בדיקת זהות',
      }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.SYSTEM_CANDIDATE) {
      return {
        valid: false,
        message: 'נדרש אישור התאמה',
      }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.NEW_PLAYER) {
      if (hasExplicitRosterStatus) {
        return {
          valid: true,
          message: 'שחקן חדש סווג בסגל העונה',
        }
      }

      return {
        valid: false,
        message: 'בחר סטטוס בסגל',
      }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH && hasExplicitRosterStatus) {
      return {
        valid: true,
        message: status === 'regular'
          ? 'זוהה כשחקן סגל'
          : 'זוהה בסגל וסווג לעונת הנתונים',
      }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.SYSTEM_MATCH && hasExplicitRosterStatus) {
      return {
        valid: true,
        message: 'זוהה במערכת וסווג בסגל העונה',
      }
    }

    if (identityStatus === STATS_IDENTITY_STATUS.SYSTEM_MATCH) {
      return {
        valid: false,
        message: 'בחר סטטוס בסגל',
      }
    }

    return {
      valid: false,
      message: 'זהות השחקן לא נפתרה',
    }
  }, [])

  const validation = React.useMemo(() => validatePlayerStatsAgainstLeague({
    players: rows,
    teamPerformance,
    ageGroupId: seasonContext.ageGroupId || team.ageGroupId,
  }), [rows, seasonContext.ageGroupId, team.ageGroupId, teamPerformance])

  const getRowStatus = React.useCallback((row, rowIndex) => {
    const identityStatus = getIdentityRowStatus(row)
    if (!identityStatus.valid) return identityStatus

    const rowIssues = validation.rowIssues[rowIndex] || []
    return rowIssues.length
      ? { valid: false, message: rowIssues[0].message }
      : { valid: true, message: identityStatus.message }
  }, [getIdentityRowStatus, validation.rowIssues])

  React.useEffect(() => {
    const traceTarget = transferredOutTraceRowRef.current
    if (!traceTarget) return

    const rowIndex = rows.findIndex((row, index) => (
      traceTarget.rowId
        ? String(row.id) === traceTarget.rowId
        : index === traceTarget.rowIndex
    ))
    const row = rowIndex >= 0 ? rows[rowIndex] : null

    if (row) {
      console.debug('[stats-import/transferred-out-trace]', {
        rowIndex,
        identityStatus: row.identityStatus,
        identityResolution: row.identityResolution,
        rosterStatus: row.rosterStatus,
        getIdentityRowStatus: getIdentityRowStatus(row),
        getRowStatus: getRowStatus(row, rowIndex),
      })
    }

    transferredOutTraceRowRef.current = null
  }, [getIdentityRowStatus, getRowStatus, rows])

  const getCellStatus = React.useCallback((row, rowIndex, column) => {
    const key = column?.key || ''
    const identityStatus = getIdentityRowStatus(row)
    if (!identityStatus.valid && (key === 'fullName' || key === 'identityStatus')) {
      return { valid: false, message: identityStatus.message }
    }

    const issue = (validation.rowIssues[rowIndex] || []).find(item => item.field === key)
    return issue
      ? { valid: false, message: issue.message }
      : { valid: true, message: '' }
  }, [getIdentityRowStatus, validation.rowIssues])

  const hasInvalidRows = React.useMemo(() => (
    !validation.valid || rows.some((row, index) => !getRowStatus(row, index).valid)
  ), [getRowStatus, rows, validation.valid])
  const exceptionRowsCount = React.useMemo(() => (
    rows.filter(row => STATS_ROSTER_STATUS_OPTIONS.some(option => (
      option.value === clean(row.rosterStatus)
    ))).length
  ), [rows])

  const isTransferRosterStatus = React.useCallback(status => (
    status === 'transferredOut' ||
    status === 'transferredIn'
  ), [])

  const parse = React.useCallback(async () => {
    if (!seasonStatus) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: '׳ ׳“׳¨׳© ׳¡׳•׳’ ׳˜׳¢׳™׳ ׳”',
        message: '׳‘׳—׳¨ ׳׳ ׳–׳• ׳¢׳•׳ ׳” ׳₪׳¢׳™׳׳” ׳׳• ׳¢׳•׳ ׳” ׳׳׳׳” ׳׳₪׳ ׳™ ׳”׳¦׳’׳× ׳”׳ ׳×׳•׳ ׳™׳',
      })
      return
    }

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
  }, [enrichWithScout, notify, pasteValue, rosterLookup, seasonContext, seasonStatus])

  const changeCell = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      if (column.key === 'fullNameRosterMatch') {
        if (value === '__createNew') {
          return enrichWithScout({
            ...row,
            fullName: row.originalFullName || row.fullName || '',
            matchedPlayerId: '',
            matchedPlayerName: '',
            identityResolution: 'createNew',
            identityStatus: STATS_IDENTITY_STATUS.NEW_PLAYER,
            identityMessage: 'אושר במפורש כשחקן חדש',
          })
        }
        const matchedPlayer = findRosterPlayerByValue(players, value)

        if (!matchedPlayer) {
          return enrichWithScout({
            ...row,
            matchedPlayerId: '',
            matchedPlayerName: '',
            rosterStatus: 'unresolved',
            identityStatus: STATS_IDENTITY_STATUS.UNRESOLVED,
            identityResolution: '',
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
          identityResolution: '',
          identityMessage: 'נבחר ידנית מתוך הסגל',
        })
      }

      if (column.key === 'systemCandidateApproval') {
        const candidateKey = clean(value)
        const candidate = (Array.isArray(row.identityCandidates)
          ? row.identityCandidates
          : []).find(item => (
          clean(item.candidateKey || item.playerDocumentId || item.playerId) === candidateKey
        ))

        if (!candidate || !clean(candidate.playerId)) return row

        return enrichWithScout({
          ...row,
          playerDocumentId: candidate.playerDocumentId,
          approvedPlayerDocumentId: candidate.playerDocumentId,
          approvedIdentityCandidateId: candidate.playerId,
          approvedCanonicalPlayerId: candidate.playerId,
          identityResolution: 'useSystemCandidate',
          identityStatus: STATS_IDENTITY_STATUS.SYSTEM_MATCH,
          identityMessage: 'התאמה קיימת אושרה; בחר סטטוס בסגל',
        })
      }

      const rowWithoutMinutesCorrection = withoutStatsMinutesCorrection(row)
      const nextRow = {
        ...rowWithoutMinutesCorrection,
        [column.key]: value,
      }

      if (column.key === 'rosterStatus') {
        nextRow.rosterStatus = value || 'unresolved'
        nextRow.isYoungerAgeGroup = value === 'youngerAgeGroup'
        nextRow.manualTransferDirection = isTransferRosterStatus(value)
          ? clean(row.manualTransferDirection) || 'unknown'
          : ''

        if (row.identityStatus === STATS_IDENTITY_STATUS.NEW_PLAYER) {
          const hasExplicitRosterStatus = STATS_ROSTER_STATUS_OPTIONS.some(option => (
            option.value === nextRow.rosterStatus
          ))

          nextRow.identityResolution = hasExplicitRosterStatus
            ? 'createNew'
            : ''
          nextRow.identityMessage = hasExplicitRosterStatus
            ? 'שחקן חדש אושר לפי סטטוס הסגל'
            : 'בחר סטטוס בסגל'
        }

        if (value === 'transferredOut') {
          transferredOutTraceRowRef.current = {
            rowId: row.id ? String(row.id) : '',
            rowIndex,
          }
        }
      }

      return enrichWithScout(nextRow)
    }))
  }, [enrichWithScout, isTransferRosterStatus, players])

  const changeSeasonStatus = React.useCallback(value => {
    const nextStatus = ['active', 'completed'].includes(value) ? value : ''

    setSeasonStatus(nextStatus)
    setRows(currentRows => currentRows.map(row => {
      const rowWithoutMinutesCorrection = withoutStatsMinutesCorrection(row)

      return {
        ...rowWithoutMinutesCorrection,
        ...buildStatsScoutPreview({
          row: rowWithoutMinutesCorrection,
          team: scoutTeam,
          season: {
            ...seasonContext,
            seasonStatus: nextStatus || seasonContext.seasonStatus,
          },
        }),
      }
    }))
  }, [scoutTeam, seasonContext])

  const applyEqualMinutesReduction = React.useCallback(adjustment => {
    const amountPerPlayer = Number(adjustment?.amountPerPlayer)
    if (!Number.isInteger(amountPerPlayer) || amountPerPlayer <= 0) return

    setRows(currentRows => {
      if (!currentRows.length || currentRows.some(row => Number(row?.minutes) < amountPerPlayer)) {
        return currentRows
      }

      return currentRows.map(row => {
        const nextRow = enrichWithScout({
          ...row,
          minutes: Number(row.minutes) - amountPerPlayer,
        })

        return {
          ...nextRow,
          statsMinutesCorrection: buildMinutesCorrectionImpact({
            before: row,
            after: nextRow,
            amount: amountPerPlayer,
          }),
        }
      })
    })
  }, [enrichWithScout])


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
    if (!selectedSeasonOption || !hasTeamPlayers || hasInvalidRows || !seasonStatus) return

    const validRows = rows
      .filter((row, index) => getRowStatus(row, index).valid)
      .map(withoutStatsMinutesCorrection)
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
    getCellStatus,
    validation,
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
    exceptionRowsCount,
    setOpen,
    setPasteValue,
    clearPaste,
    changeSeasonStatus,
    parse,
    changeCell,
    applyEqualMinutesReduction,
    getRowStatus,
    getCellStatus,
    validation,
    close,
    closeWriteReport,
    confirm,
  }
}
