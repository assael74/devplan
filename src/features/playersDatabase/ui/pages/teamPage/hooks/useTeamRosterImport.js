// features/playersDatabase/ui/pages/teamPage/hooks/useTeamRosterImport.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { resolveTeamPlayerIdentityPreview } from '../../../../services/write/players/index.js'
import {
  listExistingTeamRootOptions,
  readPlayerIdentityReview,
  readTeamSeasonRosterHistory,
} from '../../../../services/read/index.js'
import {
  ROSTER_IMPORT_MODE,
  buildRosterSnapshotContentHash,
  buildRosterSnapshotEventKey,
  mergeLocalAndResolvedPlayers,
  resolveRosterPlayersLocally,
} from '../../../../domain/movement/index.js'
import { resolveTeamLookupKey } from '../../../../model/team/teamIdentity.model.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  parsePlayerRosterRows,
  resolveRosterImportMetadata,
} from '../logic/teamRosterImport.logic.js'
import { buildWriteReportFromError } from '../logic/writeFlowReport.logic.js'

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
  const [identityReview, setIdentityReview] = React.useState({
    open: false,
    rowIndex: -1,
    row: null,
    candidates: [],
    loading: false,
    error: '',
  })

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

  const hasMissingRosterApprovals = missingRosterPlayers.every(player => {
    const resolution = clean(player?.missingResolution)
    if (resolution === 'olderAgeException' || resolution === 'unknown') return true
    return resolution === 'left' && Boolean(player?.statsMovementTeam?.birthTeamDocumentId)
  })

  const setIncomingRosterPlayerSource = React.useCallback(({
    rowIndex,
    team: sourceTeam = null,
    decision = '',
  } = {}) => {
    setRows(currentRows => currentRows.map((row, index) => (
      index === rowIndex
        ? {
          ...row,
          statsMovementDecision: decision === 'joined' || sourceTeam ? 'joined' : '',
          statsMovementTeam: sourceTeam,
          rosterImportResolution: decision === 'joined' || sourceTeam ? 'joined' : '',
        }
        : row
    )))
  }, [])

  const setIncomingRosterPlayerResolution = React.useCallback(({ rowIndex, resolution = '' } = {}) => {
    setRows(currentRows => currentRows.map((row, index) => (
      index === rowIndex
        ? {
          ...row,
          rosterImportResolution: resolution,
          statsMovementDecision: resolution === 'joined' ? 'joined' : '',
          statsMovementTeam: null,
        }
        : row
    )))
  }, [])

  const setMissingRosterPlayerTarget = React.useCallback(({ playerKey, team: targetTeam = null } = {}) => {
    if (!playerKey) return
    setMissingRosterPlayers(currentPlayers => currentPlayers.map(player => (
      clean(player.playerId || player.externalPlayerId) === playerKey
        ? {
          ...player,
          missingResolution: targetTeam ? 'left' : '',
          statsMovementTeam: targetTeam,
        }
        : player
    )))
  }, [])

  const setMissingRosterPlayerResolution = React.useCallback(({ playerKey, resolution = '' } = {}) => {
    if (!playerKey) return
    setMissingRosterPlayers(currentPlayers => currentPlayers.map(player => (
      clean(player.playerId || player.externalPlayerId) === playerKey
        ? {
          ...player,
          missingResolution: resolution,
          statsMovementTeam: resolution === 'left' ? player.statsMovementTeam : null,
        }
        : player
    )))
  }, [])

  const closeWriteReport = React.useCallback(() => {
    setWriteReport(null)
  }, [])

  const clearPaste = React.useCallback(() => {
    if (busy) return

    setPasteValue('')
    setRows([])
  }, [busy])

  const inspectPayload = React.useCallback(() => {
    if (!selectedSeasonOption) return

    const previewPlayers = rows.length ? rows : parsePlayerRosterRows(pasteValue)
    const rosterMetadata = resolveRosterImportMetadata({ rows: previewPlayers })
    const contentHash = buildRosterSnapshotContentHash({
      seasonKey: selectedSeasonOption.seasonKey,
      birthTeamDocumentId: resolveTeamLookupKey(team),
      players: previewPlayers,
      missingPlayers: missingRosterPlayers
        .filter(player => clean(player?.playerId))
        .filter(player => clean(player?.statsMovementTeam?.birthTeamDocumentId)),
    })
    const payload = {
      mode: 'PREVIEW_ONLY',
      writesPerformed: false,
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
        sourceSnapshotKey: rosterMetadata.sourceSnapshotKey || '(generated-on-confirm)',
        contentHash,
        effectiveAt: rosterMetadata.effectiveAt || null,
      },
      players: previewPlayers,
      // Keep the debug payload identical to the confirm payload: missing
      // players are the outgoing-transfer decisions made in step 4.
      missingPlayers: missingRosterPlayers
        .filter(player => clean(player?.playerId))
        .filter(player => (
          clean(player?.missingResolution) === 'olderAgeException' ||
          clean(player?.statsMovementTeam?.birthTeamDocumentId)
        )),
    }

    console.group('[playersDatabase/roster-import] payload preview — no write')
    console.log('payload', payload)
    console.table(previewPlayers.map(player => ({
      index: player.index,
      fullName: player.fullName,
      externalPlayerId: player.externalPlayerId,
      playerUrl: player.playerUrl,
    })))
    console.groupEnd()
  }, [
    actionLeagueDoc,
    actionLeagueId,
    buildSeason,
    missingRosterPlayers,
    pasteValue,
    rows,
    selectedSeasonOption,
    team,
  ])

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
    inspectPayload,
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
