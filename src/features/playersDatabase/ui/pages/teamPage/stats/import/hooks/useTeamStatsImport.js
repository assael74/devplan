// src/features/playersDatabase/ui/pages/teamPage/stats/import/hooks/useTeamStatsImport.js

import * as React from 'react'

import { prepareStatsLoad } from '../../../../../../services/write/stats/index.js'
import { resolveCanonicalTeamPlayerIdentities } from '../../../../../../services/read/identity/canonicalPlayerIdentityPreview.read.js'
import { SNACK_STATUS } from '../../../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { clean } from '../../../logic/teamPage.utils.js'
import {
  buildApprovedStatsImportPlayer,
  parsePlayerStatsRows,
} from '../logic/teamStatsImport.logic.js'
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
  resolveStatsPreviewLeagueLevel,
  snapshotStatsPreviewProfiles,
} from '../logic/teamStatsPreview.model.js'
import { findTeamPageSeasonDoc } from '../../../../../../model/team/page/teamPageSeason.model.js'
import { buildTeamPagePlayerRows } from '../../../../../../model/team/page/teamPagePlayer.model.js'
import useStatsLoadExecution from './useStatsLoadExecution.js'
import { resolvePlayersDatabaseLeagueGameTime } from '../../../../../../catalog/leagues.catalog.js'
import { validatePlayerStatsAgainstLeague } from '../../../../../../domain/validation/playerStatsLeague.validation.js'

const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

const resolveTeamId = team => clean(
  team?.teamId ||
  team?.birthTeamDocumentId ||
  team?.teamDocumentId ||
  team?.birthTeamId ||
  team?.id
)

const buildTeamSeasonPlayers = ({ selectedTeamSeason, selectedSeasonOption }) => {
  return buildTeamPagePlayerRows({
    teamSeason: selectedTeamSeason,
    selectedSeasonOption,
  })
}

const buildReloadDecisionState = ({ selectedTeamSeason, incomingPlayers, reloadDecisions }) => {
  const incomingIds = new Set(
    (Array.isArray(incomingPlayers) ? incomingPlayers : [])
      .map(player => clean(player.playerId))
      .filter(Boolean)
  )
  const roster = object(selectedTeamSeason?.roster?.playersById)
  const newStats = object(selectedTeamSeason?.stats?.playersById)
  const missingPlayers = Object.entries(newStats)
    .filter(([playerId, value]) => clean(value?.statsStatus) === 'loaded' && !incomingIds.has(playerId))
    .map(([playerId]) => ({ playerKey: playerId, player: roster[playerId] || { playerId } }))

  if (!missingPlayers.length && Array.isArray(selectedTeamSeason?.teamPlayers)) {
    selectedTeamSeason.teamPlayers.forEach(player => {
      const playerId = clean(player?.playerId)
      if (!playerId || incomingIds.has(playerId) || clean(player?.statsStatus) !== 'loaded') return
      missingPlayers.push({ playerKey: playerId, player })
    })
  }

  const unresolved = missingPlayers.filter(entry => !['preserveStats', 'removeStats'].includes(
    clean(reloadDecisions?.[entry.playerKey])
  ))
  return { missingPlayers, unresolved, isComplete: unresolved.length === 0 }
}

const getStatsPlanErrorMessage = error => {
  const messagesByCode = {
    STATS_LEAGUE_SEASON_NOT_FOUND: 'לא נמצאה עונת ליגה קנונית לטעינת הסטטיסטיקה.',
    STATS_LEAGUE_TEAM_NOT_FOUND: 'לא נמצאה הקבוצה במסמך הליגה הקנוני.',
    STATS_LEAGUE_CONTEXT_INCOMPLETE: 'נתוני הביצוע הקבוצתיים בליגה אינם מלאים.',
    STATS_GAMES_EXCEED_LEAGUE: 'מספר משחקי שחקן עולה על מספר משחקי הקבוצה בליגה.',
    STATS_APPEARANCE_CAPACITY_EXCEEDED: 'נתוני ההופעות של אחד השחקנים אינם עקביים.',
    STATS_MINUTES_EXCEED_LEAGUE: 'כמות הדקות עולה על קיבולת הדקות של הקבוצה בליגה.',
    STATS_GOALS_EXCEED_LEAGUE: 'כמות השערים עולה על מספר שערי הקבוצה בליגה.',
    STATS_INPUT_INVALID: 'אחד מנתוני הסטטיסטיקה אינו תקין.',
  }
  return messagesByCode[error?.code] || 'הכנת תוכנית הטעינה נכשלה. אפשר לנסות שוב ללא שינוי הנתונים.'
}

