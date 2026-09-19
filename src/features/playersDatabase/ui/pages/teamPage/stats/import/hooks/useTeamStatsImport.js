// src/features/playersDatabase/ui/pages/teamPage/stats/import/hooks/useTeamStatsImport.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  resolvePlayerIdentities,
  runPlayersDatabaseWriteAction,
} from '../../../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { STATS_ROSTER_STATUS_OPTIONS } from '../../shared/stats.constants.js'
import { clean } from '../../../logic/teamPage.utils.js'
import { parsePlayerStatsRows } from '../logic/teamStatsImport.logic.js'
import {
  STATS_IDENTITY_STATUS,
  applyResolvedStatsIdentity,
  buildRosterLookup,
  enrichStatsRowForPreview,
} from '../../shared/logic/teamStatsMatch.logic.js'
import { updateStatsImportRow } from '../logic/teamStatsRowEdit.logic.js'
import { buildStatsScoutPreview } from '../logic/teamStatsScout.logic.js'
import { buildWriteReportFromError } from '../../../logic/writeFlowReport.logic.js'
import {
  buildLeagueTeamPerformanceProjection,
  listExistingTeamRootOptions,
} from '../../../../../../services/read/index.js'
import { validatePlayerStatsAgainstLeague } from '../../../../../../domain/validation/playerStatsLeague.validation.js'
import { findTeamPageSeasonDoc } from '../../../../../../model/team/page/teamPageSeason.model.js'
import { adaptTeamPagePlayerRow } from '../../../../../../model/team/page/teamPagePlayer.model.js'

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
  leagueDocuments = [],
  team,
  teamDoc,
  teamSeasons,
  seasonOptions = [],
  selectedSeasonOption: pageSelectedSeasonOption = null,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedSeasonOptionKey, setSelectedSeasonOptionKey] = React.useState('')
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)
  const [seasonStatus, setSeasonStatus] = React.useState('')
  const [teamRootOptions, setTeamRootOptions] = React.useState([])

  const selectedSeasonOption = React.useMemo(() => (
    seasonOptions.find(option => option.optionKey === selectedSeasonOptionKey) || null
  ), [seasonOptions, selectedSeasonOptionKey])
  const actionLeagueId = selectedSeasonOption?.leagueId || leagueId
  const actionLeagueDoc = React.useMemo(() => (
    leagueDocuments.find(document => (
      String(document?.id || document?.leagueId || '').trim() === String(actionLeagueId || '').trim()
    )) || leagueDoc
  ), [actionLeagueId, leagueDoc, leagueDocuments])

  const selectedTeamSeason = React.useMemo(() => findTeamPageSeasonDoc({
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
  }), [selectedSeasonOption, teamDoc, teamSeasons])
  const players = React.useMemo(() => (
    Array.isArray(selectedTeamSeason?.teamPlayers)
      ? selectedTeamSeason.teamPlayers.map((player, index) => adaptTeamPagePlayerRow({
        player,
        index,
        selectedSeasonOption,
        teamSeason: selectedTeamSeason,
      }))
      : []
  ), [selectedSeasonOption, selectedTeamSeason])
  const hasTeamPlayers = players.length > 0
  const rosterLookup = React.useMemo(() => buildRosterLookup(players), [players])

  React.useEffect(() => {
    if (open) {
      setSeasonStatus('')
      setRows([])
      setPasteValue('')
    }
  }, [
    open,
  ])

  const selectSeasonOption = React.useCallback(optionKey => {
    setSelectedSeasonOptionKey(optionKey)
    setRows([])
    setPasteValue('')
    setSeasonStatus('')
  }, [])

  const openModal = React.useCallback(() => {
    const pageSeasonOptionKey = String(pageSelectedSeasonOption?.optionKey || '').trim()
    const pageSeasonIsAvailable = seasonOptions.some(option => (
      option.optionKey === pageSeasonOptionKey
    ))
    setSelectedSeasonOptionKey(pageSeasonIsAvailable ? pageSeasonOptionKey : '')
    setOpen(true)
  }, [pageSelectedSeasonOption?.optionKey, seasonOptions])

  const seasonContext = React.useMemo(() => ({
    ...(selectedSeasonOption?.season || {}),
    seasonStatus,
    leagueId: actionLeagueId,
    ageGroupId: team.ageGroupId,
    birthYear: team.birthYear,
    seasonId: selectedSeasonOption?.seasonId,
    seasonKey: selectedSeasonOption?.seasonKey,
  }), [
    actionLeagueId,
    seasonStatus,
    selectedSeasonOption,
    team.ageGroupId,
    team.birthYear,
  ])

  const teamPerformance = React.useMemo(() => buildLeagueTeamPerformanceProjection({
    league: actionLeagueDoc || {},
    season: seasonContext,
    target: selectedSeasonOption?.target || 'current',
    team,
  }), [actionLeagueDoc, seasonContext, selectedSeasonOption?.target, team])

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
    const identityMatchStatus = clean(row.identityMatchStatus)
    const hasCanonicalIdentityDecision = (
      ['provided', 'matched'].includes(identityMatchStatus) ||
      (identityMatchStatus === 'created' && clean(row.identityResolution) === 'createNew')
    )
    const hasExplicitRosterStatus = ['regular', 'left', 'youngerAgeGroup'].includes(status)

    if (!clean(row.fullName)) {
      return {
        valid: false,
        message: 'חסר שם שחקן',
      }
    }

    if (row.requiresStatsMovementDecision) {
      return {
        valid: false,
        message: 'יש לסווג את השתתפות השחקן בעונה',
      }
    }

    if (
      identityStatus !== STATS_IDENTITY_STATUS.ROSTER_MATCH &&
      !hasCanonicalIdentityDecision
    ) {
      return {
        valid: false,
        message: 'נדרש אישור התאמת זהות או יצירת שחקן חדש',
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

  const rosterExceptionsSummary = React.useMemo(() => {
    const exceptionRowsCount = rows.filter(row => (
      STATS_ROSTER_STATUS_OPTIONS.some(option => (
        option.value === clean(row.rosterStatus) &&
        option.value !== 'regular'
      ))
    )).length

    return {
      exceptionRowsCount,
    }
  }, [rows])
  const movementPreview = React.useMemo(() => {
    const existingIncomingCount = rows.filter(row => (
      row.identityStatus === STATS_IDENTITY_STATUS.SYSTEM_MATCH
    )).length
    const newPlayerCount = rows.filter(row => (
      row.identityStatus === STATS_IDENTITY_STATUS.NEW_PLAYER
    )).length
    const decisionRequiredCount = rows.filter(row => (
      row.requiresStatsMovementDecision || [
        STATS_IDENTITY_STATUS.SYSTEM_CANDIDATE,
        STATS_IDENTITY_STATUS.AMBIGUOUS,
        STATS_IDENTITY_STATUS.UNRESOLVED,
      ].includes(row.identityStatus)
    )).length
    const leftCount = rows.filter(row => (
      clean(row.statsMovementDecision) === 'left' ||
      clean(row.rosterStatus) === 'left'
    )).length
    const joinedCount = rows.filter(row => (
      clean(row.statsMovementDecision) === 'joined'
    )).length
    const youngerAgeGroupCount = rows.filter(row => (
      clean(row.rosterStatus) === 'youngerAgeGroup'
    )).length

    return {
      existingIncomingCount,
      newPlayerCount,
      decisionRequiredCount,
      leftCount,
      joinedCount,
      youngerAgeGroupCount,
      requiresDecision: decisionRequiredCount > 0,
    }
  }, [rows])

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
      const unresolvedEntries = previewRows
        .map((row, index) => ({ row, index }))
        .filter(entry => entry.row.identityStatus !== STATS_IDENTITY_STATUS.ROSTER_MATCH)
      const resolvedRows = unresolvedEntries.length
        ? await resolvePlayerIdentities({
            players: unresolvedEntries.map(entry => entry.row),
            season: seasonContext,
          })
        : []
      const resolvedByIndex = new Map(
        unresolvedEntries.map((entry, index) => [entry.index, resolvedRows[index]])
      )
      const nextRows = previewRows.map((row, index) => {
        const resolved = row.identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH
          ? row
          : applyResolvedStatsIdentity({
                row,
                resolvedPlayer: resolvedByIndex.get(index),
              })
        return enrichWithScout({
          ...resolved,
          requiresStatsMovementDecision: seasonStatus === 'completed' &&
            row.identityStatus !== STATS_IDENTITY_STATUS.ROSTER_MATCH,
        })
      })

      if (seasonStatus === 'completed' && nextRows.some(row => row.requiresStatsMovementDecision)) {
        const currentTeamId = clean(team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId)
        setTeamRootOptions((await listExistingTeamRootOptions({
          seasonKey: seasonContext.seasonKey,
          ageGroupId: team.ageGroupId,
          birthYear: team.birthYear,
          excludedBirthTeamDocumentId: currentTeamId,
        })))
      }

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
  }, [enrichWithScout, notify, pasteValue, rosterLookup, seasonContext, seasonStatus, team])

  const changeCell = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      const nextRow = updateStatsImportRow({
        row,
        columnKey: column.key,
        value,
        players,
      })

      return nextRow === row
        ? row
        : enrichWithScout(nextRow)
    }))
  }, [enrichWithScout, players])

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

  // Keep the dry-run output and the real write on exactly the same payload
  // contract. This makes identity-decision issues inspectable without any
  // Firestore write.
  const buildStatsWritePayload = React.useCallback(playersForWrite => ({
    target: selectedSeasonOption?.target,
    league: {
      ...(actionLeagueDoc || {}),
      id: actionLeagueId,
      leagueId: actionLeagueId,
    },
    season: seasonContext,
    team,
    players: playersForWrite,
  }), [actionLeagueDoc, actionLeagueId, seasonContext, selectedSeasonOption?.target, team])

  const confirm = React.useCallback(async () => {
    if (
      !selectedSeasonOption ||
      !hasTeamPlayers ||
      hasInvalidRows ||
      movementPreview.requiresDecision ||
      !seasonStatus
    ) return

    const validRows = rows
      .filter((row, index) => getRowStatus(row, index).valid)
      .map(withoutStatsMinutesCorrection)
    const payload = buildStatsWritePayload(validRows)
    setBusy(true)

    try {
      console.groupCollapsed('[playersDatabase/stats-import] payload לפני אישור טעינה')
      console.info('זהו ה-payload הקנוני שנשלח ל-write flow.', payload)
      console.info('[playersDatabase/stats-import] PAYLOAD_JSON\n%s', JSON.stringify(payload, null, 2))
      console.table(payload.players.map(player => ({
        player: player.originalFullName || player.fullName || '',
        playerId: player.playerId || '',
        rosterStatus: player.rosterStatus || '',
        identityMatchStatus: player.identityMatchStatus || '',
        identityResolution: player.identityResolution || '',
        movement: player.statsMovementDecision || '',
      })))
      console.groupEnd()
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYER_STATS,
        payload,
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
      // The canonical Team Season can be committed before a derived document
      // fails to synchronize. Refresh it before showing the recovery report
      // so the user never works against a stale pre-write screen.
      if (error?.results?.teamCanonicalCommitted) reload()
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
    buildStatsWritePayload,
    hasInvalidRows,
    movementPreview.requiresDecision,
    hasTeamPlayers,
    actionLeagueDoc,
    actionLeagueId,
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
    seasonOptions,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    pasteValue,
    rows,
    busy,
    writeReport,
    seasonStatus,
    players,
    hasTeamPlayers,
    rosterLookup,
    hasInvalidRows,
    movementPreview,
    teamRootOptions,
    rosterExceptionsSummary,
    openModal,
    selectSeasonOption,
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
