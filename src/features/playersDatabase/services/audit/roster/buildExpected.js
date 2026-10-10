// src/features/playersDatabase/services/audit/roster/buildExpected.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const list = value => Array.isArray(value) ? value : []

export const buildRosterAuditExpected = ({ approvedState = null } = {}) => {
  const state = object(approvedState)
  if (!Object.keys(state).length) {
    return { complete: false, reason: 'missing_approved_state', expected: null }
  }
  if (!clean(state.teamId) || !clean(state.teamSeasonDocumentId) || !clean(state.leagueId) || !clean(state.seasonId)) {
    return { complete: false, reason: 'missing_target_identity', expected: null }
  }

  return {
    complete: true,
    reason: '',
    expected: {
      canonical: object(state.canonical),
      counterparts: list(state.counterparts),
      counterpartClubsCenterProjections: list(state.counterpartClubsCenterProjections),
      playerSeasons: list(state.playerSeasons),
      playerSearchIndexes: object(state.playerSearchIndexes),
      leagueProjection: object(state.leagueProjection),
      leaguesCenterProjection: object(state.leaguesCenterProjection),
      clubsCenterProjection: object(state.clubsCenterProjection),
    },
  }
}

export default buildRosterAuditExpected
