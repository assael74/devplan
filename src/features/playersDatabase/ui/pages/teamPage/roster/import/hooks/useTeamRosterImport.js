// features/playersDatabase/ui/pages/teamPage/roster/import/hooks/useTeamRosterImport.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../../../services/write/index.js'
import { resolveTeamPlayerIdentityPreview } from '../../../../../../services/write/players/index.js'
import {
  listExistingTeamRootOptions,
  readTeamSeasonRosterHistory,
} from '../../../../../../services/read/index.js'
import {
  ROSTER_IMPORT_MODE,
  buildRosterSnapshotContentHash,
  buildRosterSnapshotEventKey,
  mergeLocalAndResolvedPlayers,
  resolveRosterPlayersLocally,
} from '../../../../../../domain/movement/index.js'
import { resolveTeamLookupKey } from '../../../../../../model/team/teamIdentity.model.js'
import { SNACK_STATUS } from '../../../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  parsePlayerRosterRows,
  resolveRosterImportMetadata,
} from '../logic/teamRosterImport.logic.js'
import { buildWriteReportFromError } from '../../../logic/writeFlowReport.logic.js'
import useRosterIdentityReview from './useRosterIdentityReview.js'
import useRosterMovementReview from './useRosterMovementReview.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const playerMatchKeys = player => [
  clean(player?.playerId),
  clean(player?.externalPlayerId),
  clean(player?.identityKey),
  clean(player?.fullName).toLowerCase(),
].filter(Boolean)
const playerMatches = (left, right) => {
  const rightKeys = new Set(playerMatchKeys(right))
  return playerMatchKeys(left).some(key => rightKeys.has(key))
}