const appendPlanError = ({ validation, approvedStatsPlanError }) => {
  if (!approvedStatsPlanError) return validation
  const issue = {
    blocking: true,
    code: approvedStatsPlanError.code || 'stats_prepare_failed',
    message: getStatsPlanErrorMessage(approvedStatsPlanError),
  }
  return {
    ...validation,
    valid: false,
    issues: [...validation.issues, issue],
    groupIssues: [...validation.groupIssues, issue],
  }
}

export default function useTeamStatsImport({
  leagueId,
  team,
  teamDoc,
  teamSeasons,
  seasonOptions = [],
  selectedSeasonOption: pageSelectedSeasonOption = null,
  notify,
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedSeasonOptionKey, setSelectedSeasonOptionKey] = React.useState('')
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [reloadDecisions, setReloadDecisions] = React.useState({})
  const [approvedStatsPlan, setApprovedStatsPlan] = React.useState(null)
  const [approvedStatsPlanPreparing, setApprovedStatsPlanPreparing] = React.useState(false)
  const [approvedStatsPlanError, setApprovedStatsPlanError] = React.useState(null)
  const [approvedStatsPlanSourceKey, setApprovedStatsPlanSourceKey] = React.useState('')
  const [approvedActionInput, setApprovedActionInput] = React.useState(null)
  const [approvedForSync, setApprovedForSync] = React.useState(null)
  const [approvedStatsPlanRetryNonce, setApprovedStatsPlanRetryNonce] = React.useState(0)
  const generationRef = React.useRef(0)

  const selectedSeasonOption = React.useMemo(() => (
    seasonOptions.find(option => option.optionKey === selectedSeasonOptionKey) || null
  ), [seasonOptions, selectedSeasonOptionKey])
  const actionLeagueId = clean(selectedSeasonOption?.leagueId || leagueId)
  const teamId = React.useMemo(() => resolveTeamId(team), [team])
  const selectedTeamSeason = React.useMemo(() => findTeamPageSeasonDoc({
    teamDoc,
    teamSeasons,
    selectedSeasonOption,
  }), [selectedSeasonOption, teamDoc, teamSeasons])
  const players = React.useMemo(() => buildTeamSeasonPlayers({
    selectedTeamSeason,
    selectedSeasonOption,
  }), [selectedSeasonOption, selectedTeamSeason])
  const hasTeamPlayers = players.length > 0
  const rosterLookup = React.useMemo(() => buildRosterLookup(players), [players])
  const seasonStatus = clean(selectedSeasonOption?.season?.seasonStatus || selectedTeamSeason?.identity?.seasonStatus)
  const previewCalculationContext = React.useMemo(() => {
    const officialTable = object(selectedTeamSeason?.competitionSnapshot?.officialTable)
    const teamGamePlayed = Number(officialTable.teamGamePlayed)
    const ageGroupId = clean(
      selectedTeamSeason?.identity?.ageGroupId || selectedSeasonOption?.ageGroupId
    )
    const gameDurationMinutes = resolvePlayersDatabaseLeagueGameTime(ageGroupId)

    if (!Number.isFinite(teamGamePlayed) || teamGamePlayed <= 0) return null

    return {
      teamSeason: selectedTeamSeason,
      leagueLevel: resolveStatsPreviewLeagueLevel({ team, selectedSeasonOption }),
      leagueTotalRound: Number(selectedSeasonOption?.season?.leagueTotalRound || 0) || null,
      leagueContext: {
        teamGamePlayed,
        gameDurationMinutes,
        teamMinutes: teamGamePlayed * gameDurationMinutes,
        goalsFor: Number(officialTable.goalsFor || 0),
        goalsAgainst: Number(officialTable.goalsAgainst || 0),
        tableRank: Number(officialTable.rank || 0) || null,
        seasonStatus,
        team: {
          officialTable,
          performance: team?.performance || team?.domain?.performance || {},
          offense: team?.offense || team?.domain?.performance?.offense || {},
          defense: team?.defense || team?.domain?.performance?.defense || {},
        },
      },
    }
  }, [seasonStatus, selectedSeasonOption, selectedTeamSeason, team])
  const ageGroupId = clean(
    selectedTeamSeason?.identity?.ageGroupId || selectedSeasonOption?.ageGroupId
  )
  const leagueValidation = React.useMemo(() => {
    if (!rows.length) {
      return { valid: true, issues: [], rowIssues: {}, groupIssues: [], checks: [], context: null }
    }
    return validatePlayerStatsAgainstLeague({
      players: rows,
      teamPerformance: previewCalculationContext?.leagueContext,
      ageGroupId,
    })
  }, [ageGroupId, previewCalculationContext, rows])

  React.useEffect(() => {
    if (!open) return
    setRows([])
    setPasteValue('')
    setReloadDecisions({})
    setApprovedStatsPlan(null)
    setApprovedStatsPlanError(null)
    setApprovedStatsPlanSourceKey('')
    setApprovedActionInput(null)
    setApprovedForSync(null)
  }, [open])

  const selectSeasonOption = React.useCallback(optionKey => {
    setSelectedSeasonOptionKey(optionKey)
    setRows([])
    setPasteValue('')
    setReloadDecisions({})
    setApprovedStatsPlan(null)
    setApprovedStatsPlanError(null)
    setApprovedStatsPlanSourceKey('')
    setApprovedActionInput(null)
  }, [])

  const openModal = React.useCallback(() => {
    const defaultOption = seasonOptions.find(option => option.optionKey === pageSelectedSeasonOption?.optionKey) || seasonOptions[0] || null
    if (defaultOption) selectSeasonOption(defaultOption.optionKey)
    setOpen(true)
  }, [pageSelectedSeasonOption?.optionKey, seasonOptions, selectSeasonOption])

  const getIdentityRowStatus = React.useCallback(row => {
    if (!clean(row.fullName)) return { valid: false, message: 'חסר שם שחקן' }
    if (clean(row.identityStatus) === STATS_IDENTITY_STATUS.ROSTER_MATCH && clean(row.playerId)) {
      return { valid: true, message: 'זוהה בסגל הקנוני' }
    }
    const movementDecision = clean(row.statsMovementDecision || row.rosterStatus)
    const hasCanonicalExternalId = Boolean(clean(row.externalPlayerId))
    const supportedMovement = ['joined', 'left', 'youngerAgeGroup'].includes(movementDecision)
    const hasMovementTeam = movementDecision === 'youngerAgeGroup' || Boolean(
      clean(row.statsMovementTeam?.birthTeamDocumentId || row.statsMovementTeam?.teamId)
    )
    const movementReady = supportedMovement && hasCanonicalExternalId && hasMovementTeam
    if (movementReady) {
      return { valid: true, message: 'השתתפות השחקן אושרה לפי החלטת הסגל' }
    }
    const blockers = []
    if (!hasCanonicalExternalId) blockers.push('חסר מזהה שחקן חיצוני תקין')
    if (!supportedMovement) blockers.push('יש לבחור אם השחקן הצטרף, עזב או שייך לשנתון צעיר')
    if (supportedMovement && !hasMovementTeam) blockers.push('יש לבחור את קבוצת המקור או היעד')
    return {
      valid: false,
      message: `${blockers.join('. ')}.`,
    }
  }, [])

  const getRowStatus = React.useCallback((row, rowIndex) => {
    const identityStatus = getIdentityRowStatus(row)
    if (!identityStatus.valid) return identityStatus
    const issues = leagueValidation.rowIssues[rowIndex] || []
    if (issues.length) {
      return { valid: false, message: issues.map(issue => issue.message).join(' ') }
    }
    return identityStatus
  }, [getIdentityRowStatus, leagueValidation.rowIssues])
  const getCellStatus = React.useCallback((row, rowIndex, column) => {
    const status = getIdentityRowStatus(row)
    if (!status.valid && ['fullName', 'identityStatus'].includes(column?.key)) return status
    const issue = (leagueValidation.rowIssues[rowIndex] || []).find(
      rowIssue => rowIssue.field === column?.key
    )
    if (issue) return { valid: false, message: issue.message }
    return { valid: true, message: '' }
  }, [getIdentityRowStatus, leagueValidation.rowIssues])

  const hasInvalidRows = React.useMemo(() => rows.some((row, rowIndex) => (
    !getIdentityRowStatus(row).valid || (leagueValidation.rowIssues[rowIndex] || []).length > 0
  )), [getIdentityRowStatus, leagueValidation.rowIssues, rows])
  const rosterExceptionsSummary = React.useMemo(() => ({
    exceptionRowsCount: rows.filter(row => clean(row.rosterStatus) !== 'regular').length,
  }), [rows])
  const movementPreview = React.useMemo(() => buildStatsMovementPreviewModel({ rows }), [rows])
  const approvedPlanPlayers = React.useMemo(() => rows
    .filter(row => getIdentityRowStatus(row).valid)
    .map(buildApprovedStatsImportPlayer), [getIdentityRowStatus, rows])
  const reloadDecisionState = React.useMemo(() => buildReloadDecisionState({
    selectedTeamSeason,
    incomingPlayers: approvedPlanPlayers,
    reloadDecisions,
  }), [approvedPlanPlayers, reloadDecisions, selectedTeamSeason])

  const approvedPlanSourceKey = React.useMemo(() => JSON.stringify({
    leagueId: actionLeagueId,
    teamId,
    seasonId: clean(selectedSeasonOption?.seasonId),
    players: approvedPlanPlayers,
    reloadDecisions,
  }), [actionLeagueId, approvedPlanPlayers, reloadDecisions, selectedSeasonOption?.seasonId, teamId])

  const buildStatsActionInput = React.useCallback(() => ({
    leagueId: actionLeagueId,
    teamId,
    seasonId: clean(selectedSeasonOption?.seasonId),
    incomingPlayers: approvedPlanPlayers,
    reloadDecisions: { ...reloadDecisions },
    updatedAt: new Date().toISOString(),
  }), [actionLeagueId, approvedPlanPlayers, reloadDecisions, selectedSeasonOption?.seasonId, teamId])

  React.useEffect(() => {
    const generation = generationRef.current + 1
    generationRef.current = generation
    setApprovedStatsPlan(null)
    setApprovedStatsPlanError(null)
    setApprovedStatsPlanSourceKey('')
    setApprovedActionInput(null)

    const seasonId = clean(selectedSeasonOption?.seasonId)
    const canPrepare = Boolean(
      actionLeagueId && teamId && seasonId && hasTeamPlayers && rows.length &&
      !hasInvalidRows && leagueValidation.valid && reloadDecisionState.isComplete
    )
    if (!canPrepare) {
      setApprovedStatsPlanPreparing(false)
      return undefined
    }

    setApprovedStatsPlanPreparing(true)
    const timeoutId = window.setTimeout(async () => {
      const actionInput = buildStatsActionInput()
      try {
        const plan = await prepareStatsLoad({ input: actionInput })
        if (generationRef.current !== generation) return
        setApprovedStatsPlan(plan)
        setApprovedActionInput(actionInput)
        setApprovedStatsPlanSourceKey(approvedPlanSourceKey)
      } catch (error) {
        if (generationRef.current !== generation) return
        setApprovedStatsPlanError(error)
      } finally {
        if (generationRef.current === generation) setApprovedStatsPlanPreparing(false)
      }
    }, 200)

    return () => window.clearTimeout(timeoutId)
  }, [
    actionLeagueId,
    approvedPlanPlayers,
    approvedPlanSourceKey,
    approvedStatsPlanRetryNonce,
    buildStatsActionInput,
    hasInvalidRows,
    hasTeamPlayers,
    leagueValidation.valid,
    reloadDecisionState.isComplete,
    reloadDecisions,
    rows.length,
    selectedSeasonOption?.seasonId,
    teamId,
  ])

  const prepareFreshApprovedState = React.useCallback(async () => {
    const actionInput = buildStatsActionInput()
    const plan = await prepareStatsLoad({ input: actionInput })
    setApprovedStatsPlan(plan)
    setApprovedActionInput(actionInput)
    setApprovedStatsPlanSourceKey(approvedPlanSourceKey)
    return plan
  }, [approvedPlanSourceKey, buildStatsActionInput])

  const finalSync = useStatsLoadExecution({
    approvedState: approvedForSync?.plan || null,
    actionInput: approvedForSync?.input || null,
    display: {
      teamName: clean(team?.name || team?.displayName),
      leagueName: clean(selectedSeasonOption?.leagueName),
    },
    teamSeasons,
    prepareFreshApprovedState,
  })

  const parse = React.useCallback(async () => {
    if (!clean(selectedSeasonOption?.seasonId)) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'חסר מזהה עונה',
        message: 'Stats Load דורש seasonId טכני קנוני.',
      })
      return
    }
    setBusy(true)
    try {
      const previewRows = parsePlayerStatsRows(pasteValue).map(row => enrichStatsRowForPreview(row, rosterLookup))
      const unresolvedEntries = previewRows
        .map((row, index) => ({ row, index }))
        .filter(entry => entry.row.identityStatus !== STATS_IDENTITY_STATUS.ROSTER_MATCH)
      const resolvedRows = unresolvedEntries.length
        ? await resolveCanonicalTeamPlayerIdentities({
            players: unresolvedEntries.map(entry => entry.row),
            season: {
              seasonId: selectedSeasonOption.seasonId,
              seasonKey: selectedSeasonOption.seasonKey,
            },
          })
        : []
      const resolvedByIndex = new Map(unresolvedEntries.map((entry, index) => [entry.index, resolvedRows[index]]))
      setRows(previewRows.map((row, index) => (
        row.identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH
          ? row
          : applyResolvedStatsIdentity({ row, resolvedPlayer: resolvedByIndex.get(index) })
      )))
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'בדיקת זהויות נכשלה',
        message: error?.message || 'לא ניתן להכין את טעינת הסטטיסטיקה.',
      })
    } finally {
      setBusy(false)
    }
  }, [notify, pasteValue, rosterLookup, selectedSeasonOption])

  const changeCell = React.useCallback(({ rowIndex, column, value }) => {
    setRows(currentRows => currentRows.map((row, index) => (
      index === rowIndex
        ? updateStatsImportRow({ row, columnKey: column.key, value, players })
        : row
    )))
  }, [players])

  const validation = React.useMemo(() => appendPlanError({
    validation: leagueValidation,
    approvedStatsPlanError,
  }), [approvedStatsPlanError, leagueValidation])
  const previewRows = React.useMemo(() => buildStatsPreviewModel({
    rows,
    approvedStatsPlan,
    seasonMinutes:
      approvedStatsPlan?.validation?.leagueContext?.teamMinutes ||
      previewCalculationContext?.leagueContext?.teamMinutes,
    previewContext: previewCalculationContext,
  }), [approvedStatsPlan, previewCalculationContext, rows])

  const applyEqualMinutesReduction = React.useCallback(adjustment => {
    const amount = Number(adjustment?.amountPerPlayer)
    if (!Number.isInteger(amount) || amount <= 0) return
    setRows(currentRows => currentRows.map((row, index) => ({
      ...row,
      minutes: Math.max(0, Number(row.minutes) - amount),
      statsMinutesCorrection: {
        amount,
        beforeProfiles: snapshotStatsPreviewProfiles(previewRows[index] || row),
      },
    })))
  }, [previewRows])

  const clearPaste = React.useCallback(() => {
    if (busy) return
    setPasteValue('')
    setRows([])
    setReloadDecisions({})
  }, [busy])

  const close = React.useCallback(() => {
    if (busy || finalSync.running) return
    if (approvedForSync && !finalSync.syncComplete) return
    setOpen(false)
    setPasteValue('')
    setRows([])
  }, [approvedForSync, busy, finalSync.running, finalSync.syncComplete])

  const confirm = React.useCallback(async () => {
    if (!approvedStatsPlan || !approvedActionInput || approvedStatsPlanPreparing || approvedStatsPlanSourceKey !== approvedPlanSourceKey) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'תוכנית הטעינה עדיין לא מוכנה',
        message: approvedStatsPlanError
          ? getStatsPlanErrorMessage(approvedStatsPlanError)
          : 'יש להשלים את כל ההחלטות לפני האישור.',
      })
      return null
    }
    setApprovedForSync({ plan: approvedStatsPlan, input: approvedActionInput })
    return approvedStatsPlan
  }, [approvedActionInput, approvedPlanSourceKey, approvedStatsPlan, approvedStatsPlanError, approvedStatsPlanPreparing, approvedStatsPlanSourceKey, notify])

  return {
    open,
    seasonOptions,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    pasteValue,
    rows: previewRows,
    busy,
    seasonStatus,
    players,
    hasTeamPlayers,
    rosterLookup,
    hasInvalidRows,
    movementPreview,
    teamRootOptions: [],
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
    changeSeasonStatus: () => {},
    parse,
    changeCell,
    applyEqualMinutesReduction,
    getRowStatus,
    getCellStatus,
    validation,
    close,
    confirm,
    rebuildApprovedStatsPlan: () => setApprovedStatsPlanRetryNonce(current => current + 1),
    setReloadDecision: (playerKey, decision) => setReloadDecisions(current => ({ ...current, [playerKey]: decision })),
  }
}
