// src/features/playersDatabase/ui/pages/teamPage/stats/import/hooks/useTeamStatsImport.js

import * as React from 'react'

import useStatsV2FinalSync from './useStatsV2FinalSync.js'

import { prepareStatsImportPlanV2 } from '../../../../../../services/writeV2/stats/index.js'
import { resolveTeamPlayerIdentities } from '../../../../../../services/read/identity/playerIdentityPreview.read.js'
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
import {
  buildStatsMovementPreviewModel,
  buildStatsPreviewModel,
  snapshotStatsPreviewProfiles,
} from '../logic/teamStatsPreview.model.js'
import { buildWriteReportFromError } from '../../../logic/writeFlowReport.logic.js'
import {
  buildLeagueTeamPerformanceProjection,
  listExistingTeamRootOptions,
} from '../../../../../../services/read/index.js'
import { validatePlayerStatsAgainstLeague } from '../../../../../../domain/validation/playerStatsLeague.validation.js'
import { resolveLeagueTeamPoints } from '../../../../../../domain/projections/teamPerformance.projection.js'
import { findTeamPageSeasonDoc } from '../../../../../../model/team/page/teamPageSeason.model.js'
import { adaptTeamPagePlayerRow } from '../../../../../../model/team/page/teamPagePlayer.model.js'

