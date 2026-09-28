// src/features/playersDatabase/domain/rosterV2/clear/rosterAbsent.builder.js

export const EMPTY_ROSTER_IMPORT = Object.freeze({
  mode: 'AUTHORITATIVE_SNAPSHOT',
  sourceSnapshotKey: '',
  contentHash: '',
  effectiveAt: null,
})

export const ROSTER_CLEAR_FIELDS = Object.freeze([
  'teamPlayers',
  'playersCount',
  'pendingPlayers',
  'transfersIn',
  'transfersOut',
  'rosterImport',
])

export const buildRosterAbsentState = teamSeason => ({
  ...teamSeason,
  teamPlayers: [],
  playersCount: 0,
  pendingPlayers: [],
  transfersIn: [],
  transfersOut: [],
  rosterImport: { ...EMPTY_ROSTER_IMPORT },
})

export const getTeamSeasonRosterState = (teamSeason = {}) => {
  const metadata = teamSeason.rosterImport
  const empty = (
    Array.isArray(teamSeason.teamPlayers) && teamSeason.teamPlayers.length === 0 &&
    teamSeason.playersCount === 0 &&
    Array.isArray(teamSeason.pendingPlayers) && teamSeason.pendingPlayers.length === 0 &&
    Array.isArray(teamSeason.transfersIn) && teamSeason.transfersIn.length === 0 &&
    Array.isArray(teamSeason.transfersOut) && teamSeason.transfersOut.length === 0 &&
    metadata && Object.keys(metadata).length === Object.keys(EMPTY_ROSTER_IMPORT).length &&
    Object.entries(EMPTY_ROSTER_IMPORT).every(([key, value]) => metadata[key] === value)
  )

  return empty ? 'absent' : 'present'
}