export default function useTeamRosterImport({
  leagueId,
  leagueDoc,
  leagueDocuments = [],
  team,
  seasonOptions = [],
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedSeasonOptionKey, setSelectedSeasonOptionKey] = React.useState('')
  const [pasteValue, setPasteValue] = React.useState('')
  const [rows, setRows] = React.useState([])
  const [previousRoster, setPreviousRoster] = React.useState({
    loading: false,
    seasonKey: '',
    players: [],
  })
  const [missingRosterPlayers, setMissingRosterPlayers] = React.useState([])
  const [teamRootOptions, setTeamRootOptions] = React.useState([])
  const [busy, setBusy] = React.useState(false)
  const [writeReport, setWriteReport] = React.useState(null)

  const selectedSeasonOption = React.useMemo(() => (
    seasonOptions.find(option => option.optionKey === selectedSeasonOptionKey) || null
  ), [seasonOptions, selectedSeasonOptionKey])
  const actionLeagueId = selectedSeasonOption?.leagueId || leagueId
  const actionLeagueDoc = React.useMemo(() => (
    leagueDocuments.find(document => (
      String(document?.id || document?.leagueId || '').trim() === String(actionLeagueId || '').trim()
    )) || leagueDoc
  ), [actionLeagueId, leagueDoc, leagueDocuments])

  const buildSeason = React.useCallback(() => ({
    ...(selectedSeasonOption?.season || {}),
    leagueId: actionLeagueId,
    ageGroupId: team.ageGroupId,
    birthYear: team.birthYear,
    seasonId: selectedSeasonOption?.seasonId,
    seasonKey: selectedSeasonOption?.seasonKey,
  }), [actionLeagueId, selectedSeasonOption, team.ageGroupId, team.birthYear])

  const selectSeasonOption = React.useCallback(optionKey => {
    setSelectedSeasonOptionKey(optionKey)
    setRows([])
    setMissingRosterPlayers([])
    setTeamRootOptions([])
    setPasteValue('')
    const option = seasonOptions.find(item => item.optionKey === optionKey)

    if (!option) {
      setPreviousRoster({ loading: false, seasonKey: '', players: [] })
      return
    }

    setPreviousRoster({ loading: true, seasonKey: '', players: [] })

    readTeamSeasonRosterHistory({
      birthTeamDocumentId: resolveTeamLookupKey(team),
      seasonKey: option.seasonKey,
    })
      .then(history => {
        const previousSeason = history?.previousSeason || null
        setPreviousRoster({
          loading: false,
          seasonKey: previousSeason?.seasonKey || '',
          players: Array.isArray(previousSeason?.teamPlayers)
            ? previousSeason.teamPlayers
            : [],
        })
      })
      .catch(error => {
        console.error('[playersDatabase/previous-roster-preview]', error)
        setPreviousRoster({ loading: false, seasonKey: '', players: [] })
      })
  }, [seasonOptions, team])

  const openModal = React.useCallback(() => {
    setSelectedSeasonOptionKey('')
    setPasteValue('')
    setRows([])
    setMissingRosterPlayers([])
    setTeamRootOptions([])
    setPreviousRoster({ loading: false, seasonKey: '', players: [] })
    setOpen(true)
  }, [])

  const parse = React.useCallback(async () => {
    const parsedRows = parsePlayerRosterRows(pasteValue)

    if (!parsedRows.length || !selectedSeasonOption) {
      setRows(parsedRows)
      return parsedRows
    }

    setBusy(true)

    try {
      const season = buildSeason()
      const rosterHistory = await readTeamSeasonRosterHistory({
        birthTeamDocumentId: resolveTeamLookupKey(team),
        seasonKey: season.seasonKey,
      })
      const currentKnownPlayers = [
        ...(Array.isArray(rosterHistory.currentSeason?.teamPlayers)
          ? rosterHistory.currentSeason.teamPlayers
          : []),
        ...(Array.isArray(rosterHistory.currentSeason?.pendingPlayers)
          ? rosterHistory.currentSeason.pendingPlayers
          : []),
      ]
      const previousPlayers = Array.isArray(rosterHistory.previousSeason?.teamPlayers)
        ? rosterHistory.previousSeason.teamPlayers
        : []
      const hasPreviousRoster = previousPlayers.length > 0
      const localResolution = resolveRosterPlayersLocally({
        players: parsedRows,
        currentPlayers: currentKnownPlayers,
        previousPlayers,
      })
      const unresolvedPlayers = localResolution.unresolved.map(entry => entry.player)
      const broadPreviewRows = unresolvedPlayers.length
        ? await resolveTeamPlayerIdentityPreview({
          players: unresolvedPlayers,
          season,
        })
        : []
      const localPreviewRows = localResolution.resolved.map(entry => ({
        ...entry,
        player: {
          ...entry.player,
          identityStatus: 'זוהה שחקן קיים',
          identityMessage: 'לפי סגל הקבוצה',
          identityValid: true,
        },
      }))
      const previewRows = mergeLocalAndResolvedPlayers({
        totalCount: parsedRows.length,
        localResolved: localPreviewRows,
        broadResolved: broadPreviewRows,
        unresolved: localResolution.unresolved,
      })

      const previewRowsWithRosterMembership = previewRows.map(previewRow => {
        const rosterPreviousMatch = hasPreviousRoster
          ? previousPlayers.some(previousPlayer => playerMatches(previousPlayer, previewRow))
          : null
        return {
          ...previewRow,
          rosterPreviousMatch,
        }
      })

      setRows(previewRowsWithRosterMembership)
      const matchedPreviousPlayers = previousPlayers.filter(previousPlayer => (
        previewRowsWithRosterMembership.some(previewRow => playerMatches(previousPlayer, previewRow))
      ))
      setMissingRosterPlayers(previousPlayers
        .filter(player => clean(player?.rosterStatus || 'regular') === 'regular')
        .filter(previousPlayer => !matchedPreviousPlayers.some(player => playerMatches(previousPlayer, player)))
        .map(player => ({ ...player, statsMovementTeam: null })))
      setTeamRootOptions(await listExistingTeamRootOptions({
        seasonKey: season.seasonKey,
        ageGroupId: team.ageGroupId,
        birthYear: team.birthYear,
        excludedBirthTeamDocumentId: resolveTeamLookupKey(team),
      }))
      return previewRowsWithRosterMembership
    } catch (error) {
      console.error('[playersDatabase/identity-preview]', error)
      const failedRows = parsedRows.map(row => ({
        ...row,
        identityStatus: 'נדרשת בדיקה',
        identityMessage: 'בדיקת הזהות נכשלה',
        identityValid: false,
      }))
      setRows(failedRows)
      setMissingRosterPlayers([])
      return failedRows
    } finally {
      setBusy(false)
    }
  }, [
    buildSeason,
    pasteValue,
    selectedSeasonOption,
    team,
  ])

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

  const {
    identityReview,
    openIdentityReview,
    closeIdentityReview,
    resolveIdentityReview,
  } = useRosterIdentityReview({
    rows,
    setRows,
  })

  const getRowStatus = React.useCallback(row => {
    if (row?.identityValid === false) {
      return { valid: false, message: row.identityMessage || 'נדרשת בדיקת זהות' }
    }
    const rosterResolution = clean(row?.rosterImportResolution)
    const isInternalRosterResolution = [
      'confirmedInRoster',
      'priorAgeException',
    ].includes(rosterResolution)
    if (
      row?.rosterPreviousMatch === false &&
      !isInternalRosterResolution &&
      !clean(row?.statsMovementTeam?.birthTeamDocumentId)
    ) {
      return { valid: false, message: 'לא הופיע בסגל הקודם — בחר קבוצת מקור כדי לאשר הצטרפות' }
    }
    return { valid: true, message: '' }
  }, [])

  const hasIdentityErrors = rows.some(row => getRowStatus(row).valid === false)

  const {
    hasMissingRosterApprovals,
    setIncomingRosterPlayerSource,
    setIncomingRosterPlayerResolution,
    setMissingRosterPlayerTarget,
    setMissingRosterPlayerResolution,
  } = useRosterMovementReview({
    setRows,
    missingRosterPlayers,
    setMissingRosterPlayers,
  })

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
    if (!selectedSeasonOption || hasIdentityErrors || !hasMissingRosterApprovals) return

    setBusy(true)

    try {
      const rosterMetadata = resolveRosterImportMetadata({ rows })
      const contentHash = buildRosterSnapshotContentHash({
        seasonKey: selectedSeasonOption.seasonKey,
        birthTeamDocumentId: resolveTeamLookupKey(team),
        players: rows,
      })
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS,
        payload: {
          target: selectedSeasonOption.target,
          league: {
            ...(actionLeagueDoc || {}),
            id: actionLeagueId,
            leagueId: actionLeagueId,
          },
          season: buildSeason(),
          team,
          rosterImport: {
            mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
            sourceSnapshotKey: rosterMetadata.sourceSnapshotKey || buildRosterSnapshotEventKey({ contentHash }),
            sourceSnapshotKeyExplicit: Boolean(rosterMetadata.sourceSnapshotKey),
            contentHash,
            effectiveAt: rosterMetadata.effectiveAt || null,
          },
          players: rows,
          missingPlayers: missingRosterPlayers
            .filter(player => clean(player?.playerId))
            .filter(player => (
              clean(player?.missingResolution) === 'olderAgeException' ||
              clean(player?.statsMovementTeam?.birthTeamDocumentId)
            )),
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
    hasMissingRosterApprovals,
    actionLeagueDoc,
    actionLeagueId,
    notify,
    reload,
    rows,
    missingRosterPlayers,
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
    previousRoster,
    missingRosterPlayers,
    teamRootOptions,
    busy,
    writeReport,
    hasIdentityErrors,
    hasMissingRosterApprovals,
    openModal,
    selectSeasonOption,
    setPasteValue,
    clearPaste,
    parse,
    changeCell,
    identityReview,
    openIdentityReview,
    closeIdentityReview,
    resolveIdentityReview,
    getRowStatus,
    setIncomingRosterPlayerSource,
    setIncomingRosterPlayerResolution,
    setMissingRosterPlayerTarget,
    setMissingRosterPlayerResolution,
    close,
    closeWriteReport,
    confirm,
  }
}