const withoutStatsMinutesCorrection = row => {
  const nextRow = { ...(row || {}) }
  delete nextRow.statsMinutesCorrection
  return nextRow
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
  const [reloadDecisions, setReloadDecisions] = React.useState({})
  const [reloadDecisionState, setReloadDecisionState] = React.useState(null)
  const [approvedStatsPlan, setApprovedStatsPlan] = React.useState(null)
  const [approvedStatsPlanPreparing, setApprovedStatsPlanPreparing] = React.useState(false)
  const [approvedStatsPlanError, setApprovedStatsPlanError] = React.useState(null)
  const [approvedStatsPlanSourceKey, setApprovedStatsPlanSourceKey] = React.useState('')
  const [approvedStatsPlanRetryNonce, setApprovedStatsPlanRetryNonce] = React.useState(0)
  const [approvedForSync, setApprovedForSync] = React.useState(null)
  const approvedStatsPlanGenerationRef = React.useRef(0)
  const confirmInFlightRef = React.useRef(false)

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
      setReloadDecisions({})
      setReloadDecisionState(null)
      setApprovedStatsPlan(null)
      setApprovedStatsPlanError(null)
      setApprovedStatsPlanSourceKey('')
      setApprovedForSync(null)
    }
  }, [
    open,
  ])

  const selectSeasonOption = React.useCallback(optionKey => {
    const option = seasonOptions.find(item => item.optionKey === optionKey) || null
    setSelectedSeasonOptionKey(optionKey)
    setRows([])
    setPasteValue('')
    setSeasonStatus(option?.target === 'history' ? 'completed' : 'active')
    setApprovedStatsPlan(null)
    setApprovedStatsPlanError(null)
    setApprovedStatsPlanSourceKey('')
  }, [seasonOptions])

  const openModal = React.useCallback(() => {
    const defaultOption = seasonOptions.find(option => option.optionKey === pageSelectedSeasonOption?.optionKey) || seasonOptions[0] || null
    if (defaultOption) selectSeasonOption(defaultOption.optionKey)
    setOpen(true)
  }, [pageSelectedSeasonOption?.optionKey, seasonOptions, selectSeasonOption])

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

  const teamPoints = React.useMemo(() => resolveLeagueTeamPoints({
    league: actionLeagueDoc || {},
    season: seasonContext,
    target: selectedSeasonOption?.target || 'current',
    team,
  }), [actionLeagueDoc, seasonContext, selectedSeasonOption?.target, team])



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
  const movementPreview = React.useMemo(() => buildStatsMovementPreviewModel({
    rows,
    approvedStatsPlan,
  }), [approvedStatsPlan, rows])


  const approvedPlanPlayers = React.useMemo(() => rows
    .filter((row, index) => getRowStatus(row, index).valid)
    .map(withoutStatsMinutesCorrection), [getRowStatus, rows])

  const approvedPlanSourceKey = React.useMemo(() => JSON.stringify({
    leagueId: actionLeagueId,
    season: seasonContext,
    teamId: clean(
      team.birthTeamDocumentId ||
      team.teamDocumentId ||
      team.birthTeamId ||
      team.teamId
    ),
    players: approvedPlanPlayers,
    teamPerformance,
    teamPoints,
  }), [
    actionLeagueId,
    approvedPlanPlayers,
    seasonContext,
    team.birthTeamDocumentId,
    team.birthTeamId,
    team.teamDocumentId,
    team.teamId,
    teamPerformance,
    teamPoints,
  ])

  React.useEffect(() => {
    const generation = approvedStatsPlanGenerationRef.current + 1
    approvedStatsPlanGenerationRef.current = generation
    setApprovedStatsPlan(null)
    setApprovedStatsPlanError(null)
    setApprovedStatsPlanSourceKey('')

    const canPreparePlan = Boolean(
      selectedSeasonOption &&
      hasTeamPlayers &&
      seasonStatus &&
      rows.length &&
      !hasInvalidRows &&
      !movementPreview.requiresDecision
    )

    if (!canPreparePlan) {
      setApprovedStatsPlanPreparing(false)
      return undefined
    }

    setApprovedStatsPlanPreparing(true)
    const timeoutId = window.setTimeout(async () => {
      try {
        const plan = await prepareStatsImportPlanV2({
          league: { ...(actionLeagueDoc || {}), id: actionLeagueId, leagueId: actionLeagueId },
          season: seasonContext,
          team: { ...team, birthTeamDocumentId: clean(team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId) },
          teamRoot: { ...(teamDoc || {}), id: clean(teamDoc?.id || team.birthTeamDocumentId || team.teamDocumentId || team.birthTeamId || team.teamId) },
          teamSeason: selectedTeamSeason,
          incomingPlayers: approvedPlanPlayers,
          reloadDecisions,
          movementState: null,
          performance: teamPerformance,
          points: teamPoints,
          approvedAt: 'preview',
        })
        setReloadDecisionState(null)

        if (approvedStatsPlanGenerationRef.current !== generation) return
        setApprovedStatsPlan(plan)
        setApprovedStatsPlanSourceKey(approvedPlanSourceKey)
      } catch (error) {
        if (approvedStatsPlanGenerationRef.current !== generation) return
        console.error('[playersDatabase/stats-plan-preview]', error)
        if (error?.reloadDecisionState) setReloadDecisionState(error.reloadDecisionState)
        setApprovedStatsPlanError(error)
      } finally {
        if (approvedStatsPlanGenerationRef.current === generation) {
          setApprovedStatsPlanPreparing(false)
        }
      }
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [
    actionLeagueDoc,
    actionLeagueId,
    approvedPlanPlayers,
    approvedPlanSourceKey,
    hasInvalidRows,
    hasTeamPlayers,
    movementPreview.requiresDecision,
    rows.length,
    seasonContext,
    seasonStatus,
    selectedSeasonOption,
    team,
    teamPerformance,
    teamPoints,
    approvedStatsPlanRetryNonce,
    reloadDecisions,
    selectedTeamSeason,
    teamDoc,
  ])

  const rebuildApprovedStatsPlan = React.useCallback(() => {
    if (approvedStatsPlanPreparing) return

    setApprovedStatsPlanRetryNonce(current => current + 1)
  }, [approvedStatsPlanPreparing])

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
        ? await resolveTeamPlayerIdentities({
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
        return {
          ...resolved,
          requiresStatsMovementDecision: seasonStatus === 'completed' &&
            row.identityStatus !== STATS_IDENTITY_STATUS.ROSTER_MATCH,
        }
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
  }, [notify, pasteValue, rosterLookup, seasonContext, seasonStatus, team])

  const changeCell = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      const nextRow = updateStatsImportRow({
        row,
        columnKey: column.key,
        value,
        players,
      })

      return nextRow
    }))
  }, [players])

  const changeSeasonStatus = React.useCallback(value => {
    const nextStatus = ['active', 'completed'].includes(value) ? value : ''

    setSeasonStatus(nextStatus)
    setRows(currentRows => currentRows.map(withoutStatsMinutesCorrection))
  }, [])

  const previewRows = React.useMemo(() => buildStatsPreviewModel({
    rows,
    approvedStatsPlan,
  }), [approvedStatsPlan, rows])

  const applyEqualMinutesReduction = React.useCallback(adjustment => {
    const amountPerPlayer = Number(adjustment?.amountPerPlayer)
    if (!Number.isInteger(amountPerPlayer) || amountPerPlayer <= 0) return

    setRows(currentRows => {
      if (!currentRows.length || currentRows.some(row => Number(row?.minutes) < amountPerPlayer)) {
        return currentRows
      }

      return currentRows.map((row, index) => ({
        ...row,
        minutes: Number(row.minutes) - amountPerPlayer,
        statsMinutesCorrection: {
          amount: amountPerPlayer,
          beforeProfiles: snapshotStatsPreviewProfiles(previewRows[index] || row),
        },
      }))
    })
  }, [previewRows])


  const clearPaste = React.useCallback(() => {
    if (busy) return

    setPasteValue('')
    setRows([])
    setReloadDecisions({})
    setReloadDecisionState(null)
  }, [busy])

  const closeWriteReport = React.useCallback(() => {
    setWriteReport(null)
  }, [])

  const finalSync = useStatsV2FinalSync({
    approvedState: approvedForSync,
    onCanonicalWritten: reload,
  })

  const close = React.useCallback(() => {
    if (busy) return
    if (approvedForSync) {
      const syncComplete = finalSync.stages.every(
        stage => finalSync.results?.[stage]?.status === 'completed'
      )
      if (!syncComplete) return
    }

    setOpen(false)
    setPasteValue('')
    setRows([])
  }, [approvedForSync, busy, finalSync.results, finalSync.stages])

  const confirm = React.useCallback(async () => {
    if (!approvedStatsPlan || approvedStatsPlanPreparing || approvedStatsPlanSourceKey !== approvedPlanSourceKey) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'תוכנית הטעינה עדיין לא מוכנה',
        message: approvedStatsPlanError?.message || 'יש להשלים את כל ההחלטות לפני האישור',
      })
      return null
    }
    const approvedState = {
      ...approvedStatsPlan,
      approvedAt: new Date().toISOString(),
    }
    setApprovedForSync(approvedState)
    return approvedState
  }, [approvedPlanSourceKey, approvedStatsPlan, approvedStatsPlanError?.message, approvedStatsPlanPreparing, approvedStatsPlanSourceKey, notify])

  const setReloadDecision = React.useCallback((playerKey, decision) => {
    setReloadDecisions(current => ({ ...current, [playerKey]: decision }))
  }, [])

  return {
    open,
    seasonOptions,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    pasteValue,
    rows: previewRows,
    busy,
    writeReport,
    seasonStatus,
    players,
    hasTeamPlayers,
    rosterLookup,
    hasInvalidRows,
    movementPreview,
    teamRootOptions,
    approvedStatsPlan,
    approvedStatsPlanPreparing,
    approvedStatsPlanError,
    approvedStatsPlanSourceKey,
    reloadDecisionState,
    approvedForSync,
    finalSync,
    reloadDecisions,
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
    rebuildApprovedStatsPlan,
    setReloadDecision,
  }
}
