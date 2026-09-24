import { isSameSeason } from '../../../model/shared/season.model.js'
import { normalizeTeamIdentity } from '../../../model/team/teamIdentity.model.js'
import { buildSeasonKey, clean, toNumberOrZero } from './leagueDoc.js'

const hasFinite = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value))
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key)
const sumPlayers = rows => (Array.isArray(rows) ? rows : []).reduce((sum, row) => (
  hasFinite(row?.playersCount) ? sum + Number(row.playersCount) : sum
), 0)

export const buildLeagueTeamRosterSyncPlan = ({ league = {}, season = {}, team = {} } = {}) => {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const identity = normalizeTeamIdentity({ team })
  const birthTeamId = clean(identity.birthTeamId || identity.teamId || team.birthTeamDocumentId || team.id)
  const clubId = clean(identity.clubId || team.clubId)
  const requested = { seasonId, seasonKey }
  const current = league.current || null
  const history = Array.isArray(league.history) ? league.history : []
  const currentMatches = isSameSeason(current, requested)
  const historyIndex = history.findIndex(row => isSameSeason(row, requested))
  const sourceTarget = currentMatches ? 'current' : historyIndex >= 0 ? 'history' : ''
  const seasonRow = sourceTarget === 'current' ? current : sourceTarget === 'history' ? history[historyIndex] : null
  if (!seasonRow) return { target: { leagueId, seasonKey, sourceTarget }, patch: null, projectedLeague: league }

  const tableRank = Array.isArray(seasonRow.tableRank) ? seasonRow.tableRank : []
  const rowIndex = tableRank.findIndex(row => {
    const rowIdentity = normalizeTeamIdentity({ team: row })
    const rowTeamId = clean(rowIdentity.birthTeamId || rowIdentity.teamId || row?.birthTeamDocumentId || row?.id)
    const rowClubId = clean(rowIdentity.clubId || row?.clubId)
    return rowTeamId === birthTeamId || (!rowTeamId && clubId && rowClubId === clubId)
  })
  if (rowIndex < 0) return { target: { leagueId, seasonKey, sourceTarget }, patch: null, projectedLeague: league }

  const currentRow = tableRank[rowIndex] || {}
  const patch = {
    ...(clean(team.teamUrl) ? { teamUrl: clean(team.teamUrl) } : {}),
    ...(hasFinite(team.playersCount) ? { playersCount: Number(team.playersCount) } : {}),
    ...(hasOwn(team, 'hasPlayers') ? { hasPlayers: Boolean(team.hasPlayers) } : {}),
    ...(hasOwn(team, 'hasStats') ? { hasStats: Boolean(team.hasStats) } : {}),
    ...(hasOwn(team, 'statsComplete') ? { statsComplete: Boolean(team.statsComplete) } : {}),
  }
  const nextTableRank = tableRank.map((row, index) => index === rowIndex ? { ...row, ...patch } : row)
  const nextSeason = { ...seasonRow, tableRank: nextTableRank, playersCount: sumPlayers(nextTableRank) }
  const projectedLeague = sourceTarget === 'current'
    ? { ...league, current: nextSeason }
    : { ...league, history: history.map((row, index) => index === historyIndex ? nextSeason : row) }

  return {
    target: { leagueId, seasonKey, sourceTarget, birthTeamDocumentId: birthTeamId },
    expected: { rowKey: birthTeamId },
    patch,
    projectedLeague,
    seasonPlayersCount: toNumberOrZero(nextSeason.playersCount),
  }
}
