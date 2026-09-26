// features/playersDatabase/ui/pages/teamPage/roster/import/hooks/useRosterMovementReview.js

import * as React from 'react'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export default function useRosterMovementReview({
  setRows,
  missingRosterPlayers,
  setMissingRosterPlayers,
}) {
  const hasMissingRosterApprovals = missingRosterPlayers.every(player => {
    const resolution = clean(player?.missingResolution)

    if (['olderAgeException', 'unknown'].includes(resolution)) {
      return true
    }

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
  }, [setRows])

  const setIncomingRosterPlayerResolution = React.useCallback(({
    rowIndex,
    resolution = '',
  } = {}) => {
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
  }, [setRows])

  const setMissingRosterPlayerTarget = React.useCallback(({
    playerKey,
    team: targetTeam = null,
  } = {}) => {
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
  }, [setMissingRosterPlayers])

  const setMissingRosterPlayerResolution = React.useCallback(({
    playerKey,
    resolution = '',
  } = {}) => {
    if (!playerKey) return

    setMissingRosterPlayers(currentPlayers => currentPlayers.map(player => (
      clean(player.playerId || player.externalPlayerId) === playerKey
        ? {
          ...player,
          missingResolution: resolution,
          statsMovementTeam: resolution === 'left'
            ? player.statsMovementTeam
            : null,
        }
        : player
    )))
  }, [setMissingRosterPlayers])

  return {
    hasMissingRosterApprovals,
    setIncomingRosterPlayerSource,
    setIncomingRosterPlayerResolution,
    setMissingRosterPlayerTarget,
    setMissingRosterPlayerResolution,
  }
}
